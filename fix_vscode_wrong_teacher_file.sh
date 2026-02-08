#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

# You are editing apps/web/src/app/teacher/dashboard/page.tsx (WRONG tree).
# Delete it + close the error source.

rm -rf apps/web/src/app/teacher || true

echo "✅ deleted apps/web/src/app/teacher (wrong route tree)"
echo "Open the REAL file instead:"
echo "  apps/web/src/app/(app)/teacher/dashboard/page.tsx"
echo
echo "Quick view:"
sed -n '1,40p' apps/web/src/app/(app)/teacher/dashboard/page.tsx || true
