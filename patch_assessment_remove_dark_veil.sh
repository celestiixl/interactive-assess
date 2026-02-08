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

# Remove any fullscreen dark/gradient veil layers
patterns = [
    r'<div[^>]*className="[^"]*fixed[^"]*inset-0[^"]*bg-[^"]*"[^>]*/>',
    r'<div[^>]*className="[^"]*absolute[^"]*inset-0[^"]*bg-[^"]*"[^>]*/>',
    r'<div[^>]*className="[^"]*bg-gradient[^"]*"[^>]*/>'
]

removed = 0
for pat in patterns:
    t, n = re.subn(pat, '', t, flags=re.S)
    removed += n

# Boost base text contrast directly (safe for Server Components)
# Only inside this page by slightly strengthening existing text utilities
t = re.sub(
    r'className="([^"]*text-white/70[^"]*)"',
    lambda m: f'className="{m.group(1).replace("text-white/70","text-white/90")}"',
    t
)

p.write_text(t)
print(f"✅ Removed {removed} dark overlay layer(s). Contrast slightly boosted.")
PY

echo "Hard refresh /assessment after this."
