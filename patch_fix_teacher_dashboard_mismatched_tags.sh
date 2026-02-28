#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/teacher/dashboard/page.tsx"

if [ ! -f "$FILE" ]; then
  echo "❌ file not found: $FILE"
  exit 1
fi

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# 1) Change the Item Bank anchor <a ...> to <Link ...>
perl -i -pe '
  s/<a(\s+[^>]*\bhref="\/teacher\/item-bank"[^>]*)>/<Link$1>/g;
  s/<\/Link>\s*$/<\/Link>/g;
' "$FILE"

# But after step 1, the closing tag for Item Bank is currently </Link> already (good).
# 2) Fix the Create Assessment button: its closing tag is </a> but it opened as <Link>
perl -i -pe '
  s/<\/a>\s*$/<\/Link>/g;
' "$FILE"

# 3) Replace any remaining href="/teacher/item-bank" inside Link with proper Link props only (keeps className etc.)
# (Next Link accepts href prop; old <a href> attributes should become Link href=)
perl -i -pe '
  s/<Link([^>]*?)\bhref="\/teacher\/item-bank"/<Link$1href="\/teacher\/item-bank"/g;
' "$FILE"

echo "✅ Fixed mismatched <a>/<Link> tags in: $FILE"
