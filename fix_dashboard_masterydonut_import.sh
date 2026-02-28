#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# replace the bad relative import with the alias import
perl -0777 -i -pe '
  s|import\s+\{\s*MasteryDonut\s*\}\s+from\s+"[^"]*MasteryDonut";|import MasteryDonut from "@/components/student/MasteryDonut";|g;
' "$FILE"

echo "✅ fixed dashboard import"
echo "➡️ pnpm --filter web dev"
