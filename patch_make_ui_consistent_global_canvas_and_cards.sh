#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

APPSHELL="apps/web/src/components/ia/AppShell.tsx"
[ -f "$APPSHELL" ] || { echo "❌ Missing: $APPSHELL"; exit 1; }

# find globals.css
GLOBALS_CSS=""
for p in \
  "apps/web/src/app/globals.css" \
  "apps/web/app/globals.css" \
  "apps/web/src/styles/globals.css" \
  "apps/web/styles/globals.css"
do
  if [ -f "$p" ]; then GLOBALS_CSS="$p"; break; fi
done
[ -n "$GLOBALS_CSS" ] || { echo "❌ Could not find globals.css"; exit 1; }

echo "🧷 Backing up AppShell + globals.css"
cp "$APPSHELL" "${APPSHELL}.bak.$(date +%Y%m%d_%H%M%S)"
cp "$GLOBALS_CSS" "${GLOBALS_CSS}.bak.$(date +%Y%m%d_%H%M%S)"

echo "🎨 1) Ensure shared IA theme utilities exist in globals.css"
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

/* dashboard-ish paper background */
.ia-bg{
  background:
    radial-gradient(1200px 800px at 50% 0%, rgba(59,130,246,0.10), transparent 60%),
    radial-gradient(900px 700px at 0% 20%, rgba(16,185,129,0.08), transparent 55%),
    radial-gradient(900px 700px at 100% 30%, rgba(168,85,247,0.08), transparent 55%),
    linear-gradient(180deg, rgb(var(--ia-bg)) 0%, #ffffff 55%, rgb(var(--ia-bg)) 100%);
}

/* subtle grid overlay */
.ia-grid::before{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  opacity:0.22;
  background-image:
    linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px);
  background-size:44px 44px;
  mask-image: radial-gradient(60% 55% at 50% 0%, #000 0%, transparent 70%);
}

/* shared soft surface */
.ia-card-soft{
  background: rgba(255,255,255,0.78);
  border: 1px solid rgba(226,232,240,0.92);
  border-radius: 24px;
  box-shadow: 0 18px 50px rgba(15,23,42,.08);
  backdrop-filter: blur(10px);
}
"""
    p.write_text(t, encoding="utf-8")
    print("✅ Injected IA theme utilities into globals.css")
else:
    print("ℹ️ IA theme utilities already present; skipped")
PY

echo "🎨 2) Make AppShell enforce the global canvas wrapper around {children}"
python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/ia/AppShell.tsx")
t = p.read_text(encoding="utf-8")

# If already wrapped, do nothing
if "ia-bg" in t and "ia-grid" in t and "max-w-[1400px]" in t:
    print("ℹ️ AppShell already appears wrapped; skipping")
    raise SystemExit(0)

# Wrap the first occurrence of {children} in a consistent canvas.
# This is the least risky edit because it doesn't rewrite the component structure.
wrapper = (
  '<div className="min-h-dvh ia-bg relative ia-grid">'
  '<div className="relative z-10 px-6 pt-8 pb-16">'
  '<div className="mx-auto max-w-[1400px]">{children}</div>'
  '</div>'
  '</div>'
)

# Replace exactly "{children}" (with optional whitespace) inside JSX
t2, n = re.subn(r'\{\s*children\s*\}', wrapper, t, count=1)
if n == 0:
    print("❌ Could not find {children} in AppShell.tsx to wrap. No changes applied.")
    raise SystemExit(1)

p.write_text(t2, encoding="utf-8")
print("✅ Wrapped AppShell children with global canvas")
PY

echo "🎨 3) Normalize common page backgrounds + card surfaces across app pages"
# We’ll patch page files (and common components) mechanically but conservatively.

python3 - <<'PY'
from pathlib import Path
import re
from datetime import datetime

root = Path("apps/web/src")
targets = []

# Pages + key UI components are where the inconsistent look comes from
for pat in [
    "app/**/page.tsx",
    "components/**/*.tsx",
]:
    targets += list(root.glob(pat))

def backup(path: Path):
    b = path.with_suffix(path.suffix + f".bak.{datetime.now().strftime('%Y%m%d_%H%M%S')}")
    b.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")

changed = 0

for f in targets:
    if not f.is_file():
        continue
    txt = f.read_text(encoding="utf-8")

    orig = txt

    # Remove common competing backgrounds (don’t touch strings in data files)
    txt = txt.replace(" bg-slate-50/90", " ")
    txt = txt.replace(" bg-slate-50", " ")
    txt = txt.replace(" bg-white", " bg-white/0")  # only affects obvious wrappers; safe-ish
    txt = txt.replace(" h-dvh", " ")
    txt = txt.replace(" overflow-y-auto", " ")

    # Normalize the most common “default card” pattern to ia-card-soft
    # Patterns we saw repeatedly: rounded-3xl border bg-white p-5 shadow-sm
    txt = re.sub(
        r'className="([^"]*)\brounded-3xl\b([^"]*)\bborder\b([^"]*)\bbg-white\b([^"]*)\bshadow-sm\b([^"]*)"',
        lambda m: 'className="{} ia-card-soft {}"'.format(
            " ".join([m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)]).replace("  ", " ").strip(),
            ""
        ).replace(" ia-card-soft  ", " ia-card-soft ").replace("  ", " "),
        txt
    )

    # Also catch rounded-2xl border bg-white shadow-sm
    txt = re.sub(
        r'className="([^"]*)\brounded-2xl\b([^"]*)\bborder\b([^"]*)\bbg-white\b([^"]*)\bshadow-sm\b([^"]*)"',
        lambda m: 'className="{} ia-card-soft {}"'.format(
            " ".join([m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)]).replace("  ", " ").strip(),
            ""
        ).replace(" ia-card-soft  ", " ia-card-soft ").replace("  ", " "),
        txt
    )

    # Clean up accidental "bg-white/0" inside real cards (keep in wrappers only)
    # If ia-card-soft exists in the same className, ensure bg isn't forced to 0.
    txt = txt.replace("ia-card-soft bg-white/0", "ia-card-soft")

    if txt != orig:
        backup(f)
        f.write_text(txt, encoding="utf-8")
        changed += 1

print(f"✅ Patched {changed} files for theme consistency (backups created).")
PY

echo "✅ Done."
echo "Next steps:"
echo "1) Stop dev server completely"
echo "2) Restart: pnpm -C apps/web dev"
echo "3) Hard refresh in browser"
