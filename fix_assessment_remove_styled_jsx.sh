#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1

# Find Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router"
  exit 1
fi

PAGE="$APP_ROOT/assessment/page.tsx"
[ -f "$PAGE" ] || { echo "❌ missing: $PAGE"; exit 1; }

bak="$PAGE.bak.$(date +%Y%m%d_%H%M%S)"
cp -v "$PAGE" "$bak" >/dev/null
echo "✅ backup: $bak"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
    p = Path("apps/web/app/assessment/page.tsx")

t = p.read_text(encoding="utf-8")

# Remove the <style jsx global> block that triggers styled-jsx / client-only
t2, n = re.subn(r'\s*<style jsx global>\{`[\s\S]*?`\}</style>\s*', '\n', t, count=1)

if n == 0:
    raise SystemExit("❌ No styled-jsx block found to remove.")

# Also remove the injected id if you want (safe to keep). We'll keep it.
p.write_text(t2, encoding="utf-8")
print("✅ Removed styled-jsx global style block (server component safe).")
PY

echo "🎯 Done. Rebuild/reload now."
