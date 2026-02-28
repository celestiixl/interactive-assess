#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/app/(app)/practice/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Missing: $FILE"
  exit 1
fi

cp "$FILE" "${FILE}.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/practice/page.tsx")
t = p.read_text(encoding="utf-8")

# 1) Remove the stray top-level <AccommodationsButton ... /> that was inserted before <AppShell
t = re.sub(
    r'\n\s*<AccommodationsButton\s+compact=\{true\}\s+label="Accommodations"\s*/>\s*\n\s*<AppShell',
    r'\n    <AppShell',
    t,
    count=1
)

# 2) Ensure import exists (keep if already there)
if 'import AccommodationsButton' not in t:
    t = re.sub(
        r'(^import .*?\n)+',
        lambda m: m.group(0) + 'import AccommodationsButton from "@/components/student/AccommodationsButton";\n',
        t,
        count=1,
        flags=re.M
    )

# 3) Insert accommodations button into the sticky header row (best-effort)
# Look for the first sticky header inner container div and add a right-aligned button row.
if "AccommodationsButton" in t and "compact={true}" not in t:
    # Find the first occurrence of the sticky header container's inner div (your file shows duplicated sticky divs)
    # We'll insert after the FIRST header container open: <div className="sticky ..."> then its first child <div ...>
    t2, n = re.subn(
        r'(<div className="sticky top-0 z-50[^"]*">[\s\S]*?<div className="[^"]*")',
        r'\1 flex items-center justify-between',
        t,
        count=1
    )
    # If we changed layout to justify-between, add a right slot containing the button.
    if n > 0 and "AccommodationsButton compact={true}" not in t2:
        # Insert a right-side container just after the left header title block if present,
        # otherwise right after that first inner div open.
        t3, n2 = re.subn(
            r'(<div className="[^"]*flex items-center justify-between[^"]*">)',
            r'\1\n            <div className="ml-auto flex items-center gap-2">\n              <AccommodationsButton compact={true} label="Accommodations" />\n            </div>',
            t2,
            count=1
        )
        t = t3 if n2 > 0 else t2
    else:
        t = t2

# 4) If return contains a single <AppShell ...> already, we are fine.
# But if the file somehow now has multiple siblings again, enforce a fragment around the return body.
# Convert: return ( <AppShell ...> ... ) to return ( <> <AppShell ...> ... </> )
# Only do this if return starts with <AppShell and does not already start with <>
t = re.sub(
    r'(return\s*\(\s*\n)(\s*<AppShell\b)',
    r'\1    <>\n\2',
    t,
    count=1
)

# Add closing </> before the closing ");" of that return (best-effort)
if "<>\n" in t:
    t = re.sub(r'(\n\s*\)\s*;\s*)$', r'\n    </>\1', t, count=1)

p.write_text(t, encoding="utf-8")
print("✅ Fixed Practice page JSX structure and placed Accommodations button in header.")
PY

echo "✅ Done. Restart dev:"
echo "  pnpm -C apps/web dev"
