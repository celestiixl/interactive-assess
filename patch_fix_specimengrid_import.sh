#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/workspaces/interactive-assess}"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ not found: $FILE"
  echo "   find the right file with:"
  echo "   rg -n \"<SpecimenGrid\" -S apps/web"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

if rg -q 'import\s+SpecimenGrid\s+from' "$FILE"; then
  echo "✅ SpecimenGrid import already present."
  exit 0
fi

# Pick import style based on what the file already uses
IMPORT_LINE='import SpecimenGrid from "@/components/student/SpecimenGrid";'
if rg -q 'from\s+"@/' "$FILE"; then
  IMPORT_LINE='import SpecimenGrid from "@/components/student/SpecimenGrid";'
elif rg -q 'from\s+"\.\./\.\./\.\./\.\./components/student/MasteryDonut"' "$FILE"; then
  IMPORT_LINE='import SpecimenGrid from "../../../../components/student/SpecimenGrid";'
else
  IMPORT_LINE='import SpecimenGrid from "../../../../components/student/SpecimenGrid";'
fi

TMP="$(mktemp)"
awk -v ins="$IMPORT_LINE" '
  BEGIN { last=0; }
  { lines[NR]=$0; if ($0 ~ /^import[[:space:]]/) last=NR; }
  END {
    if (last==0) {
      print ins;
      for (i=1; i<=NR; i++) print lines[i];
    } else {
      for (i=1; i<=NR; i++) {
        print lines[i];
        if (i==last) print ins;
      }
    }
  }
' "$FILE" > "$TMP"

mv "$TMP" "$FILE"
echo "✅ Added import: $IMPORT_LINE"
