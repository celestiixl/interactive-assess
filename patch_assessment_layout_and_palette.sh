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

ts="$(date +%Y%m%d_%H%M%S)"
cp -v "$PAGE" "$PAGE.bak.$ts" >/dev/null
echo "✅ backup: $PAGE.bak.$ts"

python - <<'PY'
import pathlib, re

path = pathlib.Path("apps/web/src/app/assessment/page.tsx")
if not path.exists():
    path = pathlib.Path("apps/web/app/assessment/page.tsx")

t = path.read_text(encoding="utf-8")

# 1) Make the main container properly wide and centered, but not tiny.
t = t.replace("max-w-7xl", "max-w-screen-2xl")

# 2) Replace the current single green glow with a 3-color biology palette:
# emerald (growth), teal (water/membranes), amber (feedback)
t = re.sub(
    r'<div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />',
    '<div className="absolute inset-0 bg-gradient-to-b from-emerald-500/6 via-teal-500/4 to-transparent" />',
    t
)

t = re.sub(
    r'<div className="absolute inset-0 bg-\[radial-gradient\(60%_50%_at_50%_0%,rgba\(16,185,129,0\.12\),rgba\(255,255,255,0\)\)\]" />',
    '<div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_35%_0%,rgba(20,184,166,0.14),rgba(255,255,255,0))]" />\n        <div className="absolute inset-0 bg-[radial-gradient(50%_45%_at_70%_10%,rgba(245,158,11,0.10),rgba(255,255,255,0))]" />',
    t
)

# 3) Improve the card corner glows to include teal + amber too
t = t.replace(
    'bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/15',
    'bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/15'
)

# Add a second glow layer inside CardLink (inject after existing glow div)
if "subtle corner glow" in t and "bg-teal-500/10" not in t:
    t = t.replace(
        '<div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/15" />',
        '<div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-emerald-500/15" />\n      <div className="pointer-events-none absolute -left-28 -bottom-28 h-56 w-56 rounded-full bg-teal-500/10 blur-3xl transition group-hover:bg-teal-500/15" />\n      <div className="pointer-events-none absolute right-10 top-10 h-28 w-28 rounded-full bg-amber-500/8 blur-2xl transition group-hover:bg-amber-500/12" />'
    )

# 4) Fix the whitespace on XL by making a real 2+1 layout:
# - Outer grid: xl:grid-cols-3
# - Left area: xl:col-span-2 grid (2 cards)
# - Right area: xl:col-span-1 stacked panels (Quick links + What's next)
#
# If our previous patch left the quick links outside the grid, pull it into a right column.
# We'll replace the section that starts with the grid and includes the quick links block.

# Find the first occurrence of the role cards grid (CardLink student+teacher)
grid_start = t.find('className="grid grid-cols-1')
if grid_start != -1:
    # Ensure grid classes include xl 3 cols
    t = t.replace(
        'className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"',
        'className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"'
    )
    # If the left wrapper exists from earlier patch, keep it.
else:
    pass

# Ensure the Quick links block has a wrapper we can relocate.
# We'll do a conservative transformation: look for the existing "Quick links" block and wrap it
# into a right column container, along with a new "What’s next" panel.

# Identify the Quick links container block
quick_pat = re.compile(r'(<div className="rounded-2xl border bg-background/60 p-5 backdrop-blur"[\s\S]*?</div>\s*)', re.M)
qm = quick_pat.search(t)
if qm:
    quick_block = qm.group(1)

    whats_next = r'''
          <div className="mt-4 rounded-2xl border bg-background/60 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">What’s next</div>
              <span className="inline-flex items-center rounded-full border bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground">
                roadmap
              </span>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500/70" />
                <span>Inline Choice: show in pills + builder + runner (no hook errors).</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500/70" />
                <span>Role-based login routing (student/teacher) + “remember my view”.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-500/70" />
                <span>Accommodations: text-to-speech, extended time, reduced answer choices.</span>
              </li>
            </ul>
          </div>
'''

    # Remove quick block from its current location
    t = t[:qm.start()] + t[qm.end():]

    # Insert right column stack right after the role cards grid closes.
    # We look for the closing tag of the role cards grid: "</div>\n\n          <div className="pt-2 ..."
    anchor = re.search(r'(</div>\s*\n\s*\n\s*<div className="pt-2 text-xs text-muted-foreground">)', t)
    if anchor:
        insert_at = anchor.start(1)
        right_col = (
            '\n          <div className="xl:col-span-1">\n' +
            quick_block +
            whats_next +
            '\n          </div>\n\n'
        )
        # Now ensure the outer grid actually contains the left role cards wrapper.
        # If we don't already have a left wrapper, create one by wrapping the two CardLinks.
        # We’ll look for the two CardLink calls and wrap them if needed.
        if 'xl:col-span-2' not in t:
            # Wrap the first two CardLinks inside xl:col-span-2
            # Very conservative: only if we can find the two CardLink blocks adjacent.
            pair = re.search(r'(<CardLink[\s\S]*?href="/student/assessment"[\s\S]*?/>\s*<CardLink[\s\S]*?href="/teacher/dashboard"[\s\S]*?/>)', t)
            if pair:
                wrapped = (
                    '<div className="xl:col-span-2 grid grid-cols-1 gap-4 lg:grid-cols-2">\n'
                    + pair.group(1) +
                    '\n</div>'
                )
                t = t[:pair.start(1)] + wrapped + t[pair.end(1):]

        t = t[:insert_at] + right_col + t[insert_at:]

# 5) Slightly enrich chips so they aren’t all the same muted tone (still subtle)
t = t.replace(
    'bg-background/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur',
    'bg-background/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur shadow-[0_1px_0_rgba(2,6,23,0.04)]'
)

path.write_text(t, encoding="utf-8")
print("✅ Patched layout + palette:", path)
PY

echo "🎯 Done. Hard refresh /assessment (Ctrl+Shift+R)."
