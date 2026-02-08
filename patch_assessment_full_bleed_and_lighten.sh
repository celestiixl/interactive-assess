#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router root"
  exit 1
fi

ts(){ date +%Y%m%d_%H%M%S; }

# Find likely assessment entry pages (you have at least /assessment + /student/assessment in play)
CANDIDATES=()
[ -f "$APP_ROOT/assessment/page.tsx" ] && CANDIDATES+=("$APP_ROOT/assessment/page.tsx")
[ -f "$APP_ROOT/student/assessment/page.tsx" ] && CANDIDATES+=("$APP_ROOT/student/assessment/page.tsx")
[ -f "$APP_ROOT/student/assessment/layout.tsx" ] && CANDIDATES+=("$APP_ROOT/student/assessment/layout.tsx")
[ -f "$APP_ROOT/assessment/layout.tsx" ] && CANDIDATES+=("$APP_ROOT/assessment/layout.tsx")

if [ ${#CANDIDATES[@]} -eq 0 ]; then
  echo "❌ couldn't find assessment page/layout under:"
  echo "   $APP_ROOT/assessment/* or $APP_ROOT/student/assessment/*"
  echo "   Run: ls -R $APP_ROOT | rg -n \"assessment\""
  exit 1
fi

echo "✅ APP_ROOT=$APP_ROOT"
printf "✅ Will patch:\n"; printf " - %s\n" "${CANDIDATES[@]}"

for f in "${CANDIDATES[@]}"; do
  cp "$f" "$f.bak.$(ts)"
done

python - <<'PY'
from pathlib import Path
import re

app_root = Path("apps/web/src/app") if Path("apps/web/src/app").exists() else Path("apps/web/app")

targets = []
for p in [
    app_root / "assessment" / "page.tsx",
    app_root / "student" / "assessment" / "page.tsx",
    app_root / "assessment" / "layout.tsx",
    app_root / "student" / "assessment" / "layout.tsx",
]:
    if p.exists():
        targets.append(p)

def strip_maxw(cls: str) -> str:
    cls = re.sub(r'\bmax-w-[^\s"]+\b', '', cls)
    cls = re.sub(r'\bcontainer\b', '', cls)
    cls = re.sub(r'\bmx-auto\b', '', cls)
    cls = re.sub(r'\s{2,}', ' ', cls).strip()
    return cls

def ensure_tokens(cls: str, tokens):
    for tok in tokens:
        if tok not in cls.split():
            cls += " " + tok
    return cls.strip()

def patch_file(p: Path):
    t = p.read_text(encoding="utf-8")
    orig = t

    # ---- 1) Kill the "black hole" overlays / vignettes commonly done with absolute inset-0 gradients
    # Remove obvious overlay divs (absolute/fixed + inset-0 + gradient/bg-black)
    t = re.sub(
        r'\n?\s*<div[^>]+className="[^"]*(?:fixed|absolute)[^"]*inset-0[^"]*(?:gradient|bg-black|from-black|to-black|via-black|opacity-)[^"]*"[^>]*/>\s*\n?',
        '\n',
        t,
        flags=re.I,
    )

    # If they were non-self-closing:
    t = re.sub(
        r'\n?\s*<div[^>]+className="[^"]*(?:fixed|absolute)[^"]*inset-0[^"]*(?:gradient|bg-black|from-black|to-black|via-black|opacity-)[^"]*"[^>]*>\s*</div>\s*\n?',
        '\n',
        t,
        flags=re.I,
    )

    # ---- 2) Force full-bleed page canvas (removes outer white margins even if inner grid is centered)
    # Replace first big wrapper className that has max-w/container/mx-auto with full-bleed + min-h-dvh + padded
    def repl_first_wrapper(m):
        cls = m.group(1)
        cls = strip_maxw(cls)
        cls = ensure_tokens(cls, [
            "w-full",
            "min-h-dvh",
            "px-6",
            "py-8",
            "bg-slate-950",
            "text-slate-100",
        ])
        return f'className="{cls}"'

    t, nwrap = re.subn(r'className="([^"]*(?:max-w-|container|mx-auto)[^"]*)"', repl_first_wrapper, t, count=1)

    # If no obvious centered wrapper was found, still enforce full-bleed on the first className we see
    if nwrap == 0:
        def repl_first_any(m):
            cls = m.group(1)
            cls = ensure_tokens(cls, ["w-full", "min-h-dvh"])
            # If this is the outermost wrapper, it should own bg/text
            if "bg-" not in cls:
                cls += " bg-slate-950"
            if "text-" not in cls:
                cls += " text-slate-100"
            return f'className="{cls.strip()}"'
        t, _ = re.subn(r'className="([^"]+)"', repl_first_any, t, count=1)

    # ---- 3) Lighten cards/panels so everything isn't crushed into near-black
    # Swap common ultra-dark backgrounds to readable "glass" panels
    swaps = [
        ("bg-black/80", "bg-slate-900/55"),
        ("bg-black/70", "bg-slate-900/50"),
        ("bg-black/60", "bg-slate-900/45"),
        ("bg-black/50", "bg-slate-900/40"),
        ("bg-black/40", "bg-slate-900/35"),
        ("bg-black/30", "bg-slate-900/30"),
        ("bg-slate-950/80", "bg-slate-900/55"),
        ("bg-slate-950/70", "bg-slate-900/50"),
        ("bg-slate-950/60", "bg-slate-900/45"),
    ]
    for a,b in swaps:
        t = t.replace(a,b)

    # Borders too dark: lift them
    t = t.replace("border-white/10", "border-slate-700/60")
    t = t.replace("border-white/15", "border-slate-700/70")
    t = t.replace("border-slate-800", "border-slate-700/70")
    t = t.replace("border-slate-900", "border-slate-700/60")

    # Text: ensure readable defaults
    t = t.replace("text-white/70", "text-slate-200")
    t = t.replace("text-white/60", "text-slate-300")
    t = t.replace("text-white/50", "text-slate-300")
    t = t.replace("text-slate-400", "text-slate-300")

    # ---- 4) Prevent any remaining parent from painting white behind the app
    # (If some wrapper uses bg-white/transparent, clamp it)
    t = t.replace("bg-white", "bg-slate-950")
    t = t.replace("bg-neutral-50", "bg-slate-950")
    t = t.replace("bg-gray-50", "bg-slate-950")

    if t != orig:
        p.write_text(t, encoding="utf-8")
        return True
    return False

changed = 0
for p in targets:
    if patch_file(p):
        changed += 1

print(f"✅ patched {changed}/{len(targets)} files")
PY

# Also hard-kill default page margin if your globals got missed
GLOBALS=""
for cand in \
  apps/web/src/app/globals.css \
  apps/web/app/globals.css \
  apps/web/src/styles/globals.css \
  apps/web/styles/globals.css
do
  [ -f "$cand" ] && GLOBALS="$cand" && break
done

if [ -n "${GLOBALS:-}" ]; then
  cp "$GLOBALS" "$GLOBALS.bak.$(ts)"
  python - <<PY
from pathlib import Path
p = Path("$GLOBALS")
t = p.read_text(encoding="utf-8")
marker = "/* --- full-bleed reset (added by patch) --- */"
if marker not in t:
    inject = f"""{marker}
html, body {{ height: 100%; }}
body {{ margin: 0; background: #05070d; }}
/* --- end patch --- */\n\n"""
    p.write_text(inject + t, encoding="utf-8")
    print("✅ globals reset injected:", p)
else:
    print("✅ globals reset already present")
PY
fi

echo
echo "✅ Done."
echo "👉 Now restart dev server and hard refresh (Ctrl+Shift+R)."
echo "   If you're in codespaces preview, refresh the *preview frame* too."
