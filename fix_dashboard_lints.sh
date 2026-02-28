#!/usr/bin/env bash
set -e
cd /workspaces/interactive-assess

echo "---- 1. Force 'use client' to top ----"
python3 <<'PY'
from pathlib import Path
p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
txt = p.read_text()

# remove existing directive
txt = txt.replace('"use client";', '').replace("'use client';", '')

# add at top
txt = '"use client";\n' + txt.lstrip()
p.write_text(txt)
PY

echo "---- 2. Fix Tailwind gradient rename ----"
grep -rl "bg-gradient-to-r" apps | xargs -r sed -i 's/bg-gradient-to-r/bg-linear-to-r/g'

echo "---- 3. Stabilize segments (fix useMemo warning) ----"
python3 <<'PY'
import re
from pathlib import Path
p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
txt = p.read_text()

# wrap segments array in useMemo if not already
txt = re.sub(
    r'const segments:\s*Segment\[\]\s*=\s*\[',
    'const segments = useMemo<Segment[]>(() => [',
    txt,
    count=1
)

# close the memo
txt = txt.replace('];\n\n  const biome', '], []);\n\n  const biome')

p.write_text(txt)
PY

echo "---- 4. Remove unsafe any ----"
sed -i 's/segments as any/segments/g' apps/web/src/app/\(app\)/student/dashboard/page.tsx

echo "---- 5. Fix MasteryDonut typing ----"
python3 <<'PY'
from pathlib import Path
p = Path("apps/web/src/components/student/MasteryDonut.tsx")
txt = p.read_text()

# remove stray fragment at top
txt = txt.replace("<>\n","").replace("\n<>","")

# ensure props typing
if "type Props" not in txt:
    txt = txt.replace(
        'import type { Segment } from "@/types/segment";',
        'import type { Segment } from "@/types/segment";\n\ntype Props = { segments: Segment[] };'
    )

txt = txt.replace(
    "export default function MasteryDonut(",
    "export default function MasteryDonut({ segments }: Props)"
)

p.write_text(txt)
PY

echo "---- 6. Restart server cleanly ----"
lsof -ti :3001 | xargs -r kill -9 || true

echo "DONE ✔  Now run:"
echo "pnpm dev:web"
