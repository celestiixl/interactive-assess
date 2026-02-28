#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

# Find the file that contains "banner: \"bg-gradient-to-r"
FILE="$(rg -l 'banner:\s*"bg-gradient-to-r' apps/web/src/app/(app)/student/dashboard/page.tsx apps/web/src/app -S | head -n 1 || true)"
if [[ -z "$FILE" ]]; then
  echo "❌ Could not find a file containing banner: \"bg-gradient-to-r\""
  exit 1
fi

echo "✅ Patching: $FILE"
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# Replace gradient banners with solid backgrounds
perl -0777 -i -pe '
  s/banner:\s*"bg-gradient-to-r\s+from-neutral-50\s+to-neutral-100"/banner: "bg-neutral-100"/g;
  s/banner:\s*"bg-gradient-to-r\s+from-amber-50\s+to-amber-100\/60"/banner: "bg-amber-50"/g;
  s/banner:\s*"bg-gradient-to-r\s+from-green-50\s+to-green-100\/60"/banner: "bg-green-50"/g;
  s/banner:\s*"bg-gradient-to-r\s+from-cyan-50\s+to-cyan-100\/60"/banner: "bg-cyan-50"/g;
' "$FILE"

echo
echo "🧾 Diff:"
git --no-pager diff -- "$FILE" || true

echo
echo "✅ Done. Restart dev server (Ctrl+C), then:"
echo "pnpm dev:web"
