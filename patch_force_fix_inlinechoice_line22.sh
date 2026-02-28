#!/usr/bin/env bash
set -euo pipefail

FILE="/workspaces/interactive-assess/apps/web/src/components/items/InlineChoice.tsx"
[ -f "$FILE" ] || exit 1

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

perl -i -pe '
  if(/useState<Record<string,\s*string>>\(\{\}\s*\/>\s*\)/){
    $_="  const [resp, setResp] = useState<Record<string, string>>({});\n";
  }
' "$FILE"

perl -i -pe 's/useState<Record<string,\s*string>>\(\{\}\s*\/>\s*\)/useState<Record<string, string>>({})/g' "$FILE"
