#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1

if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
else
  APP_ROOT="apps/web/app"
fi

PAGE="$APP_ROOT/assessment/page.tsx"

cp "$PAGE" "$PAGE.bak.$(date +%Y%m%d_%H%M%S)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
    p = Path("apps/web/app/assessment/page.tsx")

t = p.read_text()

# Replace the heavy fullscreen overlay with a light, top-only atmosphere layer
t2, n = re.subn(
    r'<div className="pointer-events-none fixed inset-0 bg-\[radial-gradient.*?\]" \/>',
    '<div className="pointer-events-none absolute inset-x-0 top-0 h-[42vh] '
    'bg-[radial-gradient(520px_260px_at_18%_18%,rgba(45,212,191,0.08),transparent),'
    'radial-gradient(520px_260px_at_78%_22%,rgba(245,158,11,0.07),transparent),'
    'radial-gradient(640px_320px_at_52%_80%,rgba(139,92,246,0.06),transparent)]" />',
    t,
    flags=re.S
)

if n == 0:
    raise SystemExit("Overlay block not found. Nothing changed.")

p.write_text(t2)
print("✅ Reduced dark overlay and limited it to top of page only.")
PY

echo "Done. Hard refresh the page."
