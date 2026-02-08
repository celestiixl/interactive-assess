#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1

if [ -d apps/web/src/app ]; then
  APP_ROOT=apps/web/src/app
else
  APP_ROOT=apps/web/app
fi

LAYOUT="$APP_ROOT/layout.tsx"
GLOBALS=""
for cand in \
  apps/web/src/app/globals.css \
  apps/web/app/globals.css \
  apps/web/src/styles/globals.css \
  apps/web/styles/globals.css
do
  [ -f "$cand" ] && GLOBALS="$cand" && break
done

ts(){ date +%Y%m%d_%H%M%S; }

[ -f "$LAYOUT" ] && cp "$LAYOUT" "$LAYOUT.bak.$(ts)" || true
[ -n "${GLOBALS:-}" ] && cp "$GLOBALS" "$GLOBALS.bak.$(ts)" || true

python - <<'PY'
from pathlib import Path
import re, sys

# Find globals.css (best effort)
globals_candidates = [
    Path("apps/web/src/app/globals.css"),
    Path("apps/web/app/globals.css"),
    Path("apps/web/src/styles/globals.css"),
    Path("apps/web/styles/globals.css"),
]
gpath = next((p for p in globals_candidates if p.exists()), None)

def ensure_global_css_fix(p: Path):
    t = p.read_text(encoding="utf-8")
    orig = t

    # 1) Remove browser default margins that cause outer white gutters
    # 2) Make body background match dark app surface
    # 3) Ensure full height
    inject = """
/* --- app shell hard reset (added by patch) --- */
html, body { height: 100%; }
body { margin: 0; background: #05070d; }
#__next, #root { height: 100%; }
/* --- end patch --- */
"""
    if "app shell hard reset" not in t:
        t = inject.strip() + "\n\n" + t

    # Some templates set body background white explicitly; neutralize common cases
    t = re.sub(r'body\s*\{\s*[^}]*background[^;]*;\s*[^}]*\}', lambda m: m.group(0), t)

    if t != orig:
        p.write_text(t, encoding="utf-8")
        return True
    return False

changed_globals = False
if gpath:
    changed_globals = ensure_global_css_fix(gpath)

# Patch layout to use a softer background (less “black hole”)
layout = Path("apps/web/src/app/layout.tsx")
if not layout.exists():
    layout = Path("apps/web/app/layout.tsx")

if not layout.exists():
    print("❌ layout.tsx not found")
    sys.exit(1)

t = layout.read_text(encoding="utf-8")
orig = t

# Soften any extreme dark gradients / pure black usage
t = t.replace("bg-black", "bg-slate-950")
t = t.replace("from-black", "from-slate-950")
t = t.replace("via-black", "via-slate-900")
t = t.replace("to-black", "to-slate-950")

# If layout wraps children in a centered container, remove it (common whitespace source)
# Remove max-w-* / container tokens wherever they appear in className strings
t = re.sub(r'\bmax-w-[^\s"]+\b', '', t)
t = re.sub(r'\bcontainer\b', '', t)
t = re.sub(r'\s{2,}', ' ', t)

# Ensure body/main wrapper uses w-full
def add_w_full(m):
    cls = m.group(1)
    if "w-full" not in cls:
        cls = cls.strip() + " w-full"
    if "min-h-screen" not in cls and "min-h-dvh" not in cls:
        cls = cls.strip() + " min-h-screen"
    return f'className="{cls}"'

t2, n = re.subn(r'className="([^"]*(?:mx-auto)[^"]*)"', add_w_full, t, count=1)
if n:
    t = t2

if t != orig:
    layout.write_text(t, encoding="utf-8")

print("✅ globals.css patched:", bool(gpath) and changed_globals)
print("✅ layout.tsx softened:", t != orig)
if not changed_globals and t == orig:
    print("❌ Nothing changed (files differ).")
    sys.exit(1)
PY

echo "✅ Done. Restart dev server + hard refresh."
