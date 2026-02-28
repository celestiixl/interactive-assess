#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
[[ -f "$FILE" ]] || { echo "❌ Missing $FILE"; exit 1; }

echo "✅ Target file: $FILE"
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

echo
echo "🧾 BEFORE: show the header wrapper block (biomeHealth.bg area)"
rg -n "biomeHealth\\.bg|hover:bg-white/70|cursor-pointer shadow-sm hover:shadow-md|Student Dashboard" "$FILE" | head -n 80 || true

echo
echo "✍️ Patching header wrapper to a real card (no biomeHealth.bg, no hover fade)…"

# Replace: className={`${biomeHealth.bg} ... hover:bg-white/70`}
# With:    className="inline-block rounded-2xl border bg-white px-6 py-5 shadow-sm"
perl -0777 -i -pe '
  s/className=\{\`\$\{biomeHealth\.bg\}[^`]*\`\\}/className="inline-block rounded-2xl border bg-white px-6 py-5 shadow-sm"/g
' "$FILE"

# Remove cursor-pointer / hover shadow from <main> if present (this was making “hover changes” feel global)
perl -0777 -i -pe '
  s/(<main className="[^"]*)\bcursor-pointer\b([^"]*")/$1$2/g;
  s/(<main className="[^"]*)\bhover:shadow-md\b([^"]*")/$1$2/g;
  s/(<main className="[^"]*)\bshadow-sm\b([^"]*")/$1$2/g;
  s/(<main className="[^"]*)\s+/$1 /g;
' "$FILE"

# Remove any remaining hover fade token if it’s still in the file
perl -0777 -i -pe 's/\bhover:bg-white\/70\b//g' "$FILE"

echo
echo "🧾 AFTER: confirm header wrapper is now bg-white card"
rg -n "biomeHealth\\.bg|hover:bg-white/70|inline-block rounded-2xl border bg-white px-6 py-5 shadow-sm|Student Dashboard" "$FILE" | head -n 120 || true

echo
echo "🧾 DIFF:"
git --no-pager diff -- "$FILE" || true

echo
echo "🛑 Stopping Next dev (best effort)…"
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "pnpm --filter web dev" 2>/dev/null || true
pkill -f "pnpm dev:web" 2>/dev/null || true

echo
echo "🧹 Clearing Next cache…"
rm -rf apps/web/.next .next || true

echo
echo "🚀 Starting Next on port 3001 (so your -3001 URL matches)…"
echo "Open: https://<codespace>-3001.app.github.dev/student/dashboard"
echo
HOSTNAME=0.0.0.0 PORT=3001 pnpm dev:web &
sleep 2

echo
echo "🔎 Confirm listening on 3001:"
ss -ltnp 2>/dev/null | rg ":3001\\b|next-server" || true

echo
echo "✅ Done. Refresh your -3001 dashboard URL."
