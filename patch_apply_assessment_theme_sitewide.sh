#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Detect Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router root"
  exit 1
fi

LAYOUT="$APP_ROOT/layout.tsx"
GLOBALS="$APP_ROOT/globals.css"

[ -f "$LAYOUT" ] || { echo "❌ missing: $LAYOUT"; exit 1; }
[ -f "$GLOBALS" ] || { echo "❌ missing: $GLOBALS"; exit 1; }

ts(){ date +%Y%m%d_%H%M%S; }
cp -v "$LAYOUT" "$LAYOUT.bak.$(ts)" >/dev/null
cp -v "$GLOBALS" "$GLOBALS.bak.$(ts)" >/dev/null

python - <<'PY'
from pathlib import Path
import re

app_root = None
if Path("apps/web/src/app").exists():
  app_root = Path("apps/web/src/app")
else:
  app_root = Path("apps/web/app")

layout = app_root/"layout.tsx"
globals_css = app_root/"globals.css"

# ---------------------------
# 1) Global theme primitives
# ---------------------------
g = globals_css.read_text(encoding="utf-8")

theme_block = r"""
/* ===========================
   Interactive-Assess Theme
   (light, airy, soft gradients)
   =========================== */

:root{
  --ia-bg0: 248 250 252;     /* slate-50 */
  --ia-bg1: 255 255 255;     /* white */
  --ia-ink: 15 23 42;        /* slate-900 */
  --ia-muted: 71 85 105;     /* slate-600 */

  --ia-card: 255 255 255;
  --ia-border: 226 232 240;  /* slate-200 */
  --ia-shadow: 2 6 23;

  /* accents */
  --ia-teal: 20 184 166;
  --ia-emerald: 16 185 129;
  --ia-amber: 245 158 11;
  --ia-violet: 139 92 246;
  --ia-slate: 100 116 139;
}

html, body { height: 100%; }

body{
  background:
    radial-gradient(700px 340px at 12% 18%, rgba(var(--ia-teal), .08), transparent 60%),
    radial-gradient(760px 360px at 82% 20%, rgba(var(--ia-amber), .08), transparent 60%),
    radial-gradient(900px 420px at 55% 80%, rgba(var(--ia-violet), .06), transparent 65%),
    linear-gradient(to bottom, rgb(var(--ia-bg1)), rgb(var(--ia-bg0)));
  color: rgb(var(--ia-ink));
}

/* Full-bleed app shell */
.ia-app{
  min-height: 100dvh;
  width: 100%;
}

/* Default page container */
.ia-container{
  width: 100%;
  max-width: 1100px; /* calm dashboard width */
  margin: 0 auto;
  padding: 24px;
}

/* Card / surface */
.ia-card{
  background: rgb(var(--ia-card));
  border: 1px solid rgb(var(--ia-border));
  border-radius: 18px;
  box-shadow:
    0 1px 0 rgba(var(--ia-shadow), .04),
    0 18px 50px rgba(var(--ia-shadow), .08);
}

/* Subtle inset surface */
.ia-surface{
  background: rgba(255,255,255,.76);
  border: 1px solid rgb(var(--ia-border));
  border-radius: 18px;
  box-shadow:
    0 1px 0 rgba(var(--ia-shadow), .04),
    0 14px 42px rgba(var(--ia-shadow), .07);
  backdrop-filter: blur(10px);
}

/* Buttons */
.ia-btn{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 14px;
  border: 1px solid rgb(var(--ia-border));
  background: rgba(255,255,255,.7);
  padding: 10px 14px;
  font-weight: 600;
  box-shadow: 0 1px 0 rgba(var(--ia-shadow), .04);
}
.ia-btn:hover{ background: rgba(255,255,255,.9); }

/* Pills */
.ia-pill{
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,184,.45);
  background: rgba(255,255,255,.7);
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(15,23,42,.9);
  box-shadow: 0 1px 0 rgba(var(--ia-shadow), .04);
}
.ia-pill[data-tone="teal"]{ border-color: rgba(var(--ia-teal), .25); background: rgba(var(--ia-teal), .10); color: rgb(9, 78, 70); }
.ia-pill[data-tone="emerald"]{ border-color: rgba(var(--ia-emerald), .25); background: rgba(var(--ia-emerald), .10); color: rgb(6, 95, 70); }
.ia-pill[data-tone="amber"]{ border-color: rgba(var(--ia-amber), .28); background: rgba(var(--ia-amber), .12); color: rgb(120, 53, 15); }
.ia-pill[data-tone="violet"]{ border-color: rgba(var(--ia-violet), .25); background: rgba(var(--ia-violet), .10); color: rgb(76, 29, 149); }
.ia-pill[data-tone="slate"]{ border-color: rgba(var(--ia-slate), .25); background: rgba(var(--ia-slate), .10); color: rgb(30, 41, 59); }

.ia-dot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
  box-shadow: 0 2px 10px rgba(2,6,23,.12);
}
.ia-dot[data-tone="teal"]{ background: rgb(var(--ia-teal)); }
.ia-dot[data-tone="emerald"]{ background: rgb(var(--ia-emerald)); }
.ia-dot[data-tone="amber"]{ background: rgb(var(--ia-amber)); }
.ia-dot[data-tone="violet"]{ background: rgb(var(--ia-violet)); }
.ia-dot[data-tone="slate"]{ background: rgb(var(--ia-slate)); }

/* Kill accidental outer whitespace from default browser styles */
*{ box-sizing: border-box; }
body{ margin: 0; }
"""

