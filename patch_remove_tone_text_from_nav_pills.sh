#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router"
  exit 1
fi

PAGE="$APP_ROOT/assessment/page.tsx"
[ -f "$PAGE" ] || { echo "❌ missing: $PAGE"; exit 1; }

cp "$PAGE" "$PAGE.bak.$(date +%Y%m%d_%H%M%S)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
  p = Path("apps/web/app/assessment/page.tsx")

s = p.read_text(encoding="utf-8")

# Replace the pill text {tone} with a dot span
s, n = re.subn(
  r'<Pill tone=\{tone\}>\{tone\}</Pill>',
  '<Pill tone={tone}><span className="h-2 w-2 rounded-full bg-current opacity-70" /></Pill>',
  s,
  count=1
)

p.write_text(s, encoding="utf-8")
print(f"✅ Updated NavItem pill content (replacements: {n}).")
PY

echo "🎯 Done. Hard refresh /assessment (Ctrl+Shift+R)."
