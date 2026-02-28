#!/usr/bin/env bash
set -euo pipefail

ROOT="/workspaces/interactive-assess"
SRC="$ROOT/apps/web/src"
[ -d "$SRC" ] || SRC="$ROOT/apps/web"

FILE="$(rg -l 'Live preview|Teacher Question Builder|EB supports' "$SRC" | head -n 1)"
[ -f "$FILE" ] || exit 1

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# ensure import
if ! rg -q 'InlineChoiceBuilder' "$FILE"; then
  perl -0777 -i -pe '
    s@(^\s*import[\s\S]*?;\s*)@$1import InlineChoiceBuilder from "@/components/teacher/InlineChoiceBuilder";\n@ms
  ' "$FILE"
fi

# inject render block after hotspot editor block
perl -0777 -i -pe '
  if(!/inline-choice/){
    s@(\{itemType\s*===\s*"hotspot"[\s\S]*?\}\))@$1\n\n{itemType === "inline-choice" && (\n  <InlineChoiceBuilder\n    item={item}\n    onPatch={(patch:any)=>setItem((prev:any)=>({ ...prev, ...patch, type: "inline-choice" }))}\n  />\n)}@m
  }
' "$FILE"
