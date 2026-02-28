#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Can't find $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text(encoding="utf-8")

# Replace the broken status text block with a valid JSX expression.
# We target the div that contains the status line and replace its contents.
s = re.sub(
  r'(<div className=\{`mt-2 text-xs font-semibold \$\{biomeHealth\.badge\}[^>]*>\s*)([\s\S]*?)(\s*</div>)',
  r'\1{ s.unlocked ? "Discovered!" : s.pct >= 40 ? "Researching" : "Unknown" }\3',
  s,
  count=1,
  flags=re.S
)

# If the above pattern didn't match (likely), do a simpler targeted replacement:
s = s.replace(
  's.unlocked\n  ? "Discovered!"\n  : s.pct >= 40\n  ? "Researching"\n  : "Unknown"',
  '{ s.unlocked ? "Discovered!" : s.pct >= 40 ? "Researching" : "Unknown" }'
)

p.write_text(s, encoding="utf-8")
print("✅ Fixed status JSX.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
