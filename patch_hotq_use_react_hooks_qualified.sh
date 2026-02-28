#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/hotq/HotQuestionTeacherInsights.tsx"
[ -f "$FILE" ] || { echo "❌ Missing $FILE"; exit 1; }

cp "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/hotq/HotQuestionTeacherInsights.tsx")
t = p.read_text(encoding="utf-8")

# Replace bare hooks with React-qualified hooks (safe + minimal)
t = re.sub(r'\buseState\(', 'React.useState(', t)
t = re.sub(r'\buseEffect\(', 'React.useEffect(', t)

p.write_text(t, encoding="utf-8")
print("✅ Converted useState/useEffect to React.useState/React.useEffect")
PY

echo "✅ Done. Restart dev:"
echo "pnpm -C apps/web dev"
