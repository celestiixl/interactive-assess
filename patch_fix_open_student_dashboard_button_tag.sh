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

# Replace the broken Link/button line with a real button using router.push
s, n = re.subn(
  r'<Link\s+href="/student/dashboard"\s+className="ia-btn-primary text-sm">\s*Open Student Dashboard\s*</button>',
  '<button type="button" className="ia-btn-primary text-sm"\n'
  '  onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); router.push("/student/dashboard"); }}>\n'
  '  Open Student Dashboard\n'
  '</button>',
  s,
  count=1
)

if n == 0:
  # fallback: just fix the closing tag if it’s slightly different
  s = s.replace("</button>", "</Link>", 1)

p.write_text(s, encoding="utf-8")
print("✅ Fixed the broken Link/button tag.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
