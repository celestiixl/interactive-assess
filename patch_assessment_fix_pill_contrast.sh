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

# Replace the tones map inside Chip()
old = re.search(r'const tones: Record<string, string> = \{[\s\S]*?\};', t)
if not old:
    raise SystemExit("❌ Could not find tones map in Chip()")

new = '''
  const tones: Record<string, string> = {
    neutral:
      "border-foreground/20 bg-background/90 text-foreground shadow-inner",

    teal:
      "border-teal-600/40 bg-teal-400/25 text-teal-950 dark:text-teal-100 shadow-inner",

    emerald:
      "border-emerald-600/40 bg-emerald-400/25 text-emerald-950 dark:text-emerald-100 shadow-inner",

    amber:
      "border-amber-600/40 bg-amber-400/30 text-amber-950 dark:text-amber-100 shadow-inner",

    slate:
      "border-slate-600/40 bg-slate-400/25 text-slate-950 dark:text-slate-100 shadow-inner",

    violet:
      "border-violet-600/40 bg-violet-400/25 text-violet-950 dark:text-violet-100 shadow-inner",
  };
'''.strip()

t = t[:old.start()] + new + t[old.end():]

p.write_text(t, encoding="utf-8")
print("✅ Pill contrast boosted")
PY

echo "🎯 Done. Hard refresh /assessment."
