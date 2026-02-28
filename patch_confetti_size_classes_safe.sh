#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text()

# 1) Modify span creation to assign size class
s = re.sub(
r'CONFETTI_VECTORS\.map\(\(\[dx, dy, c\], idx\) => \(\s*<span',
'''CONFETTI_VECTORS.map(([dx, dy, c], idx) => {
  const sizeClass = ["conf-sm","conf-md","conf-lg"][Math.floor(Math.random()*3)];
  const rot = Math.random()*360;
  return (<span className={sizeClass}''',
s
)

s = re.sub(
r'style=\{\s*\{\s*\["--dx" as any\]: dx,\s*\["--dy" as any\]: dy,\s*\["--c" as any\]: c,\s*\}\s*as any\s*\}',
'''style={{
  ["--dx" as any]: dx,
  ["--dy" as any]: dy,
  ["--c" as any]: c,
  ["--rot" as any]: rot + "deg"
} as any}''',
s
)

s = s.replace("))}", ")})}")

# 2) Add CSS size classes
insert_css = """
.confetti span.conf-sm { width:6px;height:6px }
.confetti span.conf-md { width:10px;height:10px }
.confetti span.conf-lg { width:14px;height:14px }

.confetti span { transform:translate(-50%,-50%) rotate(var(--rot,0deg)) scale(.6); }
"""

s = s.replace("@keyframes confettiBurst", insert_css + "\n@keyframes confettiBurst")

p.write_text(s)
print("✨ Confetti stars now vary in size safely")
PY

echo "Restart:"
echo "pnpm dev:web"
