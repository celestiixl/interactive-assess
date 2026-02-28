#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

PRACTICE="apps/web/src/app/(app)/practice/page.tsx"
STU_DASH="apps/web/src/app/(app)/student/dashboard/page.tsx"
STU_ASSESS="apps/web/src/app/(app)/student/assessment/page.tsx"

for f in "$PRACTICE" "$STU_DASH" "$STU_ASSESS"; do
  if [ -f "$f" ]; then
    cp "$f" "${f}.bak.$(date +%Y%m%d_%H%M%S)"
  fi
done

echo "🧼 1) Fix broken Tailwind classes introduced earlier (bg-white/0 and bg-white/0/20 etc)"

# student dashboard: replace invalid bg-white/0* with the intended glassy whites
if [ -f "$STU_DASH" ]; then
  sed -i \
    -e 's/bg-white\/0\/20/bg-white\/20/g' \
    -e 's/bg-white\/0\/25/bg-white\/25/g' \
    -e 's/bg-white\/0\/30/bg-white\/30/g' \
    -e 's/bg-white\/0\/40/bg-white\/40/g' \
    -e 's/bg-white\/0\/50/bg-white\/50/g' \
    -e 's/bg-white\/0\/60/bg-white\/60/g' \
    -e 's/bg-white\/0\/70/bg-white\/70/g' \
    -e 's/bg-white\/0\/80/bg-white\/80/g' \
    -e 's/bg-white\/0\/90/bg-white\/90/g' \
    -e 's/\bbg-white\/0\b/bg-white\/95/g' \
    "$STU_DASH"

  # also fix any accidental double slashes like bg-white/0/20 already handled above
  echo "✅ Fixed $STU_DASH"
fi

# student assessment: same fix
if [ -f "$STU_ASSESS" ]; then
  sed -i \
    -e 's/bg-white\/0\/20/bg-white\/20/g' \
    -e 's/bg-white\/0\/25/bg-white\/25/g' \
    -e 's/bg-white\/0\/30/bg-white\/30/g' \
    -e 's/bg-white\/0\/40/bg-white\/40/g' \
    -e 's/bg-white\/0\/50/bg-white\/50/g' \
    -e 's/bg-white\/0\/60/bg-white\/60/g' \
    -e 's/bg-white\/0\/70/bg-white\/70/g' \
    -e 's/bg-white\/0\/80/bg-white\/80/g' \
    -e 's/bg-white\/0\/90/bg-white\/90/g' \
    -e 's/\bbg-white\/0\b/bg-white\/95/g' \
    "$STU_ASSESS"
  echo "✅ Fixed $STU_ASSESS"
fi

echo "🎨 2) Make Practice page match dashboard theme (remove slate backgrounds, use ia-card-soft surfaces)"

if [ -f "$PRACTICE" ]; then
  # Remove remaining slate background paints in sticky header(s)
  sed -i \
    -e 's/bg-slate-50\/90//g' \
    -e 's/bg-slate-50//g' \
    "$PRACTICE"

  # Convert the common inner gray panel to ia-card-soft
  # from: rounded-2xl border border-slate-200 bg-slate-50 p-4
  # to:   ia-card-soft p-4
  sed -i \
    -e 's/rounded-2xl border border-slate-200 bg-slate-50 p-4/ia-card-soft p-4/g' \
    "$PRACTICE"

  # Convert common white cards with shadow-sm to ia-card-soft (if any exist here)
  sed -i \
    -e 's/rounded-2xl border bg-white p-5 shadow-sm/ia-card-soft p-5/g' \
    -e 's/rounded-3xl border bg-white p-5 shadow-sm/ia-card-soft p-5/g' \
    -e 's/rounded-3xl border bg-white p-6 shadow-sm/ia-card-soft p-6/g' \
    "$PRACTICE"

  echo "✅ Patched $PRACTICE"
fi

echo "🎨 3) Normalize Student Assessment cards to use ia-card-soft (so it matches dashboard)"

if [ -f "$STU_ASSESS" ]; then
  sed -i \
    -e 's/rounded-3xl border bg-white p-5 shadow-sm/ia-card-soft p-5/g' \
    -e 's/rounded-3xl border bg-white p-6 shadow-sm/ia-card-soft p-6/g' \
    -e 's/rounded-2xl border bg-white p-6 shadow-sm/ia-card-soft p-6/g' \
    -e 's/rounded-2xl border bg-white p-5 shadow-sm/ia-card-soft p-5/g' \
    -e 's/min-h-dvh bg-slate-50/min-h-dvh/g' \
    "$STU_ASSESS"
  echo "✅ Patched $STU_ASSESS"
fi

echo "✅ Done."
echo "Now run:"
echo "  pnpm -C apps/web dev"
echo "Then hard refresh."
