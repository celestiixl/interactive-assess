#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text()

# ensure useState + useEffect import
if "useEffect" not in s:
    s = s.replace(
        'import React',
        'import React, { useEffect, useState }'
    )

# add unlock tracking state after component start
s = re.sub(
r'export default function SpecimenGrid\(\{ segments \}: Props\) \{',
'''export default function SpecimenGrid({ segments }: Props) {
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
''',
s
)

# detect unlock
s = re.sub(
r'const unlocked = Object\.values\(grouped\);',
'''
const unlocked = Object.values(grouped);

useEffect(() => {
  unlocked.forEach(o => {
    if (o.unlocked && !sessionStorage.getItem("unlocked_"+o.organism.name)) {
      sessionStorage.setItem("unlocked_"+o.organism.name, "1");
      setJustUnlocked(o.organism.name);
      setTimeout(() => setJustUnlocked(null), 900);
    }
  });
}, [segments]);
''',
s
)

# add animation class to card
s = re.sub(
r'shadow-md"',
'''shadow-md ${
  justUnlocked === s.organism.name ? "animate-[pop_0.5s_ease,glow_1s_ease]" : ""
}"''',
s,
count=1
)

# append CSS at end of file
if "pop_0.5s" not in s:
    s += """

<style jsx global>{`
@keyframes pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.12); }
  100% { transform: scale(1); }
}
@keyframes glow {
  0% { box-shadow: 0 0 0 rgba(16,185,129,0); }
  50% { box-shadow: 0 0 24px rgba(16,185,129,.55); }
  100% { box-shadow: 0 0 0 rgba(16,185,129,0); }
}
`}</style>
"""

p.write_text(s)
print("unlock animation added")
PY

echo "Restart:"
echo "pnpm dev:web"
