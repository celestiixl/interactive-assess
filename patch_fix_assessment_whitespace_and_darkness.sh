#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

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

# ---- 1) Fix RootLayout padding wrapper (kills outer whitespace) ----
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
echo "✅ RootLayout: removed global padded wrapper"

# ---- 2) Patch /assessment: remove accidental min-h-dvh + extra dark inner wrapper ----
if [ -f "$ASMT" ]; then
  cp -f "$ASMT" "$ASMT.bak.$ts"

  python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
  p = Path("apps/web/app/assessment/page.tsx")

s = p.read_text(encoding="utf-8")

# A) Fix the header inner container that got polluted:
# Look for the line that currently contains:
# className="flex w-full ... px-6 py-4 min-h-dvh py-8 bg-slate-950 text-slate-100"
s2, n = re.subn(
  r'className="flex w-full([^"]*)px-6 py-4[^"]*min-h-dvh[^"]*"',
  'className="flex w-full\\1px-6 py-4"',
  s,
  count=1
)

# B) Make sticky header less dark (still sleek, just not black-hole)
# bg-zinc-950/80 -> bg-slate-950/70 (and keep backdrop blur)
s2, n2 = re.subn(
  r'(<header[^>]*className="[^"]*)bg-zinc-950/80([^"]*")',
  r'\1bg-slate-950/70\2',
  s2,
  count=1
)

# C) If your file has that stray dark block on the header container, remove it
s2 = s2.replace(" bg-slate-950 text-slate-100", "")

p.write_text(s2, encoding="utf-8")

print(f"✅ Patched assessment page: header container fixed={n>0}, header bg tweaked={n2>0}")
PY

else
  echo "⚠️ $ASMT not found, skipping assessment patch"
fi

echo
echo "🎯 Done."
echo "Next:"
echo "  1) Restart dev server"
echo "  2) Hard refresh (Ctrl+Shift+R) AND refresh the Codespaces preview frame if using it"
