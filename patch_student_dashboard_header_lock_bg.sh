#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
if [[ ! -f "$FILE" ]]; then
  echo "❌ can't find $FILE"
  exit 1
fi

echo "✅ Patching $FILE"
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

# Replace ONLY the title+subtitle+reset button cluster with a stable header block.
# This:
# - wraps title + subtitle + button together
# - uses a solid bg (no gradient) so it cannot fade on hover
# - avoids any hover:bg / group-hover:bg surprises
perl -0777 -i -pe '
  s{
    <h1[^>]*>\s*Student\s+Dashboard\s*</h1>\s*
    <p[^>]*>\s*Your\s+personal\s+mastery\s+tracker\.\s*
    <button[^>]*>\s*Reset\s+Specimen\s+Unlocks\s*</button>\s*
    </p>
  }{
<div className="inline-flex flex-col gap-1 rounded-xl bg-emerald-50/80 px-5 py-4">
  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Student Dashboard</h1>
  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
    <span>Your personal mastery tracker.</span>
    <button className="shrink-0 rounded-full border border-slate-300 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-white">
      Reset Specimen Unlocks
    </button>
  </div>
</div>
  }gsx
' "$FILE"

# Strip hover/group-hover background classes that might be applied to the immediate wrapper
# around the header area (common cause of "fades to white on hover").
# This is safe: it only removes hover:bg* and group-hover:bg* tokens.
perl -0777 -i -pe '
  s/(className="[^"]*)(\b(?:hover|group-hover):bg-[^"\s]+)([^"]*")/$1$3/g;
  s/(className="[^"]*)(\b(?:hover|group-hover):from-[^"\s]+)([^"]*")/$1$3/g;
  s/(className="[^"]*)(\b(?:hover|group-hover):to-[^"\s]+)([^"]*")/$1$3/g;
' "$FILE"

echo
echo "🧾 Diff:"
git --no-pager diff -- "$FILE" || true

echo
echo "✅ Done. Restart dev server (Ctrl+C) then:"
echo "pnpm dev:web"
echo
echo "Open the correct port (you’re on 3000):"
echo "https://<your-codespace>-3000.app.github.dev/student/dashboard"
