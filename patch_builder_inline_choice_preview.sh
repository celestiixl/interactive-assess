#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

B="apps/web/src/app/teacher/builder/page.tsx"
STAMP="$(date +%Y%m%d_%H%M%S)"

if [[ ! -f "$B" ]]; then
  echo "❌ Missing: $B"
  exit 1
fi

cp -v "$B" "$B.bak_inline_choice_preview_$STAMP"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/teacher/builder/page.tsx")
s = p.read_text()

# Add helper renderer near top-level (before export default) if missing
if "function renderInlineChoicePreview" not in s:
    helper = r'''
function renderInlineChoicePreview(text: string, opts: Record<string, string[]>) {
  const parts: Array<{ t: "text" | "blank"; v: string }> = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = re.lastIndex;
    if (start > last) parts.push({ t: "text", v: text.slice(last, start) });
    parts.push({ t: "blank", v: (m[1] || "").trim() });
    last = end;
  }
  if (last < text.length) parts.push({ t: "text", v: text.slice(last) });

  return (
    <div className="text-base text-slate-900 leading-relaxed whitespace-pre-wrap">
      {parts.map((p, i) => {
        if (p.t === "text") return <span key={i}>{p.v}</span>;
        const list = (opts?.[p.v] || [p.v]).filter(Boolean);
        return (
          <span key={i} className="inline-flex items-center">
            <select className="mx-1 rounded-lg border bg-white px-2 py-1 text-sm shadow-sm">
              <option value="" disabled selected>
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
  );
}
'''
    # insert after PreviewCard function definition (good stable anchor)
    anchor = "function PreviewCard"
    idx = s.find(anchor)
    if idx != -1:
        # insert after the closing of PreviewCard (first occurrence of "}" after it)
        close = s.find("}", idx)
        close2 = s.find("}", close + 1)
        ins = s.find("\n", close2)
        if ins != -1:
            s = s[:ins+1] + helper + s[ins+1:]

# Patch the live preview prompt area: replace placeholder "Prompt preview..." block if present
# We’ll look for the right preview box that currently prints prompt or placeholder.
# Common pattern: {prompt ? prompt : "Prompt preview..."}
if "renderInlineChoicePreview" in s:
    # Replace the content inside the prompt preview container with conditional render
    s_new = re.sub(
        r'(\{)\s*prompt\s*\?\s*prompt\s*:\s*"Prompt preview\.\.\."\s*(\})',
        r'{type === "inline_choice" ? renderInlineChoicePreview(clozeText || "", clozeOptions || {}) : (prompt ? prompt : "Prompt preview...")}',
        s,
        count=1
    )
    if s_new != s:
        s = s_new
    else:
        # fallback: if it uses <div>Prompt preview...</div>
        s = s.replace(
            "Prompt preview...",
            '{type === "inline_choice" ? "Inline choice preview…" : "Prompt preview..."}'
        )

p.write_text(s)
print("✅ Builder preview patched: inline_choice renders dropdowns in Live preview")
PY

echo ""
echo "➡️ Restart dev server (recommended):"
echo "  rm -rf apps/web/.next"
echo "  (lsof -ti tcp:3002 | xargs -r kill -9) || true"
echo "  HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
