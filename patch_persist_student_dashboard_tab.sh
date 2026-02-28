#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" 2>/dev/null || cd "$(pwd)"

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Missing: $FILE"
  exit 1
fi

cp "$FILE" "${FILE}.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
t = p.read_text(encoding="utf-8")

# 1) Ensure next/navigation hooks are imported
# Add usePathname/useRouter/useSearchParams if not present
if "from \"next/navigation\"" in t or "from 'next/navigation'" in t:
    def add_to_nav_import(match):
        inside = match.group(1)
        want = ["useRouter", "usePathname", "useSearchParams"]
        existing = [x.strip() for x in inside.split(",") if x.strip()]
        for w in want:
            if w not in existing:
                existing.append(w)
        return f'from "next/navigation";\n' if match.group(0).strip().startswith('from "next/navigation"') else match.group(0)

    # Replace import line like: import { a, b } from "next/navigation";
    t = re.sub(
        r'import\s*\{\s*([^}]+)\s*\}\s*from\s*[\'"]next/navigation[\'"]\s*;',
        lambda m: 'import { ' + ", ".join(dict.fromkeys([x.strip() for x in m.group(1).split(",") if x.strip()] + ["useRouter","usePathname","useSearchParams"])) + ' } from "next/navigation";',
        t,
        count=1
    )
else:
    # Insert a new import near the top (after "use client" if present, else at top)
    ins = 'import { useRouter, usePathname, useSearchParams } from "next/navigation";\n'
    if '"use client"' in t or "'use client'" in t:
        # after the directive line
        t = re.sub(r'^(["\']use client["\'];\s*\n)', r'\1' + ins, t, count=1, flags=re.M)
    else:
        t = ins + t

# 2) Ensure React hooks include useEffect (needed for syncing tab to URL)
# This tries to patch either: import React, { ... } from "react"; OR import { ... } from "react";
def ensure_hook_in_import(src, hook):
    # src includes whole file text
    m = re.search(r'import\s+React\s*,\s*\{([^}]+)\}\s+from\s+"react";', src)
    if m:
        hooks = [x.strip() for x in m.group(1).split(",") if x.strip()]
        if hook not in hooks:
            hooks.append(hook)
            src = src[:m.start()] + f'import React, {{ {", ".join(hooks)} }} from "react";' + src[m.end():]
        return src

    m = re.search(r'import\s*\{([^}]+)\}\s+from\s+"react";', src)
    if m:
        hooks = [x.strip() for x in m.group(1).split(",") if x.strip()]
        if hook not in hooks:
            hooks.append(hook)
            src = src[:m.start()] + f'import {{ {", ".join(hooks)} }} from "react";' + src[m.end():]
        return src

    # If no react import found, do nothing.
    return src

t = ensure_hook_in_import(t, "useEffect")

# 3) Add router + tab query param logic inside component
# We’ll:
# - add:
#     const router = useRouter();
#     const pathname = usePathname();
#     const sp = useSearchParams();
#     const tabParam = (sp.get("tab") || "").toLowerCase();
#     const initialTab = tabParam === "specimens" ? "specimens" : "overview";
# - and ensure tab state is initialized from initialTab
# - and add an effect to keep state in sync if URL changes
#
# Locate component start: export default function StudentDashboard() {
m = re.search(r'export\s+default\s+function\s+StudentDashboard\s*\(\)\s*\{', t)
if not m:
    raise SystemExit("❌ Couldn't find `export default function StudentDashboard()` in page.tsx")

insert_point = m.end()

inject = """
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const tabParam = (sp.get("tab") || "").toLowerCase();
  const initialTab = tabParam === "specimens" ? "specimens" : "overview";
"""

# Only insert if router isn't already declared
if "const router = useRouter()" not in t:
    t = t[:insert_point] + inject + t[insert_point:]

# 4) Ensure there is a tab state we can drive
# Replace: useState("overview") or useState('overview') with useState(initialTab)
# Or if tab state exists but default is overview, patch it.
t, n1 = re.subn(r'useState\(\s*["\']overview["\']\s*\)', 'useState(initialTab)', t, count=1)
# Also handle: const [activeTab, setActiveTab] = useState("overview")
# If they used different var names, we still want initialTab. Best effort only.

# If no replacement happened, do nothing (they might already compute a default)

# 5) Add effect to sync state when tabParam changes
# Only add if useEffect sync block not already present.
if "initialTab" in t and "tabParam" in t and "setActiveTab" in t and "if (tabParam" not in t:
    # Determine state setter name (best-effort)
    setter = None
    mm = re.search(r'const\s*\[\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\]\s*=\s*useState\(\s*initialTab\s*\)', t)
    if mm:
        tabVar, setter = mm.group(1), mm.group(2)
        sync = f"""
  useEffect(() => {{
    // keep UI tab in sync with URL (?tab=overview|specimens)
    {setter}(initialTab);
  }}, [initialTab]);
"""
        # Insert after initialTab block
        t = t.replace(inject, inject + sync, 1)

# 6) Patch the tab button handlers so they update the URL (persist on refresh)
# We’ll look for onClick={() => setX("specimens")} and expand to also router.replace(...)
def patch_tab_clicks(src):
    # Find the tab setter name if possible
    mm = re.search(r'const\s*\[\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\]\s*=\s*useState\(\s*initialTab\s*\)', src)
    if not mm:
        return src
    setter = mm.group(2)

    # overview click
    src = re.sub(
        rf'onClick=\{{\(\)\s*=>\s*{setter}\(\s*["\']overview["\']\s*\)\s*\}}',
        f'onClick={{() => {{ {setter}("overview"); router.replace(`${{pathname}}?tab=overview`, {{ scroll: false }}); }} }}',
        src
    )
    # specimens click
    src = re.sub(
        rf'onClick=\{{\(\)\s*=>\s*{setter}\(\s*["\']specimens["\']\s*\)\s*\}}',
        f'onClick={{() => {{ {setter}("specimens"); router.replace(`${{pathname}}?tab=specimens`, {{ scroll: false }}); }} }}',
        src
    )
    return src

t2 = patch_tab_clicks(t)
t = t2

# 7) Patch "Reset Specimen Unlocks" so it does NOT drop the tab param
# If it uses router.push(pathname) or window.location, replace with router.replace(current URL)
# We add a helper `const currentTab = initialTab;`? Actually we can re-read from sp.
# We'll patch common patterns:
#   router.push("/student/dashboard") -> router.replace(`${pathname}?tab=${initialTab}`, { scroll:false })
t = re.sub(
    r'router\.(push|replace)\(\s*["\'][^"\']*student/dashboard[^"\']*["\']\s*\)',
    'router.replace(`${pathname}?tab=${initialTab}`, { scroll: false })',
    t
)

p.write_text(t, encoding="utf-8")
print("✅ Patched dashboard to persist tab via ?tab=...")
PY

echo "✅ Done."
echo "Restart dev:"
echo "  pnpm -C apps/web dev"
