#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
if [[ ! -f "$FILE" ]]; then
  echo "❌ Missing file: $FILE"
  exit 1
fi

echo "✅ Using EXACT file:"
echo "   $FILE"
echo

echo "🧾 BEFORE (show banner lines + header lines):"
rg -n 'banner:\s*"|Student Dashboard|Your personal mastery tracker|Reset Specimen Unlocks' "$FILE" || true
echo

echo "🧱 BACKUP"
cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

echo "✍️ APPLYING CHANGES (no gradients + stable header bg)"
# 1) Force banner gradients -> solid
perl -0777 -i -pe '
  s/banner:\s*"bg-gradient-to-r\s+from-neutral-50\s+to-neutral-100"/banner: "bg-neutral-100"/g;
  s/banner:\s*"bg-gradient-to-r\s+from-amber-50\s+to-amber-100\/60"/banner: "bg-amber-50"/g;
  s/banner:\s*"bg-gradient-to-r\s+from-green-50\s+to-green-100\/60"/banner: "bg-green-50"/g;
  # in case you have cyan at the end:
  s/banner:\s*"bg-gradient-to-r\s+from-cyan-50\s+to-cyan-100\/60"/banner: "bg-cyan-50"/g;
' "$FILE"

# 2) Force the title highlight to be a single block around BOTH lines (and NOT hover-sensitive)
# Replace the existing h1 + subtitle line cluster if it exists in common form.
perl -0777 -i -pe '
  s{
    <h1[^>]*>\s*Student\s+Dashboard\s*</h1>\s*
    <p[^>]*>\s*Your\s+personal\s+mastery\s+tracker\.\s*(?:<button[^>]*>\s*Reset\s+Specimen\s+Unlocks\s*</button>\s*)?</p>
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

echo
echo "🧾 AFTER (same grep):"
rg -n 'banner:\s*"|Student Dashboard|Your personal mastery tracker|Reset Specimen Unlocks' "$FILE" || true

echo
echo "🧾 GIT DIFF (must NOT be empty):"
git --no-pager diff -- "$FILE" || true

echo
echo "🧹 CLEAR NEXT CACHE (forces UI update)"
rm -rf apps/web/.next .next || true

echo
echo "✅ NOW DO THIS:"
echo "1) Stop dev server (Ctrl+C) where pnpm dev:web is running"
echo "2) Restart: pnpm dev:web"
echo "3) Open the RIGHT port (you confirmed Next is on 3000):"
echo "   https://<your-codespace>-3000.app.github.dev/student/dashboard"
