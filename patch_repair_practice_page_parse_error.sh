#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/app/(app)/practice/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Missing: $FILE"
  exit 1
fi

cp "$FILE" "${FILE}.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/practice/page.tsx")
lines = p.read_text(encoding="utf-8").splitlines(True)

out = []
for i, ln in enumerate(lines):
    stripped = ln.strip()

    # Remove fragment wrappers that were auto-inserted
    if stripped in ("<>", "</>"):
        continue

    out.append(ln)

text = "".join(out)

# Remove a stray AccommodationsButton that appears as a sibling before <AppShell inside return (
# Example:
# return (
#   <AccommodationsButton ... />
#   <AppShell ...>
text = re.sub(
    r'(return\s*\(\s*\n)(\s*<AccommodationsButton[\s\S]*?/\>\s*\n)(\s*<AppShell\b)',
    r'\1\3',
    text,
    count=1,
    flags=re.M
)

# Also remove any AccommodationsButton accidentally placed between return( and first element
text = re.sub(
    r'(return\s*\(\s*\n)(\s*<AccommodationsButton[^;]*?/\>\s*\n)+(\s*<AppShell\b)',
    r'\1\3',
    text,
    count=1,
    flags=re.M
)

p.write_text(text, encoding="utf-8")
print("✅ Removed broken <> </> fragments and stray top-level AccommodationsButton in practice/page.tsx")
PY

echo "✅ Repaired practice/page.tsx parsing. Try:"
echo "  pnpm -C apps/web dev"
