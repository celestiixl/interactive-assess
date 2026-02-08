#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

# ---- 1) Nuke the WRONG route tree you’re editing (non-(app) /teacher) ----
rm -rf apps/web/src/app/teacher || true
echo "✅ removed apps/web/src/app/teacher (wrong route tree)"

# ---- 2) Find the Student Assessment Lab page you’re viewing ----
if [ -d apps/web/src/app ]; then APP="apps/web/src/app"; else APP="apps/web/app"; fi
echo "✅ APP=$APP"

LAB_PAGE=""
for p in \
  "$APP/(app)/student/assessment/page.tsx" \
  "$APP/(app)/student/assessment-lab/page.tsx" \
  "$APP/(app)/student/assess/page.tsx" \
  "$APP/student/assessment/page.tsx" \
  "$APP/student/assess/page.tsx"
do
  if [ -f "$p" ]; then LAB_PAGE="$p"; break; fi
done

if [ -z "$LAB_PAGE" ]; then
  echo "❌ couldn't find Student Assessment Lab page"
  echo "try: find $APP -maxdepth 7 -type f -name page.tsx | rg 'student/(assess|assessment)'"
  exit 1
fi
echo "✅ LAB_PAGE=$LAB_PAGE"
ts="$(date +%Y%m%d_%H%M%S)"
cp -a "$LAB_PAGE" "$LAB_PAGE.bak.$ts"
echo "✅ backup -> $LAB_PAGE.bak.$ts"

# ---- 3) Fix unreadable/washed-out styling (make it match main light style) ----
perl -0777 -i -pe '
  # backgrounds: dark -> light
  s/bg-slate-950/bg-slate-50/g;
  s/bg-slate-900/bg-slate-50/g;
  s/bg-black/bg-slate-50/g;

  # text: low-contrast -> readable
  s/text-slate-100/text-slate-900/g;
  s/text-slate-200/text-slate-800/g;
  s/text-slate-300/text-slate-700/g;
  s/text-slate-400/text-slate-600/g;

  # borders: dark -> light
  s/border-slate-800/border-slate-200/g;
  s/border-slate-700/border-slate-200/g;
  s/border-white\/10/border-slate-200\/80/g;

  # remove common opacity that makes everything faint
  s/opacity-20/opacity-100/g;
  s/opacity-30/opacity-100/g;
  s/opacity-40/opacity-100/g;
  s/opacity-50/opacity-100/g;

  # if it has a main wrapper, ensure readable defaults
  if ($_ !~ /bg-slate-50/) {
    s/<main className="([^"]*)">/<main className="bg-slate-50 text-slate-900 min-h-dvh $1">/s;
  } else {
    s/<main className="([^"]*)">/<main className="$1">/s;
  }

  # ensure cards are white with subtle shadow
  s/bg-slate-950\/50/bg-white/g;
  s/bg-slate-900\/50/bg-white/g;
  s/bg-slate-800\/50/bg-white/g;
' "$LAB_PAGE"

echo "✅ patched contrast on LAB page"

echo "== quick sanity checks =="
echo "-- any remaining non-(app) teacher pages? --"
find "$APP" -maxdepth 5 -type f -name page.tsx | rg '^.*/teacher/' || echo "✅ none"

