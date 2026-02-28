#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text()

# replace unlocked mapping logic
s = re.sub(
r'const unlocked = segments\.map\([\s\S]*?;\n',
"""
  const grouped = {};

  segments.forEach(seg => {
    const organism = pickOrganism(seg.label);
    const key = organism.name;

    const value = normValue(seg.value);

    if (!grouped[key] || grouped[key].value < value) {
      grouped[key] = {
        organism,
        value,
        pct: Math.round(value * 100),
        unlocked: value >= 0.75
      };
    }
  });

  const unlocked = Object.values(grouped);
""",
s,
count=1
)

# adjust map rendering variable
s = s.replace("unlocked.map((s, i)", "unlocked.map((s, i)")

# remove duplicate labels
s = s.replace("title={s.label}", "")

p.write_text(s)
print("grouped")
PY

echo "Restart:"
echo "pnpm dev:web"
