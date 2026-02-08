#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# --- free port 3010 ---
if command -v lsof >/dev/null 2>&1; then
  PIDS="$(lsof -ti tcp:3010 || true)"
  if [ -n "${PIDS:-}" ]; then
    echo "🧹 Killing process(es) on :3010 -> $PIDS"
    kill -9 $PIDS || true
  else
    echo "✅ :3010 is free"
  fi
else
  echo "⚠️ lsof not found; trying fuser"
  if command -v fuser >/dev/null 2>&1; then
    fuser -k 3010/tcp || true
  fi
fi

# Find Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router at apps/web/src/app or apps/web/app"
  exit 1
fi

LAYOUT="$APP_ROOT/layout.tsx"
ASMT="$APP_ROOT/assessment/page.tsx"

echo "✅ APP_ROOT=$APP_ROOT"
echo "✅ LAYOUT=$LAYOUT"
echo "✅ ASMT=$ASMT"

ts="$(date +%Y%m%d_%H%M%S)"

# --- (A) Make RootLayout full-bleed (removes outer whitespace) ---
if [ -f "$LAYOUT" ]; then
  cp -f "$LAYOUT" "$LAYOUT.bak.$ts"
  cat > "$LAYOUT" <<'TSX'
import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
TSX
  echo "✅ RootLayout now full-bleed (no global p-6 wrapper)"
fi

# --- (B) Force /assessment into LIGHT dashboard styling ---
[ -f "$ASMT" ] || { echo "❌ missing: $ASMT"; exit 1; }
cp -f "$ASMT" "$ASMT.bak.$ts"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
  p = Path("apps/web/app/assessment/page.tsx")

s = p.read_text(encoding="utf-8")

# 1) Outer page background -> light only
s = re.sub(
  r'className="min-h-screen bg-gradient-to-b [^"]*"',
  'className="min-h-dvh bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900"',
  s,
  count=1
)

# 2) Sticky header -> light glass instead of dark
s = re.sub(
  r'<header className="sticky top-0 z-20 [^"]*">',
  '<header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">',
  s,
  count=1
)

# 3) The inner header row: REMOVE any accidental viewport-height / dark bg classes
s = re.sub(
  r'className="flex w-full([^"]*)px-6 py-4[^"]*"',
  'className="flex w-full\\1px-6 py-4"',
  s,
  count=1
)
s = s.replace(" min-h-dvh", "").replace(" py-8", "").replace(" bg-slate-950", "").replace(" text-slate-100", "")

# 4) Convert “dark shell” borders/backgrounds on this page to light equivalents
repls = [
  (r'border-white/14', 'border-slate-200/70'),
  (r'border-white/16', 'border-slate-200/80'),
  (r'bg-background/95', 'bg-white/85'),
  (r'bg-background/90', 'bg-white/80'),
  (r'bg-muted/20', 'bg-slate-50/70'),
  (r'bg-muted/30', 'bg-slate-50/80'),
  (r'bg-muted/35', 'bg-slate-100/70'),
  (r'bg-muted/15', 'bg-slate-50/70'),
  (r'dark:bg-zinc-900/55', ''),   # remove dark overrides
  (r'dark:from-slate-950', ''),
  (r'dark:via-zinc-950', ''),
  (r'dark:to-slate-950', ''),
  (r'dark:text-zinc-100', ''),
  (r'dark:text-zinc-300', ''),
  (r'text-foreground/90', 'text-slate-700'),
  (r'text-muted-foreground', 'text-slate-500'),
]
for a,b in repls:
  s = re.sub(a, b, s)

# 5) Make the title/subtitle readable in light mode
s = s.replace("text-foreground/90", "text-slate-700")
s = s.replace("text-foreground/80", "text-slate-600")

# 6) Reduce heavy shadows a bit (less “ink puddle”)
s = s.replace("shadow-[0_14px_50px_rgba(0,0,0,0.06)]", "shadow-[0_10px_30px_rgba(2,6,23,0.08)]")
s = s.replace("shadow-[0_14px_40px_rgba(2,6,23,0.06)]", "shadow-[0_10px_26px_rgba(2,6,23,0.10)]")

p.write_text(s, encoding="utf-8")
print("✅ /assessment forced into light dashboard styling")
PY

echo
echo "🎯 Done."
echo "Now run:"
echo "  pnpm --filter web dev -p 3010"
echo "Then hard refresh: Ctrl+Shift+R (and refresh the preview frame if using it)."
