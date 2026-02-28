#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/components/student/MasteryDonut.tsx"
[[ -f "$FILE" ]] || { echo "❌ Missing file: $FILE"; exit 1; }

echo "✅ Patching: $FILE"
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

echo
echo "🧾 BEFORE (line 134):"
nl -ba "$FILE" | sed -n '134p'

tmp="$(mktemp)"
awk 'NR==134 { gsub(/: any\b/, ": unknown"); } { print }' "$FILE" > "$tmp"
mv "$tmp" "$FILE"

echo
echo "🧾 AFTER (line 134):"
nl -ba "$FILE" | sed -n '134p'

echo
echo "🧾 Diff:"
git --no-pager diff -- "$FILE" || true

echo
echo "✅ Done."
echo "If TypeScript now complains about using that value, tell me the new error and I’ll patch the correct narrow type."
