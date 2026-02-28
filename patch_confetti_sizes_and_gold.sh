#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text()

# --- update span creation ONLY inside confetti block ---
s = re.sub(
r'\{CONFETTI_VECTORS\.map\(\(\[dx, dy, c\], idx\) => \(\s*<span',
'''{CONFETTI_VECTORS.map(([dx, dy, c], idx) => {
  const size = ["star-sm","star-md","star-lg"][Math.floor(Math.random()*3)];
  const rot = Math.random()*360;
  const gold = Math.random() < 0.18 ? " star-gold" : "";
  return (<span className={size + gold}''',
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

# --- add CSS sizes safely ---
css_insert = """
.confetti span.star-sm { width:6px;height:6px }
.confetti span.star-md { width:10px;height:10px }
.confetti span.star-lg { width:15px;height:15px }

.confetti span.star-gold {
  background:linear-gradient(135deg,#fde047,#f59e0b);
}

.confetti span {
  transform:translate(-50%,-50%) rotate(var(--rot,0deg)) scale(.7);
}
"""

s = s.replace("@keyframes confettiBurst", css_insert + "\n@keyframes confettiBurst")

p.write_text(s)
print("✨ Varied + gold stars added")
PY

echo "Restart:"
echo "pnpm dev:web"
