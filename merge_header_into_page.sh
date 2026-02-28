#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python3 <<'PY'
from pathlib import Path
p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

# Make page background white instead of gray
s = s.replace(
'min-h-dvh bg-slate-50',
'min-h-dvh bg-white'
)

# Add top padding so content sits inside header gradient
s = s.replace(
'max-w-6xl px-6 py-8 space-y-6',
'max-w-6xl px-6 pt-10 pb-8 space-y-6'
)

# Remove border from first section so it blends
s = s.replace(
'rounded-2xl border bg-white p-6 shadow-sm',
'rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-sm'
)

p.write_text(s)
print("✅ Header now blends into page like a real hero section")
PY

rm -rf apps/web/.next
PORT=3001 pnpm dev:web
