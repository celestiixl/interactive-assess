#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

APPSHELL="apps/web/src/components/ia/AppShell.tsx"
PRACTICE="apps/web/src/app/(app)/practice/page.tsx"

[ -f "$APPSHELL" ] || { echo "❌ missing: $APPSHELL"; exit 1; }
[ -f "$PRACTICE" ] || { echo "❌ missing: $PRACTICE"; exit 1; }

ts="$(date +%Y%m%d_%H%M%S)"
cp "$APPSHELL" "$APPSHELL.bak.$ts"
cp "$PRACTICE" "$PRACTICE.bak.$ts"

# 1) Make AppShell a Client Component (must be FIRST statement)
python - <<'PY'
from pathlib import Path

p = Path("apps/web/src/components/ia/AppShell.tsx")
s = p.read_text(encoding="utf-8")

# Strip any BOM/leading whitespace before checking
stripped = s.lstrip()

if not stripped.startswith('"use client";') and not stripped.startswith("'use client';"):
    # Put directive at absolute top (no blank lines before)
    s = '"use client";\n\n' + stripped
    p.write_text(s, encoding="utf-8")
PY

# 2) Fix nested <main> inside AppShell usage: switch inner main -> div
python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/practice/page.tsx")
s = p.read_text(encoding="utf-8")

# Replace the FIRST "<AppShell ...><main" with "<AppShell ...><div"
s2, n1 = re.subn(r'(<AppShell\b[^>]*>\s*)<main\b', r'\1<div', s, count=1)

# Replace the FIRST matching closing </main> after that with </div>
if n1 == 1:
    # only replace one </main> (the one that closes that wrapper)
    s2, n2 = re.subn(r'</main>', r'</div>', s2, count=1)
else:
    n2 = 0

p.write_text(s2, encoding="utf-8")
print(f"patched practice: open={n1}, close={n2}")
PY

echo "✅ AppShell is now a client component + practice wrapper main->div"
echo "👉 Restart dev server + hard refresh"
