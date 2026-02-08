#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
else
  APP_ROOT="apps/web/app"
fi

PAGE="$APP_ROOT/assessment/page.tsx"
[ -f "$PAGE" ] || { echo "❌ missing: $PAGE"; exit 1; }

cp "$PAGE" "$PAGE.bak.$(date +%Y%m%d_%H%M%S)"

python - <<'PY'
import pathlib, re

p = pathlib.Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
    p = pathlib.Path("apps/web/app/assessment/page.tsx")

t = p.read_text(encoding="utf-8")

# 1) Warm the background slightly + add soft "bio speckle" glows (subtle)
# Insert an extra warm radial layer if not present.
if "rgba(245,158,11,0.10)" in t and "rgba(236,72,153" not in t:
    t = t.replace(
        '<div className="absolute inset-0 bg-[radial-gradient(50%_45%_at_70%_10%,rgba(245,158,11,0.10),rgba(255,255,255,0))]" />',
        '<div className="absolute inset-0 bg-[radial-gradient(50%_45%_at_70%_10%,rgba(245,158,11,0.10),rgba(255,255,255,0))]" />\n'
        '        <div className="absolute inset-0 bg-[radial-gradient(35%_30%_at_18%_28%,rgba(236,72,153,0.06),rgba(255,255,255,0))]" />'
    )

# 2) Make H1 a touch larger + friendlier tracking
t = t.replace(
    'className="text-3xl font-semibold tracking-tight text-foreground"',
    'className="text-4xl font-semibold tracking-tight text-foreground"'
)

# 3) Cards: reduce sterile border, add soft highlight + warmer shadow
# CardLink container
t = t.replace(
    'className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"',
    'className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-[0_10px_30px_rgba(2,6,23,0.10)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(2,6,23,0.14)]"'
)

# Add a gentle top highlight line inside CardLink if not present
if "top highlight" not in t:
    t = t.replace(
        "      {/* accent rail */}",
        "      {/* top highlight */}\n"
        "      <div className=\"pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent\" />\n\n      {/* accent rail */}"
    )

# 4) Pill chips: remove inner-shadow "clinical" feel, add soft drop shadow and slightly rounder
t = t.replace(
    'shadow-inner',
    'shadow-[0_6px_14px_rgba(2,6,23,0.10)]'
)

# 5) Quick links panel: make it feel like a section, not a form box
t = t.replace(
    'className="rounded-2xl border border-foreground/10 bg-background/85 p-5 backdrop-blur',
    'className="rounded-2xl border border-foreground/10 bg-background/70 p-6 backdrop-blur shadow-[0_10px_30px_rgba(2,6,23,0.10)]'
)

# 6) The "What's next" inner card: soften it and add tiny gradient
t = t.replace(
    'className="mt-4 rounded-2xl border bg-background/60 p-5 backdrop-blur">',
    'className="mt-4 rounded-2xl border border-foreground/10 bg-background/65 p-5 backdrop-blur shadow-[0_10px_26px_rgba(2,6,23,0.10)]">'
)

# If "What's next" block exists but doesn't have a gradient glow, add one inside it
if "What’s next" in t and "bg-[radial-gradient(60%_70%_at_0%_0%" not in t:
    t = t.replace(
        '<div className="mt-4 rounded-2xl border border-foreground/10 bg-background/65 p-5 backdrop-blur shadow-[0_10px_26px_rgba(2,6,23,0.10)]">',
        '<div className="mt-4 rounded-2xl border border-foreground/10 bg-background/65 p-5 backdrop-blur shadow-[0_10px_26px_rgba(2,6,23,0.10)]">\n'
        '            <div className="pointer-events-none absolute" />'
    )
    # Better: add a local glow inside the panel (needs relative wrapper). Make the div relative.
    t = t.replace(
        'className="mt-4 rounded-2xl border border-foreground/10 bg-background/65 p-5 backdrop-blur shadow-[0_10px_26px_rgba(2,6,23,0.10)]">',
        'className="relative mt-4 rounded-2xl border border-foreground/10 bg-background/65 p-5 backdrop-blur shadow-[0_10px_26px_rgba(2,6,23,0.10)]">'
    )
    t = t.replace(
        '<div className="flex items-center justify-between">',
        '<div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl" />\n'
        '            <div className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full bg-amber-500/8 blur-3xl" />\n'
        '            <div className="flex items-center justify-between">'
    )

# 7) Tone down the sterile dot grid slightly (make it less "lab notebook")
t = t.replace('opacity-[0.08]', 'opacity-[0.06]')

p.write_text(t, encoding="utf-8")
print("✅ De-sterilized /assessment styling")
PY

echo "🎯 Done. Hard refresh /assessment."
