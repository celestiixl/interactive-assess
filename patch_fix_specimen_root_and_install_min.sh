#!/usr/bin/env bash
set -euo pipefail

ROOT="/workspaces/interactive-assess"
cd "$ROOT" || { echo "❌ repo not found at $ROOT"; exit 1; }

if [ -d "apps/web/src" ]; then
  WEB_SRC="apps/web/src"
elif [ -d "apps/web" ]; then
  WEB_SRC="apps/web"
else
  echo "❌ can't find apps/web or apps/web/src"
  exit 1
fi

echo "✅ WEB_SRC=$WEB_SRC"

mkdir -p "$WEB_SRC/lib/specimens" "$WEB_SRC/components/student"

cat > "$WEB_SRC/lib/specimens/texasSpecimens.ts" <<'TS'
export const TEXAS_SPECIMENS__PATCH_MARKER = "TEXAS_SPECIMENS__PATCH_MARKER";
export const TEXAS_SPECIMENS = {
  RC1: { title: "Texas Bluebonnet" },
  RC2: { title: "Kemp’s Ridley Sea Turtle" },
};
TS

cat > "$WEB_SRC/lib/specimens/unlocks.ts" <<'TS'
export const SPECIMEN_UNLOCKS__PATCH_MARKER = "SPECIMEN_UNLOCKS__PATCH_MARKER";
export const specimen_unlocks_v1 = "specimen_unlocks_v1";
TS

cat > "$WEB_SRC/components/student/SpecimenGrid.tsx" <<'TSX'
export const SPECIMENGRID__PATCH_MARKER = "SPECIMENGRID__PATCH_MARKER";
export default function SpecimenGrid() {
  return null;
}
TSX

echo ""
echo "== Verify files exist =="
ls -la "$WEB_SRC/lib/specimens/texasSpecimens.ts" "$WEB_SRC/lib/specimens/unlocks.ts" "$WEB_SRC/components/student/SpecimenGrid.tsx"

echo ""
echo "== Verify search hits =="
rg -n "SPECIMENGRID__PATCH_MARKER|TEXAS_SPECIMENS__PATCH_MARKER|SPECIMEN_UNLOCKS__PATCH_MARKER" "$WEB_SRC" || true
