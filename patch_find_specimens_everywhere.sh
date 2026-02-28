#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/workspaces/interactive-assess}"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

echo "== 1) Confirm files exist =="
ls -la apps/web/src/components/student/SpecimenGrid.tsx 2>/dev/null || echo "❌ missing: apps/web/src/components/student/SpecimenGrid.tsx"
ls -la apps/web/src/lib/specimens/texasSpecimens.ts 2>/dev/null || echo "❌ missing: apps/web/src/lib/specimens/texasSpecimens.ts"
ls -la apps/web/src/lib/specimens/unlocks.ts 2>/dev/null || echo "❌ missing: apps/web/src/lib/specimens/unlocks.ts"

echo ""
echo "== 2) Find any usage (fallback if rg output was confusing) =="

if command -v rg >/dev/null 2>&1; then
  echo "-- ripgrep results --"
  rg -n "SpecimenGrid|TEXAS_SPECIMENS|specimen_unlocks_v1|texasSpecimens" apps/web || true
else
  echo "-- rg not installed; using grep --"
  grep -RInE "SpecimenGrid|TEXAS_SPECIMENS|specimen_unlocks_v1|texasSpecimens" apps/web || true
fi

echo ""
echo "== 3) If nothing prints above, list the folders we wrote to =="
find apps/web/src -maxdepth 4 -type d \( -path "*/lib/specimens" -o -path "*/components/student" \) -print 2>/dev/null || true

echo ""
echo "✅ Done."
echo "If those files are missing, re-run: ./patch_add_texas_specimens.sh"
