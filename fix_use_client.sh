#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"

cp "$FILE" "$FILE.bak.$(date +%s)"

python3 <<'PY'
from pathlib import Path

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
text = p.read_text()

# remove any existing use client occurrences
lines = [l for l in text.splitlines() if '"use client"' not in l]

# insert at very top
new_text = '"use client";\n\n' + "\n".join(lines)

p.write_text(new_text)
print("Moved 'use client' to top successfully")
PY

echo "Done."
