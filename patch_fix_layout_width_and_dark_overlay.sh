#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1

if [ -d apps/web/src/app ]; then
  APP_ROOT=apps/web/src/app
else
  APP_ROOT=apps/web/app
fi

LAYOUT="$APP_ROOT/layout.tsx"

[ -f "$LAYOUT" ] || { echo "❌ layout.tsx not found"; exit 1; }

cp "$LAYOUT" "$LAYOUT.bak.$(date +%Y%m%d_%H%M%S)"

python - <<'PY'
from pathlib import Path
import re
import sys

p = Path("apps/web/src/app/layout.tsx")
if not p.exists():
    p = Path("apps/web/app/layout.tsx")

t = p.read_text(encoding="utf-8")
orig = t

# ------------------------------------------------------------
# 1. REMOVE full-screen dark / vignette overlays
# ------------------------------------------------------------
t, n1 = re.subn(
    r'<div[^>]+className="[^"]*(fixed|absolute)[^"]*inset-0[^"]*(gradient|bg-black|radial)[^"]*"[^>]*/>',
    '',
    t,
    flags=re.I
)

t, n2 = re.subn(
    r'<div[^>]+className="[^"]*(fixed|absolute)[^"]*inset-0[^"]*"[^>]*></div>',
    '',
    t,
    flags=re.I
)

# ------------------------------------------------------------
# 2. FORCE the main shell to be full width
#    (this is what is creating the huge white gutters)
# ------------------------------------------------------------
def widen(m):
    cls = m.group(1)

    cls = re.sub(r'max-w-[^\s"]+', '', cls)
    cls = re.sub(r'container', '', cls)

    if "w-full" not in cls:
        cls += " w-full"
    if "min-h-screen" not in cls:
        cls += " min-h-screen"

    return f'className="{cls.strip()}"'

t, n3 = re.subn(
    r'className="([^"]*(mx-auto)[^"]*)"',
    widen,
    t,
    count=1
)

# ------------------------------------------------------------
# 3. Remove global dark background gradients on body/main shell
# ------------------------------------------------------------
t = t.replace("bg-black", "bg-slate-950")
t = t.replace("from-black", "from-slate-950")
t = t.replace("to-black", "to-slate-950")
t = t.replace("via-black", "via-slate-950")

# ------------------------------------------------------------

if t == orig:
    print("❌ layout.tsx did not change. Paste layout.tsx and I will target it exactly.")
    sys.exit(1)

p.write_text(t, encoding="utf-8")

print("✅ layout.tsx patched")
print("Removed overlays:", n1 + n2)
print("Widened shell:", n3)
PY

echo
echo "✅ Done. Hard refresh your browser (Ctrl + Shift + R)."
