#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Can't find dashboard"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text(encoding="utf-8")

# 1) ensure Link import exists
if 'from "next/link"' not in s:
    s = s.replace(
        'import',
        'import Link from "next/link"\nimport',
        1
    )

# 2) replace the badge div with a clickable link button
s = re.sub(
r'<div className=\{\`rounded-full border px-3 py-1 text-sm font-semibold \$\{biomeHealth\.badge\}\`\}>\{nextSegment \? `Next: practice \$\{nextSegment\.label\}` : "Next: practice"\}</div>',
r'<Link href={nextSegment ? `/practice?focus=${nextSegment.key}` : "/practice"} className={`rounded-full border px-3 py-1 text-sm font-semibold hover:scale-105 transition ${biomeHealth.badge}`}>\n            {nextSegment ? `Next: practice ${nextSegment.label}` : "Start practice"}\n          </Link>',
s,
flags=re.S
)

p.write_text(s, encoding="utf-8")
print("✅ Next practice button now clickable")
PY

echo "Restart server:"
echo "pnpm dev:web"
