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

# Replace ANY of these broken forms:
# `${Math.max(0, Math.min(100, s.pct)})}%`
# `${Math.max(0, Math.min(100, s.pct)})}%` (extra brace)
# or any spacing variants
s2 = re.sub(
  r'style=\{\{\s*width:\s*`\$\{Math\.max\(\s*0\s*,\s*Math\.min\(\s*100\s*,\s*s\.pct\s*\)\s*\)\s*\}\)\s*\}%`\s*\}\}',
  'style={{ width: `${Math.max(0, Math.min(100, s.pct))}%` }}',
  s
)

# Also handle the common exact string we saw:
s2 = s2.replace(
  "style={{ width: `${Math.max(0, Math.min(100, s.pct)})}%` }}",
  "style={{ width: `${Math.max(0, Math.min(100, s.pct))}%` }}"
)

# If still present, do a broader safe replace of the inner template:
s2 = re.sub(
  r'`\$\{Math\.max\(0,\s*Math\.min\(100,\s*s\.pct\)\)\}\)%`',
  '`${Math.max(0, Math.min(100, s.pct))}%`',
  s2
)

p.write_text(s2, encoding="utf-8")

# sanity check
if "Math.min(100, s.pct)})" in s2:
  raise SystemExit("❌ Still found the broken extra-brace pattern after patch.")
print("✅ Width line fixed.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
