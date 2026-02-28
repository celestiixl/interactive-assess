#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Missing: $FILE"
  exit 1
fi

cp "$FILE" "${FILE}.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path
import re

path = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
src = path.read_text(encoding="utf-8")

TAB_KEY = "studentDashboard.activeTab"

# Ensure "use client" is at the very top if file uses hooks/state
if "useState" in src:
    lines = src.splitlines()
    # find existing use client
    use_idx = None
    for i, ln in enumerate(lines):
        if ln.strip().strip(";") in ['"use client"', "'use client'"]:
            use_idx = i
            break
    if use_idx is None:
        # insert at top (before imports)
        lines.insert(0, '"use client";')
        lines.insert(1, "")
    elif use_idx != 0:
        use_line = lines.pop(use_idx)
        # remove leading blanks
        while lines and lines[0].strip() == "":
            lines.pop(0)
        lines.insert(0, '"use client";')
        lines.insert(1, "")
    src = "\n".join(lines) + "\n"

# 1) Find the tab state that defaults to "overview"
# We look for: const [something, setSomething] = useState("overview")
m = re.search(
    r'const\s*\[\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\]\s*=\s*useState(?:<[^>]+>)?\(\s*["\']overview["\']\s*\)',
    src
)

if not m:
    raise SystemExit(
        "❌ Could not find a tab state like: const [x, setX] = useState('overview')\n"
        "   Paste the top ~120 lines of this file and I’ll patch it exactly."
    )

tab_var, set_tab = m.group(1), m.group(2)

# Replace useState("overview") with initializer that reads localStorage safely
replacement = (
    f'const [{tab_var}, {set_tab}] = useState(() => {{\n'
    f'    if (typeof window === "undefined") return "overview";\n'
    f'    const v = window.localStorage.getItem("{TAB_KEY}");\n'
    f'    return v === "specimens" ? "specimens" : "overview";\n'
    f'  }})'
)

src = re.sub(
    r'const\s*\[\s*' + re.escape(tab_var) + r'\s*,\s*' + re.escape(set_tab) +
    r'\s*\]\s*=\s*useState(?:<[^>]+>)?\(\s*["\']overview["\']\s*\)',
    replacement,
    src,
    count=1
)

# 2) Patch tab button handlers to ALSO write localStorage.
# Patterns:
#   onClick={() => setTab("specimens")}
#   onClick={() => { setTab("specimens"); ... }}
def patch_onclick(value: str):
    # simple arrow form
    nonlocal_src = None
    return

# Replace the simple form first
src = re.sub(
    rf'onClick=\{{\(\)\s*=>\s*{re.escape(set_tab)}\(\s*["\']overview["\']\s*\)\s*\}}',
    f'onClick={{() => {{ {set_tab}("overview"); if (typeof window !== "undefined") window.localStorage.setItem("{TAB_KEY}", "overview"); }} }}',
    src
)
src = re.sub(
    rf'onClick=\{{\(\)\s*=>\s*{re.escape(set_tab)}\(\s*["\']specimens["\']\s*\)\s*\}}',
    f'onClick={{() => {{ {set_tab}("specimens"); if (typeof window !== "undefined") window.localStorage.setItem("{TAB_KEY}", "specimens"); }} }}',
    src
)

# Replace common block form that only sets tab (best-effort)
src = re.sub(
    rf'{re.escape(set_tab)}\(\s*["\']overview["\']\s*\)\s*;',
    f'{set_tab}("overview"); if (typeof window !== "undefined") window.localStorage.setItem("{TAB_KEY}", "overview");',
    src
)
src = re.sub(
    rf'{re.escape(set_tab)}\(\s*["\']specimens["\']\s*\)\s*;',
    f'{set_tab}("specimens"); if (typeof window !== "undefined") window.localStorage.setItem("{TAB_KEY}", "specimens");',
    src
)

# 3) On mount, ensure localStorage is set at least once (optional, but helps)
# Insert a small effect after the tab state declaration IF useEffect exists/imported.
if "useEffect" in src:
    # Insert after the state line we replaced (by searching for the new initializer block)
    insert_after = re.search(rf'{re.escape(replacement)}\s*;', src)
    if insert_after and "studentDashboard.activeTab" not in src[insert_after.end():insert_after.end()+400]:
        effect = (
            f'\n\n  useEffect(() => {{\n'
            f'    if (typeof window === "undefined") return;\n'
            f'    window.localStorage.setItem("{TAB_KEY}", {tab_var} === "specimens" ? "specimens" : "overview");\n'
            f'  }}, [{tab_var}]);\n'
        )
        src = src[:insert_after.end()] + effect + src[insert_after.end():]

path.write_text(src, encoding="utf-8")
print(f"✅ Persisted dashboard tab using localStorage key: {TAB_KEY}")
print(f"   Tab state: {tab_var}, setter: {set_tab}")
PY

echo "✅ Done. Restart dev server:"
echo "  pnpm -C apps/web dev"
