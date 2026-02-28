#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"

echo "Re-creating runtime segments variable..."
python3 <<'PY'
from pathlib import Path
p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

# add runtime variable after SEGMENTS definition
s = s.replace(
"const SEGMENTS: Segment[] = [",
"const SEGMENTS: Segment[] = ["
)

# ensure runtime variable exists once
if "const segments = SEGMENTS;" not in s:
    s = s.replace(
"];",
"];\n\n  const segments = SEGMENTS;",
1
)

# fix memo deps
s = s.replace(
"useMemo(() => getBiomeHealth(segments), [segments])",
"useMemo(() => getBiomeHealth(segments), [])"
)

s = s.replace(
"useMemo(() => {",
"useMemo(() => {"
)

# remove 'SEGMENTS is assigned but never used' by actually using it
s = s.replace("SEGMENTS)", "segments)")

p.write_text(s)
PY

echo "Restarting dev server..."
pkill -f "next dev" || true
sleep 1
pnpm dev:web
