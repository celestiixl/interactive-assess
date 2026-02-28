#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/app/(app)/teacher/builder/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Missing: $FILE"
  exit 1
fi

cp "$FILE" "${FILE}.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path

p = Path("apps/web/src/app/(app)/teacher/builder/page.tsx")
t = p.read_text(encoding="utf-8")

t = t.replace("max-w-[1440px]", "max-w-360")
t = t.replace("min-h-[170px]", "min-h-42.5")
t = t.replace("min-h-[110px]", "min-h-27.5")
t = t.replace(
    "[grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]",
    "grid-cols-[repeat(auto-fit,minmax(240px,1fr))]"
)

p.write_text(t, encoding="utf-8")
print("✅ Replaced suggested canonical Tailwind classes in teacher/builder/page.tsx")
PY

echo "✅ Done. Re-run lint:"
echo "  pnpm -C apps/web lint"
