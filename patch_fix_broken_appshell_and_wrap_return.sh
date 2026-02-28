#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

APPSHELL="apps/web/src/components/ia/AppShell.tsx"
[ -f "$APPSHELL" ] || { echo "❌ Missing: $APPSHELL"; exit 1; }

echo "🔎 Finding newest AppShell backup..."
NEWEST_BAK="$(ls -1t "${APPSHELL}.bak."* 2>/dev/null | head -n 1 || true)"

if [ -z "${NEWEST_BAK:-}" ]; then
  echo "❌ No backup found at ${APPSHELL}.bak.*"
  echo "   I can still repair it, but restoring is safest."
  exit 1
fi

echo "🧷 Restoring from: $NEWEST_BAK"
cp "$NEWEST_BAK" "$APPSHELL"

echo "🎨 Wrapping AppShell return() in dashboard-style background/container..."

# Wrap the entire return ( ... ) block without touching internal JSX.
# This avoids breaking braces/parentheses again.
perl -0777 -i -pe '
  s/return\s*\(\s*/return (\n  <div className="min-h-dvh ia-bg relative">\n    <div className="absolute inset-0 ia-grid pointer-events-none"><\/div>\n    <div className="relative z-10 px-6 pt-8 pb-16">\n      <div className="mx-auto max-w-[1400px]">\n/;

  s/\n\);\s*\n\}/\n      <\/div>\n    <\/div>\n  <\/div>\n);\n}\n/s;
' "$APPSHELL"

echo "✅ AppShell restored + wrapped."
echo "➡️ Restart dev server (and make sure the old one is stopped):"
echo "   pnpm -C apps/web dev"
