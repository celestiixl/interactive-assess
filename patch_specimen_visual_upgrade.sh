#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text()

# Replace card container styling
s = re.sub(
r'className=\{`rounded-2xl border p-4 text-center transition [^`]*`\}',
'''className={`rounded-2xl border p-4 text-center transition duration-300
  ${
    s.unlocked
      ? "bg-gradient-to-br from-emerald-50 to-cyan-50 ring-2 ring-emerald-300 shadow-md"
      : s.pct >= 40
      ? "bg-white shadow-sm"
      : "bg-slate-100 opacity-50"
  }`}
''',
s,
count=1
)

# Make icon grow when unlocked
s = re.sub(
r'<span className="text-3xl">\{s\.organism\.icon\}</span>',
'''<span className={`text-3xl transition-transform duration-300 ${
  s.unlocked ? "scale-110" : ""
}`}>{s.organism.icon}</span>''',
s,
count=1
)

# Replace progress bar colors
s = re.sub(
r'className=\{`h-full rounded-full [^`]*`\}',
'''className={`h-full rounded-full transition-all duration-500 ${
  s.unlocked
    ? "bg-emerald-400"
    : s.pct >= 40
    ? "bg-blue-400"
    : "bg-slate-400"
}` }''',
s,
count=1
)

# Add unlocked badge
s = s.replace(
'{s.unlocked ? "Unlocked" : s.pct >= 40 ? "Growing" : "Locked"}',
'''s.unlocked
  ? "Discovered!"
  : s.pct >= 40
  ? "Researching"
  : "Unknown"'''
)

p.write_text(s)
print("visuals updated")
PY

echo "Restart:"
echo "pnpm dev:web"
