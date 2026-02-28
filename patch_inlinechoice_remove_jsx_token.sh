#!/usr/bin/env bash
set -euo pipefail

FILE="/workspaces/interactive-assess/apps/web/src/components/items/InlineChoice.tsx"
[ -f "$FILE" ] || exit 1

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# Replace the exact broken initializer and common spacing variants
perl -i -pe 's/useState<\s*Record<string,\s*string>\s*>\s*\(\s*\{\}\s*\/>\s*\)/useState<Record<string, string>>({})/g' "$FILE"
perl -i -pe 's/useState<Record<string,\s*string>>\(\{\}\s*\/>\s*\)/useState<Record<string, string>>({})/g' "$FILE"
perl -i -pe 's/\(\{\}\s*\/>\s*\)/({})/g if /useState<Record<string,\s*string>>/;' "$FILE"

# If it still exists, hard-replace the whole line containing "{} />"
perl -i -pe 'if(/\{\}\s*\/>\s*$/){ s@^.*$@  const [resp, setResp] = useState<Record<string, string>>({});@ }' "$FILE"

nl -ba "$FILE" | sed -n '18,30p'
