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

TAB_KEY = "studentDashboard.activeTab"
p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
src = p.read_text(encoding="utf-8")

# Ensure useEffect is imported from react
def ensure_useeffect_import(s: str) -> str:
    # import React, { ... } from "react";
    m = re.search(r'import\s+React\s*,\s*\{([^}]+)\}\s+from\s+"react";', s)
    if m:
        hooks = [x.strip() for x in m.group(1).split(",") if x.strip()]
        if "useEffect" not in hooks:
            hooks.append("useEffect")
            s = s[:m.start()] + f'import React, {{ {", ".join(hooks)} }} from "react";' + s[m.end():]
        return s
    # import { ... } from "react";
    m = re.search(r'import\s*\{([^}]+)\}\s+from\s+"react";', s)
    if m:
        hooks = [x.strip() for x in m.group(1).split(",") if x.strip()]
        if "useEffect" not in hooks:
            hooks.append("useEffect")
            s = s[:m.start()] + f'import {{ {", ".join(hooks)} }} from "react";' + s[m.end():]
    return s

src = ensure_useeffect_import(src)

# Find the tab state declaration
m = re.search(r'const\s*\[\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\]\s*=\s*useState', src)
if not m:
    raise SystemExit("❌ Could not find a useState tab state. Paste the tab state line.")

tab_var, set_tab = m.group(1), m.group(2)

# Replace any initializer that reads localStorage with a plain default "overview"
# Handles:
#   useState(() => { ...localStorage... })
#   useState(initialTab)
#   useState("overview") already fine
src = re.sub(
    r'const\s*\[\s*' + re.escape(tab_var) + r'\s*,\s*' + re.escape(set_tab) +
    r'\s*\]\s*=\s*useState\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?localStorage[\s\S]*?\}\s*\)\s*',
    f'const [{tab_var}, {set_tab}] = useState<"overview" | "specimens">("overview")',
    src,
    count=1
)
src = re.sub(
    r'const\s*\[\s*' + re.escape(tab_var) + r'\s*,\s*' + re.escape(set_tab) +
    r'\s*\]\s*=\s*useState(?:<[^>]+>)?\(\s*initialTab\s*\)',
    f'const [{tab_var}, {set_tab}] = useState<"overview" | "specimens">("overview")',
    src,
    count=1
)

# If it was already useState("overview") without explicit union, add union to keep TS happy (best-effort)
src = re.sub(
    r'const\s*\[\s*' + re.escape(tab_var) + r'\s*,\s*' + re.escape(set_tab) +
    r'\s*\]\s*=\s*useState(?:<[^>]+>)?\(\s*["\']overview["\']\s*\)',
    f'const [{tab_var}, {set_tab}] = useState<"overview" | "specimens">("overview")',
    src,
    count=1
)

# Add mount effect to read localStorage AFTER hydration
# Insert right after the tab state line.
state_line_re = re.compile(
    r'(const\s*\[\s*' + re.escape(tab_var) + r'\s*,\s*' + re.escape(set_tab) +
    r'\s*\]\s*=\s*useState<"overview"\s*\|\s*"specimens">\("overview"\)\s*;?)'
)

mm = state_line_re.search(src)
if not mm:
    raise SystemExit("❌ Could not locate the patched tab state line to insert effect.")

effect = f"""{mm.group(1)}

  // After hydration, restore last selected tab (prevents SSR/client mismatch)
  useEffect(() => {{
    try {{
      const v = window.localStorage.getItem("{TAB_KEY}");
      if (v === "specimens" || v === "overview") {set_tab}(v);
    }} catch {{}}
  }}, []);
"""

src = src[:mm.start()] + effect + src[mm.end():]

# Keep your existing onClick localStorage writes (no change needed)

p.write_text(src, encoding="utf-8")
print("✅ Fixed hydration by restoring tab AFTER mount (not during initial render).")
PY

echo "✅ Done. Restart dev:"
echo "  pnpm -C apps/web dev"
