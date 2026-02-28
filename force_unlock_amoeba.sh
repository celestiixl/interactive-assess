#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

# find first segment mentioning cell (maps to Amoeba)
pattern = r'(label:\s*["\'][^"\']*cell[^"\']*["\'][^}]*?value:\s*)([0-9]*\.?[0-9]+)'
s, n = re.subn(pattern, r'\g<1>0.80', s, count=1, flags=re.IGNORECASE)

if n == 0:
    print("⚠️ Could not find a cell-related segment to modify.")
else:
    p.write_text(s)
    print("✅ Amoeba forced to 0.80")
PY

echo "Now:"
echo "1. Clear Session Storage in DevTools"
echo "2. Refresh the page"
