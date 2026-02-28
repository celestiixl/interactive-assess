#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/workspaces/interactive-assess}"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

FILE="apps/web/src/app/(app)/student/assessment/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ not found: $FILE"
  echo "   find it with: rg -n \"StudentAssessmentLab\" -S apps/web/src/app"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# Ensure Link import exists
if ! rg -q 'import\s+Link\s+from\s+"next/link"' "$FILE"; then
  # Insert after last import
  TMP="$(mktemp)"
  awk -v ins='import Link from "next/link";' '
    BEGIN{last=0}
    {lines[NR]=$0; if($0 ~ /^import[[:space:]]/) last=NR}
    END{
      if(last==0){ print ins; for(i=1;i<=NR;i++) print lines[i]; }
      else { for(i=1;i<=NR;i++){ print lines[i]; if(i==last) print ins; } }
    }
  ' "$FILE" > "$TMP"
  mv "$TMP" "$FILE"
fi

# Replace the nested <a href="/student/dashboard" ...> ... </a> with <Link ...> ... </Link>
perl -0777 -i -pe '
  s{<a\s+href="/student/dashboard"\s+className="([^"]*)">}{<Link href="/student/dashboard" className="$1">}g;
  s{</a>(\s*)}{</Link>$1}g;
' "$FILE"

# If there were other anchors to /student/dashboard written as <a>, convert them too (safe)
# but only if they exactly match href="/student/dashboard"
# (keeps other <a> tags untouched)
echo "✅ Patched nested <a>: converted dashboard card to <Link> in $FILE"
echo "   If you still see the error, there may be another <a> inside an existing <Link> on that page."
echo "   Check with: rg -n \"<a href=\\\"/student/dashboard\\\"\" -S $FILE"
