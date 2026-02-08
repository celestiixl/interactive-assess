#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Find practice page (your error shows src/app/(app)/practice/page.tsx)
CANDIDATES=(
  "apps/web/src/app/(app)/practice/page.tsx"
  "apps/web/src/app/practice/page.tsx"
  "apps/web/app/(app)/practice/page.tsx"
  "apps/web/app/practice/page.tsx"
)

PRACTICE=""
for f in "${CANDIDATES[@]}"; do
  if [ -f "$f" ]; then PRACTICE="$f"; break; fi
done

[ -n "$PRACTICE" ] || { echo "❌ practice page not found in expected locations"; exit 1; }
echo "✅ PRACTICE=$PRACTICE"

cp "$PRACTICE" "$PRACTICE.bak.$(date +%Y%m%d_%H%M%S)"

python - <<PY
from pathlib import Path
import re

p = Path("$PRACTICE")
s = p.read_text(encoding="utf-8")

# If already imported, do nothing
if re.search(r'from\s+"@/components/ia/AppShell"', s) or re.search(r'from\s+"@/src/components/ia/AppShell"', s):
    print("✅ AppShell import already present")
    raise SystemExit(0)

# Insert after "use client" (if present), otherwise at very top after any leading comments
lines = s.splitlines()

insert_line = 'import { AppShell } from "@/components/ia/AppShell";'

out = []
i = 0

# Keep shebang/comments if any (rare in tsx), then handle "use client"
if lines and lines[0].startswith('"use client"'):
    out.append(lines[0])
    out.append("")
    out.append(insert_line)
    out.extend(lines[1:])
else:
    # If first non-empty is "use client", place after it
    # Otherwise place at top
    idx_uc = None
    for idx, line in enumerate(lines[:10]):
        if line.strip() == '"use client";':
            idx_uc = idx
            break
    if idx_uc is not None:
        out.extend(lines[:idx_uc+1])
        out.append("")
        out.append(insert_line)
        out.extend(lines[idx_uc+1:])
    else:
        out.append(insert_line)
        out.append("")
        out.extend(lines)

p.write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")
print("✅ Inserted AppShell import")
PY

echo "🎯 Done. Restart dev server + hard refresh."
