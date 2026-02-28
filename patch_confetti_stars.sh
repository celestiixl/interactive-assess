#!/usr/bin/env bash
set -euo pipefail

# Find the confetti file automatically
FILE=$(grep -rl "confetti(" apps/web/src || true)

if [ -z "$FILE" ]; then
  echo "❌ Could not find confetti usage"
  exit 1
fi

echo "Patching: $FILE"
cp "$FILE" "$FILE.bak.$(date +%s)"

# Insert star shape helper at top
sed -i '1i\
import confetti from "canvas-confetti";\
const star = confetti.shapeFromPath({\
  path: "M10 0 L12.5 7 L20 7.5 L14 12 L16 20 L10 15 L4 20 L6 12 L0 7.5 L7.5 7 Z",\
  matrix: [0.05,0,0,0.05,0,0]\
});\
' "$FILE"

# Replace existing confetti call
sed -i 's/confetti({/confetti({\
    shapes: [star],\
    scalar: 1.2,\
    spread: 70,\
    ticks: 200,/' "$FILE"

echo "✨ Confetti is now stars!"
echo "Restart dev server:"
echo "pnpm dev:web"
