#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python3 <<'PY'
from pathlib import Path
p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

# Softer academic blue
s = s.replace(
'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700',
'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500'
)

# Make subtitle softer white
s = s.replace(
'text-blue-100',
'text-white/80'
)

# Slightly reduce shadow
s = s.replace(
'shadow-md',
'shadow-sm'
)

p.write_text(s)
print("✅ Refined header to lighter academic blue")
PY

rm -rf apps/web/.next
PORT=3001 pnpm dev:web
