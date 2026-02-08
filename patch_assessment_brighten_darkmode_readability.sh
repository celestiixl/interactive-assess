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

bak="$PAGE.bak.$(date +%Y%m%d_%H%M%S)"
cp -v "$PAGE" "$bak" >/dev/null
echo "✅ backup: $bak"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
    p = Path("apps/web/app/assessment/page.tsx")

t = p.read_text(encoding="utf-8")
orig = t

def rep(a, b):
    global t
    n = t.count(a)
    if n:
        t = t.replace(a, b)
    return n

changes = {}

# 1) Stop using pure black in the page gradient (pure black eats contrast)
changes["via-black->via-zinc-950"] = rep("dark:via-black", "dark:via-zinc-950")
changes["to-zinc-950 stay"] = 0
# If you still have to-slate-950 etc, soften it too
changes["from-zinc-950->from-slate-950"] = rep("dark:from-zinc-950", "dark:from-slate-950")
changes["to-zinc-950->to-slate-950"] = rep("dark:to-zinc-950", "dark:to-slate-950")

# 2) Brighten card surfaces (they're currently too close to the background)
# Make dark cards less opaque (more "glass") and increase border visibility
changes["dark:bg-zinc-900/70->/55"] = rep("dark:bg-zinc-900/70", "dark:bg-zinc-900/55")
changes["bg-background/90->bg-background/95"] = rep("bg-background/90", "bg-background/95")

changes["border-white/10->border-white/14"] = rep("border-white/10", "border-white/14")
changes["border-white/12->border-white/16"] = rep("border-white/12", "border-white/16")

# 3) Shadows: reduce heavy black shadows that make everything feel like a cave
changes["shadow 0.35->0.22"] = rep("rgba(0,0,0,0.35)", "rgba(0,0,0,0.22)")
changes["shadow 0.45->0.28"] = rep("rgba(0,0,0,.45)", "rgba(0,0,0,.28)")

# 4) Text: boost readability by nudging muted text up
# (careful: do NOT destroy muted-foreground, just lift the common /70 + /80 patterns)
changes["text-foreground/70->/82"] = rep("text-foreground/70", "text-foreground/82")
changes["text-foreground/80->/90"] = rep("text-foreground/80", "text-foreground/90")
changes["dark:text-zinc-200->zinc-100"] = rep("dark:text-zinc-200", "dark:text-zinc-100")
changes["dark:text-zinc-400->zinc-300"] = rep("dark:text-zinc-400", "dark:text-zinc-300")

# 5) If you have an atmosphere overlay, reduce its strength (often makes mid-page look smoked)
# Reduce any rgba(...,0.10/0.09/0.08/0.07) to calmer values
def rgba_dim(m):
    v = float(m.group(1))
    v2 = max(0.03, min(0.06, v * 0.55))
    return f"{v2:.2f}".rstrip("0").rstrip(".")

# Only inside overlay strings (radial-gradient lines)
t2 = re.sub(r'rgba\([^)]*,\s*(0\.\d+)\)', lambda m: f"rgba({m.group(0).split('rgba(')[1].rsplit(',',1)[0]},{rgba_dim(m)})", t)
# Above is messy; do a safer targeted dim just for common alpha literals:
for a,b in [("0.10","0.06"),("0.09","0.055"),("0.08","0.05"),("0.07","0.045"),("0.06","0.04")]:
    t2 = t2.replace(f",rgba(45,212,191,{a})", f",rgba(45,212,191,{b})")
    t2 = t2.replace(f",rgba(245,158,11,{a})", f",rgba(245,158,11,{b})")
    t2 = t2.replace(f",rgba(139,92,246,{a})", f",rgba(139,92,246,{b})")
t = t2

total = sum(changes.values())
if t == orig or total == 0:
    raise SystemExit("❌ No changes applied. The file differs from expected strings—paste `sed -n '1,220p' apps/web/src/app/assessment/page.tsx` output and I’ll target exact lines.")

p.write_text(t, encoding="utf-8")

print("✅ Brightened /assessment dark mode. Changes:")
for k,v in changes.items():
    if v:
        print(f" - {k}: {v}")
print(f"Total replacements: {total}")
PY

echo "🎯 Done. Hard refresh /assessment (Ctrl+Shift+R)."
