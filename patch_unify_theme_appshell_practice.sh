#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

APPSHELL="apps/web/src/components/ia/AppShell.tsx"
PRACTICE="apps/web/src/app/(app)/practice/page.tsx"

# find globals.css safely
for p in \
  "apps/web/src/app/globals.css" \
  "apps/web/app/globals.css" \
  "apps/web/src/styles/globals.css" \
  "apps/web/styles/globals.css"
do
  if [ -f "$p" ]; then GLOBALS_CSS="$p"; break; fi
done

[ -f "$APPSHELL" ] || { echo "❌ Missing: $APPSHELL"; exit 1; }
[ -f "$PRACTICE" ] || { echo "❌ Missing: $PRACTICE"; exit 1; }
[ -n "${GLOBALS_CSS:-}" ] || { echo "❌ Could not find globals.css"; exit 1; }

cp "$APPSHELL" "${APPSHELL}.bak.$(date +%Y%m%d_%H%M%S)"
cp "$PRACTICE" "${PRACTICE}.bak.$(date +%Y%m%d_%H%M%S)"
cp "$GLOBALS_CSS" "${GLOBALS_CSS}.bak.$(date +%Y%m%d_%H%M%S)"

echo "🎨 Adding shared theme utilities"

export TARGET_CSS="$GLOBALS_CSS"

python3 - <<'PY'
from pathlib import Path
import os

p = Path(os.environ["TARGET_CSS"])
t = p.read_text(encoding="utf-8")

if "IA THEME UTILITIES" not in t:
    t += """

/* IA THEME UTILITIES */
:root{
  --ia-bg: 248 250 252;
  --ia-card: 255 255 255;
  --ia-border: 226 232 240;
  --ia-shadow: 15 23 42;
}

.ia-bg{
  background:
    radial-gradient(1200px 800px at 50% 0%, rgba(59,130,246,0.10), transparent 60%),
    radial-gradient(900px 700px at 0% 20%, rgba(16,185,129,0.08), transparent 55%),
    radial-gradient(900px 700px at 100% 30%, rgba(168,85,247,0.08), transparent 55%),
    linear-gradient(180deg, rgb(var(--ia-bg)) 0%, #ffffff 55%, rgb(var(--ia-bg)) 100%);
}

.ia-grid::before{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  opacity:0.25;
  background-image:
    linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px);
  background-size:44px 44px;
}

.ia-card-soft{
  background: rgba(255,255,255,0.75);
  border:1px solid rgba(226,232,240,0.9);
  border-radius:24px;
  box-shadow:0 18px 50px rgba(15,23,42,.08);
  backdrop-filter: blur(10px);
}
"""
    p.write_text(t, encoding="utf-8")
    print("✅ Theme CSS injected")
else:
    print("ℹ️ Theme CSS already exists")
PY

echo "🎨 Removing practice page hardcoded background"
sed -i 's/bg-slate-50//g' "$PRACTICE"
sed -i 's/h-dvh//g' "$PRACTICE"
sed -i 's/overflow-y-auto//g' "$PRACTICE"

echo "🎨 Making AppShell control layout"
sed -i '0,/className="/s/className="/className="ia-bg ia-grid min-h-dvh /' "$APPSHELL"

echo "✅ Done. Restart dev:"
echo "pnpm -C apps/web dev"
