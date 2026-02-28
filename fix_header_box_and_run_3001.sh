#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
[[ -f "$FILE" ]] || { echo "❌ Missing $FILE"; exit 1; }

echo "✅ Patching $FILE"
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

echo
echo "🧾 BEFORE (header className line):"
rg -n "className=\\{`\\$\\{biomeHealth\\.bg\\} transition-colors duration-700" "$FILE" || true

# Replace the EXACT header wrapper className (fix the “highlight” look)
perl -0777 -i -pe '
  s/className=\{\`\$\{biomeHealth\.bg\}\s+transition-colors\s+duration-700\s+shadow-sm\s+hover:shadow-md\s*\`\}/className="inline-block rounded-2xl border bg-white px-6 py-5 shadow-sm"/g;
  s/className=\{\`\$\{biomeHealth\.bg\}\s+transition-colors\s+duration-700\s+shadow-sm\s+hover:shadow-md\s*\`\}/className="inline-block rounded-2xl border bg-white px-6 py-5 shadow-sm"/g;
' "$FILE"

# If there are extra double spaces or slightly different spacing, use a looser fallback:
perl -0777 -i -pe '
  s/className=\{\`\$\{biomeHealth\.bg\}[^`]*transition-colors[^`]*duration-700[^`]*shadow-sm[^`]*hover:shadow-md[^`]*\`\}/className="inline-block rounded-2xl border bg-white px-6 py-5 shadow-sm"/g;
' "$FILE"

echo
echo "🧾 AFTER (should show bg-white header card):"
rg -n "inline-block rounded-2xl border bg-white px-6 py-5 shadow-sm|biomeHealth\\.bg\\} transition-colors duration-700" "$FILE" || true

echo
echo "🧾 DIFF:"
git --no-pager diff -- "$FILE" || true

echo
echo "🛑 Killing dev servers (prevents SIGTERM / port fights)…"
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "pnpm --filter web dev" 2>/dev/null || true
pkill -f "pnpm dev:web" 2>/dev/null || true

echo
echo "🧹 Clearing Next cache…"
rm -rf apps/web/.next .next || true

echo
echo "🚀 Starting Next on 3001…"
HOSTNAME=0.0.0.0 PORT=3001 pnpm dev:web
