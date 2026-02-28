#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

echo "🔎 Finding files that contain 'Student Dashboard'..."
mapfile -t FILES < <(rg -l "Student Dashboard" apps/web 2>/dev/null || true)

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "❌ No files found under apps/web containing 'Student Dashboard'"
  echo "Try: rg -n \"Student Dashboard\" apps/web"
  exit 1
fi

echo "✅ Found ${#FILES[@]} file(s):"
for f in "${FILES[@]}"; do echo " - $f"; done

FILE="${FILES[0]}"
echo
echo "📌 Using first match:"
echo "   $FILE"

echo
echo "🧾 Showing context around the header text (line numbers):"
rg -n "Student Dashboard|Your personal mastery tracker|Reset Specimen Unlocks" "$FILE" || true

echo
echo "🧾 Showing ~60 lines around the first 'Student Dashboard' occurrence:"
LINE="$(rg -n "Student Dashboard" "$FILE" | head -n 1 | cut -d: -f1 || true)"
if [[ -n "${LINE}" ]]; then
  START=$(( LINE - 30 )); if (( START < 1 )); then START=1; fi
  END=$(( LINE + 30 ))
  nl -ba "$FILE" | sed -n "${START},${END}p"
fi

echo
echo "🧾 Current git diff for this file (if any):"
git --no-pager diff -- "$FILE" || true

echo
echo "🧹 Clearing Next cache to force UI refresh..."
rm -rf apps/web/.next .next || true

echo
echo "✅ Next steps:"
echo "1) If 'git diff' above is empty, your patch didn't match your markup."
echo "   Copy/paste the header JSX from the file section shown above and I will generate a patch that matches exactly."
echo "2) If diff is NOT empty, restart dev server:"
echo "   - stop current dev server (Ctrl+C)"
echo "   - then run: pnpm -C apps/web dev"
echo "3) Make sure you're viewing the Codespace forwarded port URL, not an old deployed page."
