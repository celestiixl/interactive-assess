#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text()

# 1) Add random size + rotation inline style to particles
s = re.sub(
r'\{CONFETTI_VECTORS\.map\(\(\[dx, dy, c\], idx\) => \(\s*<span',
'''{CONFETTI_VECTORS.map(([dx, dy, c], idx) => {
  const size = 6 + Math.random()*8; // 6–14px
  const rot = Math.random()*360;
  return (<span''',
s
)

s = re.sub(
r'style=\{\s*\{\s*\["--dx" as any\]: dx,\s*\["--dy" as any\]: dy,\s*\["--c" as any\]: c,\s*\}\s*as any\s*\}',
'''style={{
  ["--dx" as any]: dx,
  ["--dy" as any]: dy,
  ["--c" as any]: c,
  ["--size" as any]: size + "px",
  ["--rot" as any]: rot + "deg"
} as any}''',
s
)

s = s.replace("))}", ")})}")

# 2) Update CSS to use size + rotation
s = re.sub(
r'\.confetti span \{[^}]*\}',
'''
.confetti span {
  position:absolute;
  left:50%;
  top:50%;
  width:var(--size,10px);
  height:var(--size,10px);
  background:var(--c,#22c55e);
  transform:translate(-50%,-50%) rotate(var(--rot,0deg)) scale(.6);
  opacity:0;
  animation:confettiBurst .75s ease-out forwards;
  clip-path:polygon(
    50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,
    50% 70%,21% 91%,32% 57%,2% 35%,39% 35%
  );
}
''',
s,
count=1,
flags=re.S
)

p.write_text(s)
print("✨ Stars now vary in size + rotation")
PY

echo "Restart server:"
echo "pnpm dev:web"
