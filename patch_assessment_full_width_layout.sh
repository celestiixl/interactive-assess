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

ASSESS_PAGE="$APP_ROOT/assessment/page.tsx"
if [ ! -f "$ASSESS_PAGE" ]; then
  echo "❌ missing: $ASSESS_PAGE"
  exit 1
fi

ts="$(date +%Y%m%d_%H%M%S)"
cp -v "$ASSESS_PAGE" "$ASSESS_PAGE.bak.$ts" >/dev/null
echo "✅ backup: $ASSESS_PAGE.bak.$ts"

python - <<'PY'
import pathlib, re

path = pathlib.Path("apps/web/src/app/assessment/page.tsx")
if not path.exists():
    path = pathlib.Path("apps/web/app/assessment/page.tsx")

t = path.read_text(encoding="utf-8")

# 1) Expand container width: max-w-5xl -> max-w-7xl and add w-full
t = t.replace('max-w-5xl', 'max-w-7xl')

# 2) Make main truly fill viewport height with comfortable bottom padding
t = re.sub(r'className="relative min-h-\[calc\(100vh-0px\)\]"',
           'className="relative min-h-screen"',
           t)

# 3) Upgrade layout grid: on xl use 3 columns: student + teacher + quick links column
# Find the cards grid and change md:grid-cols-2 to xl:grid-cols-3, then make the quick links block span columns.
t = t.replace('grid grid-cols-1 gap-4 md:grid-cols-2',
              'grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3')

# 4) Wrap the two role cards in a div that spans 2 columns on xl, and make quick links a side column.
# We’ll do a safe regex transform around the two CardLink calls + the quick links container.
pattern = re.compile(
    r'(</div>\s*\n\s*<div className="grid[^"]*">\s*)(<CardLink[\s\S]*?href="/student/assessment"[\s\S]*?/>)(\s*)(<CardLink[\s\S]*?href="/teacher/dashboard"[\s\S]*?/>)(\s*\n\s*</div>\s*\n\s*\n\s*<div className="rounded-2xl border[\s\S]*?</div>)',
    re.M
)

m = pattern.search(t)
if m:
    prefix = m.group(1)
    student = m.group(2)
    teacher = m.group(4)
    quick = m.group(5)

    replacement = (
        prefix +
        '\n          <div className="xl:col-span-2 grid grid-cols-1 gap-4 lg:grid-cols-2">\n' +
        '            ' + student + '\n' +
        '            ' + teacher + '\n' +
        '          </div>\n\n' +
        '          <div className="xl:col-span-1">\n' +
        quick +
        '\n          </div>\n'
    )
    t = t[:m.start()] + replacement + t[m.end():]
else:
    # If structure differs, just make quick links span full width (less fancy but still better).
    t = t.replace('rounded-2xl border bg-background/60 p-5 backdrop-blur',
                  'rounded-2xl border bg-background/60 p-5 backdrop-blur xl:col-span-3')

# 5) Slightly increase padding on very large screens so it feels fuller
t = t.replace('px-6 py-12', 'px-6 py-12 2xl:px-10')

path.write_text(t, encoding="utf-8")
print("✅ Updated layout:", path)
PY

echo "🎯 Done. Refresh /assessment (hard reload)."
