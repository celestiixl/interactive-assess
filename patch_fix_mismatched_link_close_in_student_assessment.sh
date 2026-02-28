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

# Find the problematic closing </Link> that is immediately followed by the Sandbox description block.
# Then:
#  - change that </Link> -> </div>
#  - change the corresponding nearest preceding <Link ...> -> <div ...> (drop href)
pat = r'(</Link>\s*)(\n\s*<div className="mt-1 text-sm text-muted-foreground">)'
m = re.search(pat, s)
if not m:
  raise SystemExit("❌ Could not find the specific </Link> that precedes the sandbox description block.")

close_start = m.start(1)

# Find the nearest preceding <Link ...> before that close
before = s[:close_start]
open_matches = list(re.finditer(r'<Link\b[^>]*>', before))
if not open_matches:
  raise SystemExit("❌ Found </Link> but no preceding <Link ...> to pair with.")

open_m = open_matches[-1]
open_tag = open_m.group(0)

# Convert opening <Link ...> to <div ...> preserving className, dropping href and other Link-only props
# Keep className if present; keep other safe attrs (like className, title, etc.) but strip href.
div_tag = open_tag
div_tag = div_tag.replace("<Link", "<div", 1)
div_tag = re.sub(r'\s+href=("|\')[^"\']+("|\')', "", div_tag)
div_tag = re.sub(r'\s+prefetch=\{[^}]+\}', "", div_tag)
div_tag = re.sub(r'\s+replace=\{[^}]+\}', "", div_tag)
div_tag = re.sub(r'\s+scroll=\{[^}]+\}', "", div_tag)

# Apply replacements
s = s[:open_m.start()] + div_tag + s[open_m.end():]
s = re.sub(pat, r'</div>\2', s, count=1)

p.write_text(s, encoding="utf-8")
print("✅ Converted the broken Link-wrapped card to a <div> and fixed closing tag.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
