#!/usr/bin/env bash
set -euo pipefail

ROOT="/workspaces/interactive-assess"
cd "$ROOT"

WEB_SRC="apps/web/src"

if [ ! -d "$WEB_SRC" ]; then
  echo "❌ apps/web/src not found"
  exit 1
fi

mkdir -p "$WEB_SRC/lib/specimens"
mkdir -p "$WEB_SRC/components/student"

cat > "$WEB_SRC/lib/specimens/texasSpecimens.ts" <<'TS'
export const TEXAS_SPECIMENS = {
  RC1: { title: "Texas Bluebonnet" },
  RC2: { title: "Kemp’s Ridley Sea Turtle" },
};
TS

cat > "$WEB_SRC/lib/specimens/unlocks.ts" <<'TS'
export const specimen_unlocks_v1 = true;
TS

cat > "$WEB_SRC/components/student/SpecimenGrid.tsx" <<'TSX'
export default function SpecimenGrid() {
  return null;
}
TSX

echo "✅ minimal Texas specimen files created"
