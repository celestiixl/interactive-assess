#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python3 <<'PY'
from pathlib import Path
p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

# Insert a surface wrapper after the header block
s = s.replace(
'<section className="rounded-2xl bg-white/95 backdrop-blur-sm p-6 shadow-sm">',
'<div className="mt-6 rounded-3xl bg-white shadow-xl p-6">\n<section className="rounded-2xl bg-white p-6 shadow-sm">'
)

# close wrapper before bottom stats grid
s = s.replace(
'<section className="grid gap-4 md:grid-cols-3">',
'</section>\n</div>\n\n<section className="grid gap-4 md:grid-cols-3">'
)

p.write_text(s)
print("✅ Added main content surface layer")
PY

rm -rf apps/web/.next
PORT=3001 pnpm dev:web
