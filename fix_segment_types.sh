#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

echo "Creating shared Segment type..."
mkdir -p apps/web/src/types
cat > apps/web/src/types/segment.ts <<'TS'
export type Segment = {
  key: string;
  label: string;
  value: number;
  group?: string;
};
TS

echo "Patching page.tsx..."
PAGE="apps/web/src/app/(app)/student/dashboard/page.tsx"

# remove inline Segment type if present
sed -i '/type Segment = {/,/};/d' "$PAGE"

# remove `as any`
sed -i 's/as any//g' "$PAGE"

# import shared type if not already
grep -q 'from "@/types/segment"' "$PAGE" || \
sed -i '1s|^|import type { Segment } from "@/types/segment";\n|' "$PAGE"

# rename segments array to constant SEGMENTS
sed -i 's/const segments: Segment\[\] =/const SEGMENTS: Segment[] =/' "$PAGE"
sed -i 's/const segments = SEGMENTS;/const segments = SEGMENTS;/' "$PAGE"

echo "Patching MasteryDonut..."
MD="apps/web/src/components/student/MasteryDonut.tsx"
sed -i '/type Segment = {/,/};/d' "$MD"
sed -i '1s|^|import type { Segment } from "@/types/segment";\n|' "$MD"
sed -i 's/{ segments: any\[\] }/{ segments: Segment[] }/g' "$MD"
sed -i 's/: any//g' "$MD"

echo "Patching SpecimenGrid..."
SG="apps/web/src/components/student/SpecimenGrid.tsx"
sed -i '/type Segment = {/,/};/d' "$SG"
sed -i '1s|^|import type { Segment } from "@/types/segment";\n|' "$SG"
sed -i 's/{ segments: any\[\] }/{ segments: Segment[] }/g' "$SG"
sed -i 's/: any//g' "$SG"

echo "Done. Restarting dev server..."

pkill -f "next dev" || true
sleep 1
pnpm dev:web
