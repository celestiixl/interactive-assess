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

PAGE="$APP_ROOT/assessment/page.tsx"
if [ ! -f "$PAGE" ]; then
  echo "❌ missing: $PAGE"
  exit 1
fi

bak="$PAGE.bak.$(date +%Y%m%d_%H%M%S)"
cp -v "$PAGE" "$bak" >/dev/null
echo "✅ backup: $bak"

python - <<'PY'
import re
from pathlib import Path

p = Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
    p = Path("apps/web/app/assessment/page.tsx")

t = p.read_text(encoding="utf-8")
orig = t

def subn(pattern, repl, flags=0, count=0):
    global t
    t, n = re.subn(pattern, repl, t, flags=flags, count=count)
    return n

changes = []

# 1) Page background: richer dark + add subtle color atmosphere overlay
n = subn(
    r'className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-black dark:to-slate-950"',
    'className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-zinc-950 dark:via-black dark:to-zinc-950"',
)
if n: changes.append(("bg gradient", n))

# Insert overlay right after that opening div if not already present
if 'pointer-events-none fixed inset-0 bg-[radial-gradient' not in t:
    n = subn(
        r'(<div className="min-h-screen bg-gradient-to-b[^"]*">)',
        r'\1\n      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(700px_380px_at_22%_12%,rgba(45,212,191,0.10),transparent),radial-gradient(720px_420px_at_70%_18%,rgba(245,158,11,0.09),transparent),radial-gradient(900px_520px_at_55%_72%,rgba(139,92,246,0.08),transparent)]" />',
        count=1
    )
    if n: changes.append(("overlay insert", n))

# 2) Header/top bar: stronger contrast borders + darker glass
n = subn(
    r'border-b border-foreground/10 bg-background/80 backdrop-blur',
    'border-b border-white/10 bg-zinc-950/80 backdrop-blur'
)
if n: changes.append(("topbar", n))

# 3) Sidebar + panels: use white borders in dark mode + slightly darker surface
n = subn(
    r'rounded-2xl border border-foreground/10 bg-background p-4 shadow-\[0_14px_40px_rgba\(2,6,23,0\.08\)\]',
    'rounded-2xl border border-white/10 bg-background/90 dark:bg-zinc-900/70 p-4 shadow-[0_14px_40px_rgba(2,6,23,0.12)]'
)
if n: changes.append(("sidebar shell", n))

n = subn(
    r'rounded-2xl border border-foreground/10 bg-background p-6 shadow-\[0_14px_40px_rgba\(2,6,23,0\.08\)\]',
    'rounded-2xl border border-white/10 bg-background/90 dark:bg-zinc-900/70 p-6 shadow-[0_14px_40px_rgba(2,6,23,0.12)]'
)
if n: changes.append(("panel shells", n))

# 4) ActionCard surface: lift cards off background
n = subn(
    r'rounded-2xl border border-foreground/10 bg-background p-6 shadow-\[0_14px_40px_rgba\(2,6,23,0\.10\)\]',
    'rounded-2xl border border-white/10 bg-background/90 dark:bg-zinc-900/70 p-6 shadow-[0_14px_50px_rgba(0,0,0,0.35)]'
)
if n: changes.append(("actioncard surface", n))

# 5) Primary copy readability in dark mode: promote main descriptions to zinc-200
# Target common "text-foreground/70" in primary paragraphs and list items
n = subn(r'text-foreground/70', 'text-foreground/80 dark:text-zinc-200')
if n: changes.append(("text contrast", n))

# Keep muted text for true meta; increase header subtitle a bit if present
n = subn(
    r'text-xs text-muted-foreground',
    'text-xs text-muted-foreground dark:text-zinc-400'
)
if n: changes.append(("muted tweak", n))

# 6) Pills: add more glow/contrast for dark UI
# Add shadow to base
n = subn(
    r'const base\s*=\s*"inline-flex items-center rounded-full border px-2\.5 py-1 text-xs font-semibold";',
    'const base = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm";'
)
if n: changes.append(("pill base shadow", n))

# Tone upgrades (only if those exact strings exist)
tone_map = {
    r'neutral: "border-foreground/10 bg-background text-foreground/70",':
        'neutral: "border-white/10 bg-background/90 dark:bg-zinc-900/60 text-foreground/80 dark:text-zinc-200",',

    r'teal: "border-teal-600/30 bg-teal-500/10 text-teal-900 dark:text-teal-200",':
        'teal: "border-teal-300/30 bg-teal-400/15 text-teal-950 dark:text-teal-200 shadow-[0_0_0_1px_rgba(45,212,191,0.18)]",',

    r'emerald:\s*"border-emerald-600/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",':
        'emerald: "border-emerald-300/30 bg-emerald-400/15 text-emerald-950 dark:text-emerald-200 shadow-[0_0_0_1px_rgba(52,211,153,0.16)]",',

    r'amber:\s*"border-amber-600/30 bg-amber-500/10 text-amber-950 dark:text-amber-200",':
        'amber: "border-amber-300/35 bg-amber-400/18 text-amber-950 dark:text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.16)]",',

    r'violet:\s*"border-violet-600/30 bg-violet-500/10 text-violet-950 dark:text-violet-200",':
        'violet: "border-violet-300/30 bg-violet-400/15 text-violet-950 dark:text-violet-200 shadow-[0_0_0_1px_rgba(167,139,250,0.16)]",',

    r'slate:\s*"border-slate-600/25 bg-slate-500/10 text-slate-900 dark:text-slate-200",':
        'slate: "border-slate-300/25 bg-slate-400/12 text-slate-950 dark:text-zinc-200 shadow-[0_0_0_1px_rgba(148,163,184,0.12)]",',
}
for pat, rep in tone_map.items():
    n = subn(pat, rep, flags=re.M)
    if n:
        changes.append((f"pill tone {pat.split(':')[0].strip()}", n))

# 7) Sidebar NavItem borders: use white/10 in dark
n = subn(r'border-foreground/15', 'border-white/12')
n2 = subn(r'border-foreground/10', 'border-white/10')
if n or n2: changes.append(("nav borders", (n+n2)))

if t == orig:
    raise SystemExit("❌ No changes applied (patterns not found). Your file likely differs from expected.")

p.write_text(t, encoding="utf-8")

print("✅ Applied changes:")
for k, n in changes:
    print(f" - {k}: {n}")
PY

echo "🎯 Done. Hard refresh /assessment (Ctrl+Shift+R)."
