#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" 2>/dev/null || cd "$(pwd)"

echo "🔎 Locating files..."

# Student dashboard page (handle src/app vs app)
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
echo "🛠️  Fix 1: useMemo missing dependency 'segments' (student dashboard page)"
# Replace useMemo(..., []) -> useMemo(..., [segments]) ONLY for memo blocks that reference `segments`.
# This is deliberately conservative: only changes deps when the memo callback contains the word "segments".
perl -0777 -i -pe '
  $changed = 0;
  s{
    (useMemo\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?\bsegments\b[\s\S]*?\}\s*,\s*)\[\s*\](\s*\))
  }{$1[segments]$2}gex;
  END { }
' "$PAGE"

echo "🛠️  Fix 2: Tailwind canonical class bg-gradient-to-r -> bg-linear-to-r (student dashboard page)"
# Safe, exact token replacement
perl -i -pe 's/\bbg-gradient-to-r\b/bg-linear-to-r/g' "$PAGE"

echo
echo "🛠️  Fix 3: 'Segment' defined but never used (MasteryDonut.tsx)"
# Make Segment type exported and actually used in props typing.
#  - If there is `type Segment = ...`, convert to `export type Segment = ...`
perl -i -pe 's/^\s*type\s+Segment\s*=/export type Segment =/ if $. == 1 || $. == 2 || $. == 3 || $. == 4' "$DONUT"

# Remove stray no-unused-expressions line (commonly a lone `Segment;` or similar)
perl -i -ne 'print unless /^\s*Segment\s*;?\s*$/' "$DONUT"

# Ensure the component uses Segment[] in its props type.
# Case A: untyped params: export default function MasteryDonut({ segments }) { ... }
perl -0777 -i -pe '
  s/export\s+default\s+function\s+MasteryDonut\s*\(\s*\{\s*segments\s*\}\s*\)\s*\{/
    export default function MasteryDonut({ segments }: { segments: Segment[] }) {/s
' "$DONUT"

# Case B: typed as any: export default function MasteryDonut({ segments }: any) { ... }
perl -0777 -i -pe '
  s/export\s+default\s+function\s+MasteryDonut\s*\(\s*\{\s*segments\s*\}\s*:\s*any\s*\)\s*\{/
    export default function MasteryDonut({ segments }: { segments: Segment[] }) {/s
' "$DONUT"

# Case C: typed with inline object but segments:any[] -> Segment[]
perl -0777 -i -pe '
  s/(\{\s*segments\s*:\s*)any(\s*\[\s*\]\s*\})/$1Segment$2/s
' "$DONUT"

echo
echo "✅ Patch applied."
echo
echo "Next:"
echo "  pnpm -C apps/web lint   (or: pnpm lint)"
echo "  pnpm -C apps/web dev    (or: pnpm dev)"
