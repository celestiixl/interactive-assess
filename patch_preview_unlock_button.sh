#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"

if [ ! -f "$FILE" ]; then
  echo "❌ Could not find dashboard page"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

# Insert debug button under the header
awk '
/Your personal mastery tracker/ && !done {
  print
  print ""
  print "        {/* DEBUG BUTTON — REMOVE LATER */}"
  print "        <button"
  print "          onClick={() => {"
  print "            Object.keys(sessionStorage).forEach(k => {"
  print "              if (k.startsWith(\"specimen_unlocked_\")) sessionStorage.removeItem(k);"
  print "            });"
  print "            location.reload();"
  print "          }}"
  print "          className=\"mt-2 rounded-xl border px-3 py-1 text-xs bg-amber-50 hover:bg-amber-100\""
  print "        >"
  print "          Reset Specimen Unlocks"
  print "        </button>"
  print ""
  done=1
  next
}
{print}
' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

echo "✅ Added Preview Unlock button"
echo "Restart dev server:"
echo "pnpm dev:web"
