#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" 2>/dev/null || cd "$(pwd)"

FILE="apps/web/src/components/student/MasteryDonut.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Missing: $FILE"
  exit 1
fi

cp "$FILE" "${FILE}.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/MasteryDonut.tsx")
lines = p.read_text(encoding="utf-8").splitlines()

# Find "use client" line index (if present)
use_idx = None
for i, ln in enumerate(lines):
    if ln.strip().strip(";") == '"use client"' or ln.strip().strip(";") == "'use client'":
        use_idx = i
        break

if use_idx is None:
    raise SystemExit('❌ No "use client" directive found.')

use_line = lines.pop(use_idx)

# Remove any blank lines at top after moving things around
while lines and lines[0].strip() == "":
    lines.pop(0)

# Ensure the directive is the very first statement
# Keep exactly: "use client";
use_line_norm = '"use client";'

# If the first non-empty line is already the directive, just normalize
if lines and lines[0].strip().strip(";") in ['"use client"', "'use client'"]:
    lines[0] = use_line_norm
else:
    lines.insert(0, use_line_norm)
    lines.insert(1, "")  # blank line after directive for readability

p.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
print("✅ Moved 'use client' to the top of MasteryDonut.tsx")
PY

echo "✅ Done. Re-run:"
echo "  pnpm -C apps/web dev"
