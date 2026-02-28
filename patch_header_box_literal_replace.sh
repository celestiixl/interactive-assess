#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"

echo "✅ Target: $FILE"
test -f "$FILE" || { echo "❌ missing $FILE"; exit 1; }

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

echo
echo "🧾 BEFORE:"
rg -n "className=\\{\\\`\\$\\{biomeHealth\\.bg\\} transition-colors duration-700" "$FILE" || true

# Replace the EXACT className line (including spacing) using python (safe with parentheses)
python3 - <<'PY'
from pathlib import Path
p = Path("/workspaces/interactive-assess/apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

old = "className={`${biomeHealth.bg} transition-colors duration-700  shadow-sm hover:shadow-md `}"
new = 'className="inline-block rounded-2xl border bg-white px-6 py-5 shadow-sm"'

if old not in s:
    raise SystemExit("❌ Did not find the exact header className string to replace.")

p.write_text(s.replace(old, new, 1))
print("✅ Replaced header className")
PY

echo
echo "🧾 AFTER:"
rg -n "inline-block rounded-2xl border bg-white px-6 py-5 shadow-sm|biomeHealth\\.bg\\} transition-colors duration-700" "$FILE" || true

echo
echo "🧾 DIFF:"
git --no-pager diff -- "$FILE" || true

echo
echo "🧹 Clearing cache + restarting on 3001..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
rm -rf apps/web/.next .next || true

HOSTNAME=0.0.0.0 PORT=3001 pnpm dev:web
