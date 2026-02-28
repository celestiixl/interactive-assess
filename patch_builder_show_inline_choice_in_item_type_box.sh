#!/usr/bin/env bash
set -euo pipefail

ROOT="/workspaces/interactive-assess"
SRC="$ROOT/apps/web/src"
[ -d "$SRC" ] || SRC="$ROOT/apps/web"

FILE="$(rg -l --hidden --glob '!.next/**' --glob '!dist/**' --glob '!node_modules/**' \
  'Teacher Question Builder|Item type|Multiple Choice|Card Sort|Hotspot' "$SRC" | head -n 1)"

[ -f "${FILE:-}" ] || exit 1
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

python - <<'PY'
import re, pathlib

file = pathlib.Path(r"""'"$FILE"'""")
t = file.read_text(errors="ignore")

# Ensure InlineChoiceBuilder import (safe if already there)
if "InlineChoiceBuilder" not in t:
    t = re.sub(
        r"(^\s*import[\s\S]*?;\s*)",
        r'\1import InlineChoiceBuilder from "@/components/teacher/InlineChoiceBuilder";\n',
        t,
        count=1,
        flags=re.M
    )

# Inject the Inline Choice button into the segmented "Item type" row (after Hotspot)
if "Inline Choice" not in t:
    # Try to find a Hotspot button close and insert after it
    pat = r'(<button[^>]*>[\s\S]*?Hotspot[\s\S]*?</button>)'
    m = re.search(pat, t)
    if m:
        hotspot_btn = m.group(1)
        # Guess the active/inactive class variables if present, else keep existing button classes via copy
        # We clone the Hotspot button markup and swap label + onClick + selection test.
        clone = hotspot_btn
        clone = re.sub(r'Hotspot', 'Inline Choice', clone)
        clone = re.sub(r'setItemType\((["\'])hotspot\1\)', r'setItemType("inline-choice")', clone)
        clone = re.sub(r'itemType\s*===\s*(["\'])hotspot\1', r'itemType === "inline-choice"', clone)

        # If it still didn't change (different handler name), force minimal handler/selected logic
        if 'setItemType("inline-choice")' not in clone:
            clone = re.sub(r'onClick=\{\(\)\s*=>\s*[^}]+\}', 'onClick={() => setItemType("inline-choice")}', clone)
        if 'itemType === "inline-choice"' not in clone:
            clone = re.sub(r'itemType\s*===\s*["\']hotspot["\']', 'itemType === "inline-choice"', clone)

        t = t.replace(hotspot_btn, hotspot_btn + "\n" + clone, 1)

# Ensure selecting inline-choice also stamps item.type (best-effort)
if 'type: "inline-choice"' not in t:
    t = re.sub(
        r'setItemType\("inline-choice"\)',
        r'(setItemType("inline-choice"), setItem((prev:any)=>({ ...prev, type: "inline-choice" })))',
        t
    )

# Ensure there is an editor render for inline-choice somewhere
if "itemType === \"inline-choice\"" not in t and "switch (itemType" not in t and "switch(itemType" not in t:
    # Insert a simple block near the "Live preview" section so it appears on the page
    t = re.sub(
        r'(\bLive preview\b)',
        r'{itemType === "inline-choice" && (\n  <div className="mt-4">\n    <InlineChoiceBuilder item={item} onPatch={(patch:any)=>setItem((prev:any)=>({ ...prev, ...patch, type: "inline-choice" }))} />\n  </div>\n)}\n\n\1',
        t,
        count=1
    )

file.write_text(t)
print(file)
PY