if "Interactive-Assess Theme" not in g:
  g = g.rstrip() + "\n\n" + theme_block + "\n"
else:
  # If already present, keep as-is.
  pass

globals_css.write_text(g, encoding="utf-8")

# ---------------------------
# 2) RootLayout uses full-bleed shell (no forced padding / no bg override)
# ---------------------------
t = layout.read_text(encoding="utf-8")

# Replace body className if present to not fight page-level styling
t = re.sub(
  r'<body className="[^"]*">',
  '<body className="min-h-dvh text-slate-900 antialiased">',
  t,
  count=1
)

# Replace wrapper div with ia-app (no max-width/padding)
t = re.sub(
  r'<div className="[^"]*">\s*\{children\}\s*</div>',
  '<div className="ia-app">{children}</div>',
  t,
  count=1
)

layout.write_text(t, encoding="utf-8")

# ---------------------------
# 3) Light-touch sweeping: remove hard bg-white + add softer surfaces where obvious
#    (safe-ish heuristic, avoids breaking complex layouts)
# ---------------------------
app_pages = Path("apps/web/src/app") if Path("apps/web/src/app").exists() else Path("apps/web/app")

tsx_files = list(app_pages.rglob("*.tsx"))

for fp in tsx_files:
  s = fp.read_text(encoding="utf-8")

  orig = s

  # Soften pages that force white backgrounds
  s = s.replace('className="min-h-dvh bg-white"', 'className="min-h-dvh"')
  s = s.replace('className="min-h-screen bg-white"', 'className="min-h-screen"')

  # Common card pattern -> slightly more consistent (only when already using rounded+border)
  s = s.replace("rounded-2xl border border-slate-200 p-5 shadow-sm", "ia-card p-5")
  s = s.replace("rounded-2xl border border-slate-200 p-5 shadow-sm", "ia-card p-5")

  # Buttons that look like old style (very mild)
  s = s.replace('className="rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition hover:bg-muted"',
                'className="ia-btn text-sm"')

  if s != orig:
    fp.write_text(s, encoding="utf-8")

print("✅ globals.css: theme primitives injected")
print("✅ layout.tsx: full-bleed shell applied (ia-app, no forced padding/bg)")
print("✅ pages: light sweep applied (removed bg-white and normalized common cards/buttons where detected)")
PY

echo "✅ Done."
echo "Next:"
echo "  1) Restart dev server (kill the old one if port is busy)"
echo "  2) Hard refresh (Ctrl+Shift+R) AND refresh the Codespaces preview frame if using it"
