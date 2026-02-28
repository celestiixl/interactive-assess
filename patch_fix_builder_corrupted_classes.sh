#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
FILE="apps/web/src/app/(app)/teacher/builder/page.tsx"

cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }
[ -f "$FILE" ] || { echo "❌ missing $FILE"; exit 1; }

STAMP="$(date +%Y%m%d_%H%M%S)"
cp -a "$FILE" "${FILE}.bak_fix_classes_${STAMP}"
echo "🧯 backup: ${FILE}.bak_fix_classes_${STAMP}"

# Use perl in "whole file" mode for robust matching across line wraps.
perl -0777 -i -pe '

  # 1) Cards with totally broken class string: className="/0 p-5 ia-card-soft "
  s/className="\/0 p-5 ia-card-soft\s*"/className="rounded-3xl border bg-white p-5 shadow-sm"/g;

  # 2) Inputs/textareas with corrupted border tokens: "border -slate-200 /0 ... ia-card-soft"
  s/className="mt-2 w-full border\s+-slate-200\s+\/0 p-2 text-sm ia-card-soft\s*"/className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-sm focus:border-slate-300 focus:outline-none"/g;
  s/className="mt-3 w-full border\s+-slate-200\s+\/0 p-3 text-sm ia-card-soft\s*"/className="mt-3 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm focus:border-slate-300 focus:outline-none"/g;

  # 3) Preview container: bg-white/0 (transparent) -> bg-white + shadow
  s/className="mt-2 aspect-video w-full overflow-hidden rounded-2xl border\s+bg-white\/0"/className="mt-2 aspect-video w-full overflow-hidden rounded-2xl border bg-white shadow-sm"/g;

  # 4) URL input container: missing bg, double spaces -> standard card-ish wrapper
  s/<div className="rounded-2xl border\s+p-3">/<div className="rounded-2xl border bg-white p-3 shadow-sm">/g;

' "$FILE"

echo "✅ patched: $FILE"

# Quick sanity: show the specific lines you previously inspected (approx)
echo
echo "🔎 quick grep to confirm the bad patterns are gone:"
rg -n 'className="\/0 p-5 ia-card-soft|border\s+-slate-200\s+\/0|bg-white\/0"\s*' "$FILE" || true
