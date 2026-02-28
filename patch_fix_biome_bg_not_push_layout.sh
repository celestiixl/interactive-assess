#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Can't find $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text(encoding="utf-8")

# 1) Remove the layout-affecting wrapper we injected (min-h-screen/padding/rounding)
s = s.replace(
  'className={`${biomeHealth.bg} transition-colors duration-700 min-h-screen p-6 rounded-3xl`}',
  'className={`${biomeHealth.bg} transition-colors duration-700`}'
)

# 2) If any variant of that string exists, normalize it (safety)
s = re.sub(
  r'className=\{\`\$\{biomeHealth\.bg\}\s+transition-colors\s+duration-700[^`]*\`\}',
  'className={`${biomeHealth.bg} transition-colors duration-700`}',
  s
)

p.write_text(s, encoding="utf-8")
print("✅ Removed layout classes; kept background transition.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
