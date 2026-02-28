#!/usr/bin/env bash
set -euo pipefail

FILE="/workspaces/interactive-assess/apps/web/src/components/items/InlineChoice.tsx"
[ -f "$FILE" ] || { echo "❌ not found: $FILE"; exit 1; }

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"
echo "✅ backup made"

# Fix the bad JSX-ish token inside useState initializer: {} />
perl -i -pe 's/useState<\s*Record<string,\s*string>\s*>\s*\(\s*\{\}\s*\/>\s*\)/useState<Record<string, string>>({})/g' "$FILE"

# Also handle spacing variants
perl -i -pe 's/\{\}\s*\/>\s*\)/{})/g' "$FILE"

echo "✅ fixed parse error in InlineChoice.tsx"
