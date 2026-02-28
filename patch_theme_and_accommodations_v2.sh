#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

echo "🔎 Locating key files..."

# globals
GLOBALS="apps/web/src/app/globals.css"
[ -f "$GLOBALS" ] || { echo "❌ Missing: $GLOBALS"; exit 1; }

# accommodations button
ACC_BTN="apps/web/src/components/student/AccommodationsButton.tsx"
[ -f "$ACC_BTN" ] || { echo "❌ Missing: $ACC_BTN"; exit 1; }

# AppShell (best-effort locate)
APPSHELL="$(ls -1 \
  apps/web/src/components/AppShell.tsx \
  apps/web/src/components/layout/AppShell.tsx \
  apps/web/src/components/shell/AppShell.tsx \
  2>/dev/null | head -n 1 || true)"

if [ -z "${APPSHELL:-}" ]; then
  # Try find
  APPSHELL="$(find apps/web/src -maxdepth 5 -type f -name 'AppShell.tsx' | head -n 1 || true)"
fi

if [ -z "${APPSHELL:-}" ]; then
  echo "❌ Could not find AppShell.tsx under apps/web/src"
  echo "   Run: rg -n \"function AppShell|export default function AppShell|export function AppShell\" apps/web/src"
  exit 1
fi

echo "✅ GLOBALS=$GLOBALS"
echo "✅ ACC_BTN=$ACC_BTN"
echo "✅ APPSHELL=$APPSHELL"

backup () { [ -f "$1" ] && cp "$1" "${1}.bak.$(date +%Y%m%d_%H%M%S)"; }
backup "$GLOBALS"
backup "$ACC_BTN"
backup "$APPSHELL"

# -----------------------------------------------------------------------------
# 1) Global theme tokens (Notion-ish surfaces + consistent buttons/cards)
# -----------------------------------------------------------------------------
python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/globals.css")
css = p.read_text(encoding="utf-8")

if "/* --- IA THEME TOKENS --- */" not in css:
    css = css.rstrip() + """

/* --- IA THEME TOKENS --- */
/* Neutral, Notion-ish surfaces. Use via classes: ia-page, ia-card, ia-pill, ia-muted */
:root {
  --ia-bg: 248 250 252;           /* slate-50 */
  --ia-surface: 255 255 255;      /* white */
  --ia-ink: 15 23 42;             /* slate-900 */
  --ia-muted: 71 85 105;          /* slate-600 */
  --ia-border: 226 232 240;       /* slate-200 */
  --ia-shadow: 0 1px 0 rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06);
}

.ia-page {
  background: rgb(var(--ia-bg));
  color: rgb(var(--ia-ink));
}

.ia-container {
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  max-width: 1120px;
  padding-left: 16px;
  padding-right: 16px;
}

.ia-card {
  background: rgb(var(--ia-surface));
  border: 1px solid rgb(var(--ia-border));
  border-radius: 24px;
  box-shadow: var(--ia-shadow);
}

.ia-card-soft {
  background: rgb(var(--ia-surface));
  border: 1px solid rgb(var(--ia-border));
  border-radius: 24px;
}

.ia-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgb(var(--ia-border));
  background: rgb(var(--ia-surface));
  border-radius: 9999px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
}

.ia-pill:hover { background: rgb(248 250 252); }

.ia-muted { color: rgb(var(--ia-muted)); }

/* Focus mode: hide marked blocks */
html[data-acc-focus="1"] [data-focus-hide="1"] { display: none !important; }

/* Large text */
html[data-acc-large="1"] { font-size: 18px; }
html[data-acc-large="1"] .text-xs { font-size: 0.85rem; }
html[data-acc-large="1"] .text-sm { font-size: 1.0rem; }
html[data-acc-large="1"] .text-base { font-size: 1.1rem; }

/* High contrast */
html[data-acc-contrast="1"] { filter: contrast(1.05); }
html[data-acc-contrast="1"] .text-slate-600 { color: rgb(15 23 42); }
html[data-acc-contrast="1"] .text-slate-500 { color: rgb(30 41 59); }

"""
p.write_text(css, encoding="utf-8")
print("✅ Added IA theme tokens to globals.css")
PY

# -----------------------------------------------------------------------------
# 2) Redo Accommodations button so it matches the Student Dashboard vibe:
#    - small pill, not loud
#    - optional icon
#    - modal becomes a clean "Notion-ish" card with sections
# -----------------------------------------------------------------------------
python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/AccommodationsButton.tsx")
t = p.read_text(encoding="utf-8")

# Ensure it stays a client component at top
lines = t.splitlines()
# move "use client" to top if needed
use_idx = None
for i, ln in enumerate(lines):
    if ln.strip().strip(";") in ['"use client"', "'use client'"]:
        use_idx = i
        break
if use_idx is None:
    lines.insert(0, '"use client";')
    lines.insert(1, "")
