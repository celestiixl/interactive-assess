#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

# Replace MasteryDonut render block with a proper tab switch
s = re.sub(
r'\{tab === "overview" \? \(\s*<MasteryDonut segments=\{segments\} />\s*\) : null\}',
"""
{tab === "overview" ? (
  <>
    <MasteryDonut segments={segments} />
    <div className="text-center text-sm text-slate-500 mt-3">
      Hover a slice to see the TEKS.
    </div>
  </>
) : (
  <div className="mt-4">
    <div className="text-sm text-slate-600 mb-4">
      Collect organisms by mastering TEKS segments (75%+ unlock).
    </div>
    <SpecimenGrid segments={segments} />
  </div>
)}
""",
s,
count=1,
flags=re.S
)

# Remove any duplicate specimen blocks outside card
s = re.sub(r'\{tab === "specimens"[\s\S]*?<SpecimenGrid segments=\{segments\} />[\s\S]*?\}', '', s)

p.write_text(s)
print("mounted correctly")
PY

echo "Restart:"
echo "pnpm dev:web"
