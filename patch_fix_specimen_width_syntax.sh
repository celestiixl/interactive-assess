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

# Fix the extra brace inside the width template string
s = s.replace(
  "style={{ width: `${Math.max(0, Math.min(100, s.pct)})}%` }}",
  "style={{ width: `${Math.max(0, Math.min(100, s.pct))}%` }}"
)

# Also fix any variant that matches the same mistake
s = re.sub(
  r'style=\{\{\s*width:\s*`\$\{Math\.max\(0,\s*Math\.min\(100,\s*s\.pct\)\)\}\%\`\s*\}\}',
  "style={{ width: `${Math.max(0, Math.min(100, s.pct))}%` }}",
  s
)

p.write_text(s, encoding="utf-8")
print("✅ Fixed width syntax")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