else:
    use_line = lines.pop(use_idx)
    # remove leading blanks
    while lines and lines[0].strip() == "":
        lines.pop(0)
    lines.insert(0, '"use client";')
    lines.insert(1, "")
t = "\n".join(lines) + "\n"

# Add className prop support + new pill styling
t = re.sub(r"type Props = \{\s*label\?: string;.*?compact\?: boolean;.*?\};",
           'type Props = {\n  label?: string;\n  compact?: boolean;\n  className?: string;\n};',
           t, flags=re.S)

# Add a tiny sliders icon (inline svg) and update button className
# Replace the <button ...> for the trigger with ia-pill styling.
t = re.sub(
    r'<button\s+type="button"\s+onClick=\{\(\)\s*=>\s*setOpen\(true\)\}\s+className=\{[\s\S]*?\}\s*>',
    '<button type="button" onClick={() => setOpen(true)} className={["ia-pill", className || ""].join(" ")}>',
    t,
    flags=re.S,
    count=1
)

# Insert icon inside button content if not present
if "aria-hidden" not in t:
    t = t.replace(
        "{buttonText}",
        """<svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-slate-700">
          <path fill="currentColor" d="M7 3h2v18H7V3Zm8 0h2v18h-2V3ZM3 7h4v2H3V7Zm14 0h4v2h-4V7ZM3 15h4v2H3v-2Zm14 0h4v2h-4v-2ZM9 11h6v2H9v-2Z"/>
        </svg>
        <span>{buttonText}</span>"""
    )

# Update modal outer to use ia-card look
t = re.sub(
    r'<div className="fixed inset-0[^"]*">',
    '<div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/30 p-4 sm:items-center">',
    t,
    count=1
)

t = re.sub(
    r'<div className="w-full max-w-xl[^"]*">',
    '<div className="w-full max-w-xl ia-card p-5">',
    t,
    count=1
)

# Make inner rows use ia-card-soft instead of heavy shadows
t = t.replace('className="flex w-full items-start justify-between gap-4 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm"',
              'className="flex w-full items-start justify-between gap-4 ia-card-soft px-4 py-3 text-left"')
t = t.replace('className="rounded-2xl border bg-slate-50 p-4"', 'className="ia-card-soft bg-slate-50 p-4"')
t = t.replace('className="rounded-2xl border bg-white p-4 shadow-sm"', 'className="ia-card-soft bg-white p-4"')
t = t.replace('className="rounded-2xl border bg-white px-4 py-3 text-sm font-semibold shadow-sm"',
              'className="ia-card-soft bg-white px-4 py-3 text-sm font-semibold"')

# Ensure props destructuring includes className
t = re.sub(r'export default function AccommodationsButton\(\{ label = "Accommodations", compact = false \}: Props\)',
           'export default function AccommodationsButton({ label = "Accommodations", compact = false, className }: Props)',
           t)

p.write_text(t, encoding="utf-8")
print("✅ Updated AccommodationsButton UI (pill + Notion-ish modal)")
PY

# -----------------------------------------------------------------------------
# 3) Apply the same dashboard-style shell sitewide by patching AppShell:
#    - page background uses ia-page
#    - main content uses ia-container
#    - optional card wrapper around content
# -----------------------------------------------------------------------------
python3 - <<'PY'
from pathlib import Path
import re

p = Path("${APPSHELL}")
t = p.read_text(encoding="utf-8")

# Best-effort: ensure the root wrapper includes ia-page
# Try to find a top-level <div className="..."> that wraps children.
# We'll patch the first return wrapper className.
def patch_root_class(s: str) -> str:
    # common: return (<div className="..."> ... )
    m = re.search(r'return\s*\(\s*<div\s+className="([^"]*)"', s)
    if m:
        cls = m.group(1)
        if "ia-page" not in cls:
            cls2 = ("ia-page " + cls).strip()
            s = s[:m.start(1)] + cls2 + s[m.end(1):]
        return s
    # sometimes: <main className="...">
    m = re.search(r'return\s*\(\s*<main\s+className="([^"]*)"', s)
    if m:
        cls = m.group(1)
        if "ia-page" not in cls:
            cls2 = ("ia-page " + cls).strip()
            s = s[:m.start(1)] + cls2 + s[m.end(1):]
    return s

t2 = patch_root_class(t)
t = t2

# Ensure there is a container around children: wrap children slot with ia-container
# We look for {children} and wrap it if not already in ia-container.
if "ia-container" not in t:
    # If AppShell renders children directly inside a main/section, wrap them.
    t = re.sub(r'(\{children\})', r'<div className="ia-container">\1</div>', t, count=1)

p.write_text(t, encoding="utf-8")
print("✅ Patched AppShell to apply ia-page + ia-container (sitewide theme baseline)")
PY

echo "✅ Done."
echo "Restart dev:"
echo "  pnpm -C apps/web dev"
