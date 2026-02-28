#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

FILE="apps/web/src/components/hotq/HotQuestionTeacherInsights.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Missing: $FILE"
  exit 1
fi

cp "$FILE" "${FILE}.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/hotq/HotQuestionTeacherInsights.tsx")
t = p.read_text(encoding="utf-8")

# 1) Ensure "use client" is at the very top
lines = t.splitlines()
# remove any leading blanks
while lines and lines[0].strip() == "":
    lines.pop(0)

# find existing directive
dir_idx = None
for i, ln in enumerate(lines[:10]):
    if ln.strip().strip(";") in ['"use client"', "'use client'"]:
        dir_idx = i
        break

if dir_idx is None:
    lines.insert(0, '"use client";')
    lines.insert(1, "")
else:
    # move it to top
    d = lines.pop(dir_idx)
    lines.insert(0, '"use client";')
    lines.insert(1, "")

t = "\n".join(lines) + "\n"

# 2) Make sure React hooks are imported
# If file imports React hooks from "react", add useEffect/useState if missing
m = re.search(r'import\s*\{\s*([^}]*)\s*\}\s*from\s*"react";', t)
if m:
    items = [x.strip() for x in m.group(1).split(",") if x.strip()]
    need = []
    if "useEffect" not in items: need.append("useEffect")
    if "useState" not in items: need.append("useState")
    if need:
        items += need
        new = "import { " + ", ".join(sorted(dict.fromkeys(items))) + ' } from "react";'
        t = t[:m.start()] + new + t[m.end():]
else:
    # If no named import, add one
    if 'from "react"' in t and "useEffect" not in t and "useState" not in t:
        t = t.replace('from "react";', 'from "react";\nimport { useEffect, useState } from "react";', 1)

# 3) Add mounted guard inside the component function (first function component)
# We look for: export default function ... ( or function ...(
fn = re.search(r'(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{\s*)', t)
if not fn:
    fn = re.search(r'(function\s+\w+\s*\([^)]*\)\s*\{\s*)', t)

if fn and "const [mounted" not in t:
    inject = (
        fn.group(1)
        + "\n  const [mounted, setMounted] = useState(false);\n"
          "  useEffect(() => { setMounted(true); }, []);\n"
    )
    t = t[:fn.start(1)] + inject + t[fn.end(1):]

# 4) Fix the date span so SSR doesn't mismatch:
# Replace ({formatUSDate(dateLabel)}) with a client-only render and suppressHydrationWarning.
t = re.sub(
    r'\(\{formatUSDate\(([^)]+)\)\}\)',
    r'(<span suppressHydrationWarning>{mounted ? formatUSDate(\1) : ""}</span>)',
    t,
    count=1
)

# If the code is exactly: ({formatUSDate(dateLabel)}) inside a span, we now have nested spans.
# Clean up: convert outer span to a fragment-like plain text by removing nested span if double.
t = re.sub(
    r'<span([^>]*)>\s*\(\s*(<span suppressHydrationWarning>[\s\S]*?</span>)\s*\)\s*</span>',
    r'<span\1>(\2)</span>',
    t,
    count=1
)

p.write_text(t, encoding="utf-8")
print("✅ Patched HotQuestionTeacherInsights to avoid hydration mismatch on date display.")
PY

echo "✅ Done. Restart dev:"
echo "  pnpm -C apps/web dev"
