#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python3 <<'PY'
from pathlib import Path
p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

old = 'className="w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60"'

new = '''className="w-full border-b
bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700
text-white shadow-md"'''

s = s.replace(old, new)

# make title + subtitle readable on dark background
s = s.replace(
'text-4xl font-semibold tracking-tight text-slate-900',
'text-4xl font-semibold tracking-tight text-white'
)

s = s.replace(
'text-slate-600',
'text-blue-100'
)

p.write_text(s)
print("✅ Added SciPlots-style blue header")
PY

rm -rf apps/web/.next
PORT=3001 pnpm dev:web
