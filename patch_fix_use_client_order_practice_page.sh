#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found at /workspaces/interactive-assess"; exit 1; }

# Find practice page
if [ -f apps/web/src/app/practice/page.tsx ]; then
  PRACTICE="apps/web/src/app/practice/page.tsx"
elif [ -f apps/web/app/practice/page.tsx ]; then
  PRACTICE="apps/web/app/practice/page.tsx"
else
  echo "❌ cannot find practice page.tsx"
  exit 1
fi

echo "✅ PRACTICE=$PRACTICE"

ts="$(date +%Y%m%d_%H%M%S)"
cp -v "$PRACTICE" "$PRACTICE.bak.$ts" >/dev/null
echo "✅ backup: $PRACTICE.bak.$ts"

python - <<'PY'
import pathlib, re

path = pathlib.Path("apps/web/src/app/practice/page.tsx")
if not path.exists():
    path = pathlib.Path("apps/web/app/practice/page.tsx")

text = path.read_text(encoding="utf-8")

# Remove all existing "use client" directives (we'll add one cleanly at top)
text_wo = re.sub(r'^\s*["\']use client["\'];\s*\n', '', text, flags=re.M)

# Also handle the case where it was on line 2 etc (not just start-of-line)
text_wo = re.sub(r'\n\s*["\']use client["\'];\s*\n', '\n', text_wo)

# Trim leading blank lines
text_wo = text_wo.lstrip("\n")

fixed = '"use client";\n\n' + text_wo

path.write_text(fixed, encoding="utf-8")
print(f"✅ Fixed directive order in {path}")
PY

# Quick verify: first non-empty line is "use client";
first_line="$(python - <<'PY'
import pathlib
p=pathlib.Path("'"$PRACTICE"'")
s=p.read_text(encoding="utf-8").splitlines()
for line in s:
    if line.strip()=="":
        continue
    print(line.strip())
    break
PY
)"
if [ "$first_line" = "\"use client\";" ]; then
  echo "✅ Verified: \"use client\" is the first statement."
else
  echo "⚠️ Verification failed. First statement was: $first_line"
  echo "   Restore backup: cp $PRACTICE.bak.$ts $PRACTICE"
  exit 2
fi
