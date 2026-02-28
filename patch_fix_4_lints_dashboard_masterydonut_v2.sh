#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" 2>/dev/null || cd "$(pwd)"

echo "🔎 Locating files..."

PAGE=""
for p in \
  "apps/web/src/app/(app)/student/dashboard/page.tsx" \
  "apps/web/app/(app)/student/dashboard/page.tsx" \
  "apps/web/src/app/student/dashboard/page.tsx" \
  "apps/web/app/student/dashboard/page.tsx"
do
  if [ -f "$p" ]; then PAGE="$p"; break; fi
done

DONUT=""
for p in \
  "apps/web/src/components/student/MasteryDonut.tsx" \
  "apps/web/components/student/MasteryDonut.tsx" \
  "apps/web/src/components/MasteryDonut.tsx" \
  "apps/web/components/MasteryDonut.tsx"
do
  if [ -f "$p" ]; then DONUT="$p"; break; fi
done

if [ -z "${PAGE}" ]; then
  echo "❌ Could not find student dashboard page.tsx"
  exit 1
fi
if [ -z "${DONUT}" ]; then
  echo "❌ Could not find MasteryDonut.tsx"
  exit 1
fi

echo "✅ PAGE=$PAGE"
echo "✅ DONUT=$DONUT"

backup() {
  local f="$1"
  local b="${f}.bak.$(date +%Y%m%d_%H%M%S)"
  cp "$f" "$b"
  echo "🧷 backup -> $b"
}

backup "$PAGE"
backup "$DONUT"

echo
echo "🛠️  Fix 1: useMemo dependency warning (replace [] with [segments] for common patterns)"
# Handle common patterns:
# - useMemo(() => ..., [])
# - useMemo(() => { ... }, [])
# We only do this on the dashboard page where your warning exists.
sed -i \
  -e 's/useMemo(() => /useMemo(() => /g' \
  -e 's/useMemo(() => { /useMemo(() => { /g' \
  "$PAGE"

# Replace ONLY the empty deps array that immediately follows a useMemo call.
# (This avoids touching other [] in the file.)
perl -i -0pe 's/(useMemo\([^)]*\),\s*)\[\s*\](\s*\))/$1[segments]$2/g' "$PAGE"

echo "🛠️  Fix 2: Tailwind canonical class bg-gradient-to-r -> bg-linear-to-r"
sed -i 's/\bbg-gradient-to-r\b/bg-linear-to-r/g' "$PAGE"

echo
echo "🛠️  Fix 3+4: MasteryDonut.tsx unused Segment + no-unused-expressions"
# Remove any stray "Segment;" line (the no-unused-expressions warning)
grep -vE '^[[:space:]]*Segment[[:space:]]*;[[:space:]]*$' "$DONUT" > "$DONUT.__tmp__" || true
mv "$DONUT.__tmp__" "$DONUT"

# If Segment type exists, ensure it's exported (harmless if already exported)
perl -i -pe 's/^\s*type\s+Segment\s*=/export type Segment =/ if $. <= 10' "$DONUT"

# Ensure the component actually uses Segment in its props typing.
# Handles:
#   export default function MasteryDonut({ segments }) {
#   export default function MasteryDonut({ segments }: any) {
perl -i -0pe 's/export\s+default\s+function\s+MasteryDonut\s*\(\s*\{\s*segments\s*\}\s*(?::\s*any\s*)?\)\s*\{/export default function MasteryDonut({ segments }: { segments: Segment[] }) {/s' "$DONUT"

echo
echo "✅ Done."
echo "Run:"
echo "  pnpm -C apps/web lint"
