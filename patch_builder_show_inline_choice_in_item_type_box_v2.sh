#!/usr/bin/env bash
set -euo pipefail

ROOT="/workspaces/interactive-assess"
SRC="$ROOT/apps/web/src"
[ -d "$SRC" ] || SRC="$ROOT/apps/web"

FILE="$(rg -l --hidden --glob '!.next/**' --glob '!dist/**' --glob '!node_modules/**' \
  'Teacher Question Builder|Item type|Multiple Choice|Card Sort|Hotspot' "$SRC" | head -n 1)"
[ -f "${FILE:-}" ] || exit 1

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# import InlineChoiceBuilder
if ! rg -q 'InlineChoiceBuilder' "$FILE"; then
  perl -0777 -i -pe 's@(^\s*import[\s\S]*?;\s*)@$1import InlineChoiceBuilder from "@/components/teacher/InlineChoiceBuilder";\n@ms' "$FILE"
fi

# add Inline Choice button after Hotspot button (clone the Hotspot button and swap pieces)
if ! rg -q 'Inline Choice' "$FILE"; then
  perl -0777 -i -pe '
    if(/Hotspot/){
      s@(<button[^>]*>[\s\S]*?Hotspot[\s\S]*?</button>)@$1\n\n$1@s;
      s@Hotspot@Inline Choice@ if $.==0;
    }
  ' "$FILE"

  # fix handler + selection in the cloned button
  perl -0777 -i -pe '
    my $n=0;
    s/(Inline Choice[\s\S]*?setItemType\()\s*([\"\x27])hotspot\2/\1"inline-choice"/g;
    s/(Inline Choice[\s\S]*?itemType\s*===\s*)([\"\x27])hotspot\2/\1"inline-choice"/g;
  ' "$FILE" || true
fi

# ensure clicking Inline Choice stamps item.type too (best effort)
perl -0777 -i -pe '
  s/setItemType\("inline-choice"\)/((setItemType("inline-choice")), setItem((prev:any)=>({ ...prev, type: "inline-choice" })))/g
' "$FILE" || true

# ensure editor panel exists somewhere (if not, add near Live preview label)
if ! rg -q 'itemType === "inline-choice"' "$FILE"; then
  perl -0777 -i -pe '
    s@(Live preview)@{itemType === "inline-choice" && (\n  <div className="mt-4">\n    <InlineChoiceBuilder item={item} onPatch={(patch:any)=>setItem((prev:any)=>({ ...prev, ...patch, type: "inline-choice" }))} />\n  </div>\n)}\n\n$1@;
  ' "$FILE"
fi

echo "$FILE"
