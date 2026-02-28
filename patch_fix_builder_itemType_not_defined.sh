#!/usr/bin/env bash
set -euo pipefail

FILE="/workspaces/interactive-assess/apps/web/src/app/(app)/teacher/builder/page.tsx"
[ -f "$FILE" ] || exit 1

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# remove the injected block that references itemType (it was inserted in the wrong spot)
perl -0777 -i -pe 's@\{itemType === "inline-choice" && \(\s*<div className="mt-4">[\s\S]*?</div>\s*\)\}\s*@@g' "$FILE"

# insert a safe itemType definition near the top of the component body (after setItem exists)
# itemType will follow item.type, defaulting to "multiple-choice"
perl -0777 -i -pe '
  if(!/const\s+itemType\s*=/){
    s@(function\s+TeacherBuilderPage[\s\S]*?\{\s*)([\s\S]*?)@${1}const itemType = String((item as any)?.type ?? "multiple-choice");\n$2@ if $1;
  }
' "$FILE"

