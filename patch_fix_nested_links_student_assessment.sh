#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/student/assessment/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Can't find $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/student/assessment/page.tsx")
s = p.read_text(encoding="utf-8")

# Ensure "use client" (router push needs client component)
if not s.lstrip().startswith('"use client"') and not s.lstrip().startswith("'use client'"):
    s = '"use client";\n\n' + s

# Ensure useRouter import
if "useRouter" not in s:
    # Add to existing next/navigation import if present
    if re.search(r'import\s+\{\s*[^}]*\}\s+from\s+["\']next/navigation["\']', s):
        s = re.sub(
            r'import\s+\{\s*([^}]*)\}\s+from\s+["\']next/navigation["\']',
            lambda m: f'import {{ {m.group(1).strip()}, useRouter }} from "next/navigation"',
            s,
            count=1
        )
    else:
        # Insert a new import near the top (after first import line)
        s = re.sub(r'(^import .*?\n)', r'\1import { useRouter } from "next/navigation";\n', s, count=1, flags=re.M)

# Ensure router is defined inside component
if "const router = useRouter()" not in s:
    s = re.sub(
        r'(export default function\s+\w+\([^)]*\)\s*\{\s*)',
        r'\1\n  const router = useRouter();\n',
        s,
        count=1,
        flags=re.S
    )

# Replace the inner Link to dashboard with a button that stops propagation
# This targets the exact Link from your stack trace.
s, n = re.subn(
    r'<Link\s+href="/student/dashboard"\s+className="block rounded-2xl border bg-white p-6 shadow-sm hover:bg-slate-50"\s*>',
    '<button type="button"\n'
    '    onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); router.push("/student/dashboard"); }}\n'
    '    className="block w-full text-left rounded-2xl border bg-white p-6 shadow-sm hover:bg-slate-50">\n',
    s,
    count=1
)

# Replace the matching closing tag for that Link with </button>
# (Best-effort: first </Link> after that block)
if n > 0:
    s = s.replace("</Link>", "</button>", 1)

p.write_text(s, encoding="utf-8")
print("✅ Nested dashboard Link replaced with button.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
