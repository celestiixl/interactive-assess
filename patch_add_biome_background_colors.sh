#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"

if [ ! -f "$FILE" ]; then
  echo "❌ dashboard file not found"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

# replace background mapping
s = re.sub(
r'bg:\s*"bg-slate-50"',
'bg: p < 0.25 ? "bg-neutral-200" : p < 0.50 ? "bg-amber-50" : p < 0.75 ? "bg-green-50" : "bg-cyan-50"',
s
)

# make the outer container actually use the background strongly
s = re.sub(
r'className=\{biomeHealth\.bg\}',
'className={`${biomeHealth.bg} transition-colors duration-700 min-h-screen p-6 rounded-3xl`}',
s
)

p.write_text(s)
print("patched")
PY

echo "✅ biome backgrounds added"
echo "restart server:"
echo "pnpm dev:web"
