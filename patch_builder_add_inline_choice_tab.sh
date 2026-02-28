#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || exit 1

SRC="apps/web/src"
[ -d "$SRC" ] || SRC="apps/web"

# builder page/component finder
BUILDER_FILE="$(
  rg -l --hidden --glob '!.next/**' --glob '!dist/**' --glob '!node_modules/**' \
  'Teacher Question Builder|Item type' "$SRC" | head -n 1
)"
[ -f "${BUILDER_FILE:-}" ] || exit 1

cp -a "$BUILDER_FILE" "$BUILDER_FILE.bak.$(date +%Y%m%d_%H%M%S)"

# InlineChoiceBuilder component (eduphoria-style: clozeText + [[blankId]] + per-blank options)
COMP_DIR="$SRC/components/teacher"
mkdir -p "$COMP_DIR"

cat > "$COMP_DIR/InlineChoiceBuilder.tsx" <<'TSX'
"use client";

import { useMemo } from "react";

type Opt = { id: string; label: string };
type Blank = { id: string; options: Opt[] };

function parseBlankIds(text: string) {
  const re = /\[\[([^\]]+)\]\]/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push((m[1] || "").trim());
  return Array.from(new Set(out.filter(Boolean)));
}

export default function InlineChoiceBuilder({
  item,
  onPatch,
}: {
  item: any;
  onPatch: (patch: any) => void;
}) {
  const clozeText: string = String(item?.clozeText ?? "");
  const blanks: Blank[] = Array.isArray(item?.blanks) ? item.blanks : [];

  const idsInText = useMemo(() => parseBlankIds(clozeText), [clozeText]);

  function setText(v: string) {
    const ids = parseBlankIds(v);
    const nextBlanks: Blank[] = ids.map((id) => {
      const found = blanks.find((b: any) => String(b?.id) === id);
      return found
        ? { id, options: Array.isArray(found.options) ? found.options : [] }
        : { id, options: [{ id: "A", label: "Choice A" }, { id: "B", label: "Choice B" }] };
    });
    onPatch({ type: "inline-choice", clozeText: v, blanks: nextBlanks });
  }

  function setOption(blankId: string, optIdx: number, key: "id" | "label", v: string) {
    const next = blanks.map((b: any) => {
      if (String(b?.id) !== blankId) return b;
      const opts = Array.isArray(b.options) ? b.options.slice() : [];
      opts[optIdx] = { ...(opts[optIdx] || { id: "", label: "" }), [key]: v };
      return { ...b, options: opts };
    });
    onPatch({ blanks: next });
  }

  function addOption(blankId: string) {
    const next = blanks.map((b: any) => {
      if (String(b?.id) !== blankId) return b;
      const opts = Array.isArray(b.options) ? b.options.slice() : [];
      const n = opts.length + 1;
      const id = String.fromCharCode(64 + Math.min(26, n));
      opts.push({ id, label: `Choice ${n}` });
      return { ...b, options: opts };
    });
    onPatch({ blanks: next });
  }

  function removeOption(blankId: string, optIdx: number) {
    const next = blanks.map((b: any) => {
      if (String(b?.id) !== blankId) return b;
      const opts = Array.isArray(b.options) ? b.options.slice() : [];
      opts.splice(optIdx, 1);
      return { ...b, options: opts };
    });
    onPatch({ blanks: next });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm font-medium">Cloze text</div>
        <div className="text-xs text-muted-foreground">Use [[blankId]] where choices should appear.</div>
        <textarea
          className="w-full min-h-[120px] rounded-xl border bg-background p-3 text-sm"
          value={clozeText}
          onChange={(e) => setText(e.target.value)}
          placeholder='Example: A heterozygous genotype is [[b1]] and a homozygous recessive genotype is [[b2]].'
        />
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Blanks</div>

        {idsInText.length === 0 ? (
          <div className="text-sm text-muted-foreground">Add at least one [[blankId]] in the text.</div>
        ) : (
          idsInText.map((id) => {
            const blank = blanks.find((b: any) => String(b?.id) === id) as Blank | undefined;
            const options = blank?.options ?? [];

            return (
              <div key={id} className="rounded-2xl border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">Blank: {id}</div>
                  <button
                    type="button"
                    className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
                    onClick={() => addOption(id)}
                  >
                    Add choice
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((o, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        className="col-span-2 rounded-xl border bg-background px-3 py-2 text-sm"
                        value={String(o?.id ?? "")}
                        onChange={(e) => setOption(id, idx, "id", e.target.value)}
                        placeholder="ID"
                      />
                      <input
                        className="col-span-9 rounded-xl border bg-background px-3 py-2 text-sm"
                        value={String(o?.label ?? "")}
                        onChange={(e) => setOption(id, idx, "label", e.target.value)}
                        placeholder="Choice text"
                      />
                      <button
                        type="button"
                        className="col-span-1 rounded-xl border px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => removeOption(id, idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
TSX

python - <<'PY'
import re, pathlib

p = pathlib.Path("/workspaces/interactive-assess")
# BUILDER_FILE was found by bash; re-find the same way in python for safety
src = p/"apps/web/src"
if not src.exists():
    src = p/"apps/web"

cands = []
for f in src.rglob("*.tsx"):
    s = f.read_text(errors="ignore")
    if "Teacher Question Builder" in s or "Item type" in s:
        cands.append(f)
builder = cands[0] if cands else None
if not builder:
    raise SystemExit(1)

t = builder.read_text()

# import
if "InlineChoiceBuilder" not in t:
    m = re.search(r"(^import[^\n]*\n)+", t, re.M)
    if m:
        ins = m.group(0) + 'import InlineChoiceBuilder from "@/components/teacher/InlineChoiceBuilder";\n'
        t = t.replace(m.group(0), ins, 1)
    else:
        t = 'import InlineChoiceBuilder from "@/components/teacher/InlineChoiceBuilder";\n' + t

# ITEM_TYPES array
if re.search(r"ITEM_TYPES\s*=\s*\[", t) and "inline-choice" not in t:
    t = re.sub(r"(ITEM_TYPES\s*=\s*\[\s*)", r'\1{ key: "inline-choice", label: "Inline Choice" },\n', t, count=1)

# segmented buttons: insert after Hotspot button if present
if "Inline Choice" not in t and "Hotspot" in t and "Multiple Choice" in t and "Card Sort" in t:
    # try to find first Hotspot </button> and insert
    t = re.sub(
        r"(?s)(Hotspot.*?</button>)",
        r'\1\n\n            <button type="button" onClick={() => setItemType("inline-choice")} className={itemType === "inline-choice" ? activeClassName : inactiveClassName}>Inline Choice</button>',
        t,
        count=1,
    )

# render: switch(itemType)
if "inline-choice" not in t and re.search(r"switch\s*\(\s*itemType\s*\)", t):
    t = re.sub(
        r"(switch\s*\(\s*itemType\s*\)\s*\{\s*)",
        r'\1case "inline-choice":\n        return <InlineChoiceBuilder item={item} onPatch={(patch:any)=>setItem((prev:any)=>({ ...prev, ...patch, type: "inline-choice" }))} />;\n',
        t,
        count=1,
    )

# render: conditional blocks
if "InlineChoiceBuilder" in t and "inline-choice" not in t:
    t = re.sub(
        r"(?s)(\{itemType\s*===\s*\"hotspot\".*?\}\s*)",
        r'\1\n{itemType === "inline-choice" && (\n  <InlineChoiceBuilder item={item} onPatch={(patch:any)=>setItem((prev:any)=>({ ...prev, ...patch, type: "inline-choice" }))} />\n)}\n',
        t,
        count=1,
    )

builder.write_text(t)
print(str(builder))
PY
