#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1

if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
else
  APP_ROOT="apps/web/app"
fi

PAGE="$APP_ROOT/assessment/page.tsx"

cp "$PAGE" "$PAGE.bak.$(date +%s)"

python - <<'PY'
import pathlib, re

p = pathlib.Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
    p = pathlib.Path("apps/web/app/assessment/page.tsx")

t = p.read_text()

# Change the main background wrapper from absolute to fixed
# We only touch the first background container div
t = t.replace(
    'className="pointer-events-none absolute inset-0"',
    'className="pointer-events-none fixed inset-0"',
    1
)

p.write_text(t)
print("✅ assessment background is now full-bleed (fixed to viewport)")
PY

echo "🎯 Done. Hard refresh /assessment."
