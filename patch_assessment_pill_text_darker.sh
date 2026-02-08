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
[ -f "$PAGE" ] || { echo "❌ missing: $PAGE"; exit 1; }

cp "$PAGE" "$PAGE.bak.$(date +%Y%m%d_%H%M%S)"

python - <<'PY'
from pathlib import Path
import re

# pick correct path
p = Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
  p = Path("apps/web/app/assessment/page.tsx")

s = p.read_text(encoding="utf-8")

def sub_one(pattern, repl):
  global s
  s, n = re.subn(pattern, repl, s, count=1)
  return n

total = 0

# Darken pill text per tone while keeping pastel backgrounds
total += sub_one(
  r'teal:\s*"[^"]*"',
  'teal: "border-teal-200/70 bg-teal-100/70 text-teal-900 shadow-[0_0_0_1px_rgba(45,212,191,0.10)]"'
)
total += sub_one(
  r'emerald:\s*"[^"]*"',
  'emerald: "border-emerald-200/70 bg-emerald-100/70 text-emerald-900 shadow-[0_0_0_1px_rgba(52,211,153,0.10)]"'
)
total += sub_one(
  r'amber:\s*"[^"]*"',
  'amber: "border-amber-200/80 bg-amber-100/75 text-amber-900 shadow-[0_0_0_1px_rgba(251,191,36,0.10)]"'
)
total += sub_one(
  r'violet:\s*"[^"]*"',
  'violet: "border-violet-200/70 bg-violet-100/70 text-violet-900 shadow-[0_0_0_1px_rgba(167,139,250,0.10)]"'
)
total += sub_one(
  r'slate:\s*"[^"]*"',
  'slate: "border-slate-200/80 bg-slate-100/75 text-slate-800 shadow-[0_0_0_1px_rgba(148,163,184,0.10)]"'
)
total += sub_one(
  r'neutral:\s*"[^"]*"',
  'neutral: "border-slate-200/70 bg-slate-50 text-slate-800"'
)

p.write_text(s, encoding="utf-8")
print(f"✅ Updated pill tone text colors (replaced {total} tone lines).")
PY

echo "🎯 Done. Hard refresh /assessment (Ctrl+Shift+R)."
