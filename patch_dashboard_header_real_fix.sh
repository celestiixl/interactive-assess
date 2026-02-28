#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO"

FILE=$(rg -l "Student Dashboard" apps/web | head -n 1)
echo "Editing: $FILE"
cp "$FILE" "$FILE.bak.$(date +%s)"

# Replace the header block with a proper stacked container
perl -0777 -i -pe '
s{
<h1[^>]*>Student Dashboard</h1>\s*
<p[^>]*>\s*Your personal mastery tracker\.\s*<button[^>]*>Reset Specimen Unlocks</button>\s*</p>
}{
<div className="rounded-xl bg-emerald-50/70 px-5 py-4 w-fit">
  <h1 className="text-2xl font-semibold text-slate-900">Student Dashboard</h1>
  <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
    <span>Your personal mastery tracker.</span>
    <button className="shrink-0 rounded-full border px-3 py-1 text-xs font-medium hover:bg-white/60">
      Reset Specimen Unlocks
    </button>
  </div>
</div>
}gs
' "$FILE"

echo
echo "Done. Restart dev server:"
echo "Ctrl+C then → pnpm dev:web"
