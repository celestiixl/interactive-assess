#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"

if [ ! -f "$FILE" ]; then
  echo "❌ Could not find demo data file"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

# replace first occurrence of value: number with value: 0.80
s, n = re.subn(r'value:\s*[0-9]*\.?[0-9]+', 'value: 0.80', s, count=1)

if n == 0:
    print("⚠️ Couldn't find a value field to modify")
else:
    p.write_text(s)
    print("✅ One specimen forced to unlock (0.80)")
PY

echo "Now refresh the website."
echo "If animation doesn't replay: DevTools → Application → Session Storage → Clear"
