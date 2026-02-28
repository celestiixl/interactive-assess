#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Can't find $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text(encoding="utf-8")

# Find the .confetti span CSS rule and replace it with a star-shaped version
pattern = r'\.confetti span\s*\{\s*[^}]*\}\s*'
m = re.search(pattern, s, flags=re.S)

star_rule = r'''
        .confetti span {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 10px;
          height: 10px;
          background: var(--c, #22c55e);
          transform: translate(-50%, -50%) scale(0.6);
          opacity: 0;
          animation: confettiBurst 0.75s ease-out forwards;

          /* STAR SHAPE */
          border-radius: 0;
          clip-path: polygon(
            50% 0%,
            61% 35%,
            98% 35%,
            68% 57%,
            79% 91%,
            50% 70%,
            21% 91%,
            32% 57%,
            2% 35%,
            39% 35%
          );
        }
'''

if not m:
  raise SystemExit("❌ Could not locate the .confetti span CSS block to patch.")

s = re.sub(pattern, star_rule, s, count=1, flags=re.S)

p.write_text(s, encoding="utf-8")
print("✅ Confetti particles changed to stars.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
