#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Find Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router"
  exit 1
fi
echo "✅ APP_ROOT=$APP_ROOT"

ASMT="$APP_ROOT/assessment/page.tsx"
LAYOUT="$APP_ROOT/layout.tsx"

[ -f "$ASMT" ] || { echo "❌ missing: $ASMT"; exit 1; }

ts() { date +%Y%m%d_%H%M%S; }

cp -v "$ASMT" "$ASMT.bak.$(ts)" >/dev/null
[ -f "$LAYOUT" ] && cp -v "$LAYOUT" "$LAYOUT.bak.$(ts)" >/dev/null || true

python - <<'PY'
from pathlib import Path
import re
import sys
import datetime as dt

def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")

def write(p: Path, s: str):
    p.write_text(s, encoding="utf-8")

# Resolve paths
asmt = Path("apps/web/src/app/assessment/page.tsx")
layout = Path("apps/web/src/app/layout.tsx")
if not asmt.exists():
    asmt = Path("apps/web/app/assessment/page.tsx")
if not layout.exists():
    layout = Path("apps/web/app/layout.tsx")

t = read(asmt)
orig = t
changes = []

def sub(pattern, repl, flags=0, count=0, label=""):
    global t
    t2, n = re.subn(pattern, repl, t, flags=flags, count=count)
    if n:
        t = t2
        changes.append((label or pattern, n))

# -------------------------
# 1) Kill the giant dark bottom vignette / veil INSIDE assessment page
#    (these are usually fixed/absolute overlays that darken everything)
# -------------------------
sub(r'\n\s*<div[^>]*className="[^"]*(fixed|absolute)[^"]*inset-0[^"]*(bg-black|bg-\[radial-gradient|bg-gradient)[^"]*"[^>]*/>\s*',
    '\n', flags=re.S, label="remove fullscreen overlay divs")

# Also remove any top-only overlay we previously inserted (absolute top h-[..] radial gradients)
sub(r'\n\s*<div[^>]*className="pointer-events-none absolute inset-x-0 top-0 h-\[[^\]]+\][^"]*radial-gradient[^"]*"[^>]*/>\s*',
    '\n', flags=re.S, label="remove top-only atmosphere overlay")

# -------------------------
# 2) Make the page fill the viewport width like a dashboard (less white margins)
#    Replace common "max-w-5xl/max-w-6xl/max-w-7xl" containers with 2xl + w-full
# -------------------------
# Any main inner wrapper that looks like mx-auto max-w-*
sub(r'mx-auto\s+max-w-(?:4xl|5xl|6xl|7xl)\b', 'mx-auto w-full max-w-screen-2xl', label="widen container max-w-* -> screen-2xl")

# Ensure we have generous horizontal padding on the main container
# Add px-6 if container has "mx-auto w-full max-w-screen-2xl" but no px-
def add_px(match):
    cls = match.group(1)
    if re.search(r'\bpx-\d', cls):
        return match.group(0)
    return f'className="{cls} px-6"'

t2, n = re.subn(r'className="([^"]*mx-auto w-full max-w-screen-2xl[^"]*)"', add_px, t)
if n:
    t = t2
    changes.append(("add px-6 to main container", n))

# Ensure main wrapper uses min-h-screen (so we don't get a weird dead-zone)
sub(r'className="([^"]*)"', lambda m: m.group(0), label="noop")  # keep structure

# -------------------------
# 3) Lighten card surfaces a bit (so it’s not all smoked)
# -------------------------
t = t.replace("dark:bg-zinc-900/70", "dark:bg-zinc-900/55")
t = t.replace("dark:bg-zinc-900/60", "dark:bg-zinc-900/50")
t = t.replace("bg-background/90", "bg-background/95")
t = t.replace("border-white/10", "border-white/14")
t = t.replace("border-white/12", "border-white/16")
t = t.replace("rgba(0,0,0,0.35)", "rgba(0,0,0,0.20)")
t = t.replace("rgba(0,0,0,0.45)", "rgba(0,0,0,0.28)")

# -------------------------
# 4) If the assessment page’s own background gradient is too harsh, soften it
# -------------------------
t = t.replace("dark:via-black", "dark:via-slate-950")
t = t.replace("dark:from-zinc-950", "dark:from-slate-950")
t = t.replace("dark:to-zinc-950", "dark:to-slate-900")

# Write assessment page
if t == orig:
    print("⚠️ assessment/page.tsx: no textual changes detected (file may differ).", file=sys.stderr)
else:
    write(asmt, t)
    print("✅ Patched:", asmt)

# -------------------------
# 5) Also check global layout for a vignette overlay (very common cause)
#    Remove/soften any fixed inset-0 dark overlays and pure-black gradients.
# -------------------------
if layout.exists():
    lt = read(layout)
    lorig = lt
    lchanges = []

    def lsub(pattern, repl, flags=0, count=0, label=""):
        nonlocal lt
        lt2, n = re.subn(pattern, repl, lt, flags=flags, count=count)
        if n:
            lt = lt2
            lchanges.append((label or pattern, n))

    # Remove fullscreen overlay divs that darken everything
    lsub(r'\n\s*<div[^>]*className="[^"]*(fixed|absolute)[^"]*inset-0[^"]*(bg-black|bg-gradient|radial-gradient)[^"]*"[^>]*/>\s*',
         '\n', flags=re.S, label="layout: remove fullscreen overlay divs")

    # Soften global gradient if it uses black
    lt = lt.replace("via-black", "via-slate-950")
    lt = lt.replace("to-black", "to-slate-950")
    lt = lt.replace("from-black", "from-slate-950")

    if lt != lorig:
        write(layout, lt)
        print("✅ Patched:", layout)
        for k,n in lchanges:
            print(f"   - {k}: {n}")
    else:
        print("ℹ️ layout.tsx: no overlay changes found (ok).")
else:
    print("ℹ️ layout.tsx not found (skipping).")

print("✅ Done. Hard refresh your browser (Ctrl+Shift+R).")
PY

echo "🎯 Patch complete."
