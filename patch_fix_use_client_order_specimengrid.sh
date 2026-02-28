#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" 2>/dev/null || cd "$(pwd)"

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Missing: $FILE"
  exit 1
fi

cp "$FILE" "${FILE}.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
lines = p.read_text(encoding="utf-8").splitlines()

# Find "use client"
use_idx = None
for i, ln in enumerate(lines):
    if ln.strip().strip(";") in ['"use client"', "'use client'"]:
        use_idx = i
        break

if use_idx is None:
    raise SystemExit('❌ No "use client" directive found.')

# Remove it from current location
lines.pop(use_idx)

# Remove leading blank lines
while lines and lines[0].strip() == "":
    lines.pop(0)

# Insert at top (must be the first statement)
lines.insert(0, '"use client";')
lines.insert(1, "")

p.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
print("✅ Moved 'use client' to the top of SpecimenGrid.tsx")
PY

echo "✅ Done. Restart dev server:"
echo "  pnpm -C apps/web dev"
