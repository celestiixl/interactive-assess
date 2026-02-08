#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Find Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router root"
  exit 1
fi

ASMT="$APP_ROOT/assessment/page.tsx"
[ -f "$ASMT" ] || { echo "❌ missing: $ASMT"; exit 1; }

ts="$(date +%Y%m%d_%H%M%S)"
cp -v "$ASMT" "$ASMT.bak.$ts" >/dev/null
echo "✅ backup: $ASMT.bak.$ts"

# 1) Kill whatever is on :3010 (best-effort)
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti tcp:3010 || true)"
  if [ -n "${PIDS:-}" ]; then
    echo "🧹 Killing process(es) on :3010 -> $PIDS"
    kill -9 $PIDS || true
  else
    echo "✅ :3010 is free"
  fi
elif command -v fuser >/dev/null 2>&1; then
  echo "🧹 Killing process(es) on :3010 via fuser"
  fuser -k 3010/tcp || true
else
  echo "⚠️ neither lsof nor fuser found; if 3010 stays busy, just run dev on a different port (3011/3012)."
fi

# 2) Fix the assessment header "dark full-height" class leak
python - <<'PY'
from pathlib import Path
import re

p = Path(r"""'"$ASMT"'""")
s = p.read_text(encoding="utf-8")

orig = s

# A) Make the header light (so it matches your new theme)
s = re.sub(
  r'<header className="sticky top-0 z-20[^"]*">',
  '<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur">',
  s,
  count=1
)

# B) Fix the inner header row: remove min-h-dvh / dark bg / duplicate py-8
#    (we replace any className that contains the known bad tokens)
def fix_header_row(match: re.Match) -> str:
  cls = match.group(1)

  # remove the poison tokens
  cls = cls.replace("min-h-dvh", "")
  cls = cls.replace("bg-slate-950", "")
  cls = cls.replace("text-slate-100", "")
  cls = cls.replace("py-8", "")  # keep normal py-4
  cls = re.sub(r"\s+", " ", cls).strip()

  # ensure it has the correct baseline spacing + colors
  # (keep flex + layout, but force light ink)
  if "px-6" not in cls:
    cls += " px-6"
  if "py-4" not in cls:
    cls += " py-4"
  if "text-slate-900" not in cls:
    cls += " text-slate-900"
  if "max-w-screen-2xl" not in cls:
    # optional: makes header content align with page width
    cls = cls.replace("w-full", "w-full max-w-screen-2xl mx-auto")

  cls = re.sub(r"\s+", " ", cls).strip()
  return f'<div className="{cls}">'

# target the first "header container" div (the one right after <header ...>)
s = re.sub(
  r'<header[^>]*>\s*<div className="([^"]*)">',
  lambda m: re.sub(r'<div className="([^"]*)">', lambda n: fix_header_row(n), m.group(0), count=1),
  s,
  count=1,
  flags=re.S
)

# C) Make the small text inside the header readable in light mode
s = s.replace('text-foreground/90', 'text-slate-900')
s = s.replace('text-muted-foreground dark:text-zinc-300', 'text-slate-600')

# D) Buttons in header: make them light
s = s.replace('border border-white/14 bg-muted/20', 'border border-slate-200 bg-white/70')
s = s.replace('hover:bg-muted/35', 'hover:bg-white')

if s == orig:
  print("⚠️ No changes matched (your file may differ). Paste your <header> block and I’ll target it exactly.")
else:
  p.write_text(s, encoding="utf-8")
  print("✅ Patched /assessment header: removed dark/min-h-dvh leak and set light topbar.")
PY

echo ""
echo "🎯 Done."
echo "Now run:"
echo "  pnpm --filter web dev -p 3010"
echo "Then hard refresh: Ctrl+Shift+R (and refresh the Codespaces preview frame if using it)."
