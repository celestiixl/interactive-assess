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

# Replace ANY broken variant of the width line with a brace-safe string concat form.
s = re.sub(
  r'style=\{\{\s*width:\s*`?\$\{?Math\.max\(\s*0\s*,\s*Math\.min\(\s*100\s*,\s*s\.pct\s*\)\s*\)\}?`?\s*\}%?`?\s*\}\}',
  'style={{ width: `${Math.max(0, Math.min(100, s.pct))}` + "%" }}',
  s
)

# Also cover the exact broken string you keep getting:
s = s.replace(
  'style={{ width: `${Math.max(0, Math.min(100, s.pct)})}%` }}',
  'style={{ width: `${Math.max(0, Math.min(100, s.pct))}` + "%" }}'
)

# And the correct-but-template version:
s = s.replace(
  'style={{ width: `${Math.max(0, Math.min(100, s.pct))}%` }}',
  'style={{ width: `${Math.max(0, Math.min(100, s.pct))}` + "%" }}'
)

p.write_text(s, encoding="utf-8")

# sanity check
if "Math.min(100, s.pct)})" in s:
  raise SystemExit("❌ Still found the broken extra-brace pattern.")
print("✅ Progress bar width is now brace-safe.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
