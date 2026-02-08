#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

IC="apps/web/src/components/items/InlineChoice.tsx"
P="apps/web/src/app/practice/page.tsx"
CHK="apps/web/src/app/api/check/route.ts"
STAMP="$(date +%Y%m%d_%H%M%S)"

# Backups
[[ -f "$P" ]] && cp -v "$P" "$P.bak_inline_choice_runtime_$STAMP" || true
[[ -f "$CHK" ]] && cp -v "$CHK" "$CHK.bak_inline_choice_runtime_$STAMP" || true

mkdir -p "$(dirname "$IC")"

# 1) Create InlineChoice component
cat > "$IC" <<'TSX'
"use client";

import { useMemo, useState } from "react";

type InlineChoiceItem = {
  id: string;
  type: "inline_choice";
  prompt?: string;
  clozeText: string;
  clozeOptions: Record<string, string[]>;
};

export default function InlineChoice({
  item,
  onChange,
  disabled,
}: {
  item: InlineChoiceItem;
  onChange?: (response: Record<string, string>) => void;
  disabled?: boolean;
}) {
  const [resp, setResp] = useState<Record<string, string>>({});

  const parts = useMemo(() => {
    const text = item.clozeText || "";
    const re = /\[\[([^\]]+)\]\]/g;
    const out: Array<{ t: "text" | "blank"; v: string }> = [];
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(text)) !== null) {
      const start = m.index;
      const end = re.lastIndex;
      if (start > last) out.push({ t: "text", v: text.slice(last, start) });
      out.push({ t: "blank", v: (m[1] || "").trim() });
      last = end;
    }
    if (last < text.length) out.push({ t: "text", v: text.slice(last) });
    return out;
  }, [item.clozeText]);

  function setBlank(blank: string, value: string) {
    setResp((prev) => {
      const next = { ...prev, [blank]: value };
      onChange?.(next);
      return next;
    });
  }

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      {item.prompt ? <div className="mb-3 text-sm font-semibold text-slate-900">{item.prompt}</div> : null}

      <div className="text-base text-slate-900 leading-relaxed whitespace-pre-wrap">
        {parts.map((p, i) => {
          if (p.t === "text") return <span key={i}>{p.v}</span>;

          const list = (item.clozeOptions?.[p.v] || [p.v]).filter(Boolean);
          const value = resp[p.v] || "";
          return (
            <span key={i} className="inline-flex items-center">
              <select
                className="mx-1 rounded-lg border bg-white px-2 py-1 text-sm shadow-sm disabled:opacity-60"
                value={value}
                disabled={!!disabled}
                onChange={(e) => setBlank(p.v, e.target.value)}
              >
                <option value="" disabled>
                  Select…
                </option>
                {list.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </span>
          );
        })}
      </div>
    </div>
  );
}
TSX

echo "✅ Wrote $IC"

# 2) Patch Practice page to render InlineChoice when item.type === "inline_choice"
python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/practice/page.tsx")
s = p.read_text()

# Ensure import exists
if 'InlineChoice' not in s:
    # Try to insert near other item imports
    s = re.sub(
        r'(from\s+"@/components/items/[^"]+";\s*\n)',
        r'\1',
        s
    )
    # add after last items import line
    lines = s.splitlines(True)
    insert_at = 0
    for i, line in enumerate(lines):
      if 'from "@/components/items/' in line:
        insert_at = i+1
    lines.insert(insert_at, 'import InlineChoice from "@/components/items/InlineChoice";\n')
    s = "".join(lines)

# Add state to hold inline choice response (if not present)
if "inlineChoiceResponse" not in s:
    # Insert near other response states: find first useState in component and add after it
    m = re.search(r'const\s+\[[^\]]+\]\s*=\s*useState<[^>]*>\([^)]*\);\s*\n', s)
    if m:
        ins = m.end()
        s = s[:ins] + '  const [inlineChoiceResponse, setInlineChoiceResponse] = useState<Record<string, string>>({});\n' + s[ins:]

# Insert renderer in the item render switch/if chain.
# We look for existing CardSort/DragDrop/Hotspot render and add an inline_choice branch.
if 'item.type === "inline_choice"' not in s:
    # common anchor: if (item.type === "dragdrop") ... else if ...
    # We'll inject before hotspot branch if possible.
    inject = r'''
        {item.type === "inline_choice" ? (
          <InlineChoice
            item={item as any}
            disabled={mode === "exam" && !!checked}
            onChange={(r) => setInlineChoiceResponse(r)}
          />
        ) : null}
'''
    # Try to place inside the "Your Work" panel where item UI is rendered.
    # Anchor: the first occurrence of <CardSort or <DragDrop
    anchor = s.find("<CardSort")
    if anchor == -1:
        anchor = s.find("<DragDrop")
    if anchor == -1:
        # last resort: append before closing of main render
        s = s + "\n" + inject
    else:
        # Insert just before first item component render
        s = s[:anchor] + inject + s[anchor:]

p.write_text(s)
print("✅ Practice patched: renders InlineChoice component")
PY

# 3) Patch /api/check to grade inline_choice
python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/api/check/route.ts")
s = p.read_text()

# Add grading block if missing
if "inline_choice" not in s:
    # We'll add an if branch in the handler after parsing item/response.
    # We search for a place where it switches on item.type or checks item.type.
    block = r'''
  if (item?.type === "inline_choice") {
    const correctByBlank: Record<string, string> = item.correctByBlank || {};
    const response: Record<string, string> = body?.response || body?.answer || {};

    const blanks = Object.keys(correctByBlank);
    const max = blanks.length || 0;
    let score = 0;

    for (const b of blanks) {
      const want = (correctByBlank[b] ?? b).toString().trim();
      const got = (response?.[b] ?? "").toString().trim();
      if (got && want && got === want) score += 1;
    }

    return Response.json({
      correct: score === max && max > 0,
      score,
      max,
      detail: { blanks, correctByBlank, response },
    });
  }

'''
    # Insert before an existing final return (fallback grading)
    s2 = re.sub(r'\n(\s*)return Response\.json\(\{', "\n" + block + r"\1return Response.json({", s, count=1)
    if s2 == s:
        # If no match, append near end of file
        s2 = s + "\n" + block
    s = s2

p.write_text(s)
print("✅ /api/check patched: grades inline_choice")
PY

echo ""
echo "➡️ Restart dev server (recommended):"
echo "  rm -rf apps/web/.next"
echo "  (lsof -ti tcp:3002 | xargs -r kill -9) || true"
echo "  HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
