#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

echo "Fixing header card styling..."

# 1 — replace biomeHealth.bg usage in the header with a proper card surface
perl -0777 -i -pe '
s/\$\{biomeHealth\.bg\}[^`]*rounded[^`]*px-5 py-4/bg-white border rounded-2xl px-6 py-5 shadow-sm/g
' "$FILE"

# 2 — remove hover white fade entirely if still present
perl -0777 -i -pe '
s/hover:bg-white\/70//g
' "$FILE"

# 3 — remove cursor-pointer from header/main
perl -0777 -i -pe '
s/cursor-pointer//g
' "$FILE"

echo "Done."
