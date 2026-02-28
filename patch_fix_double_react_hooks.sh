#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/hotq/HotQuestionTeacherInsights.tsx"
[ -f "$FILE" ] || { echo "❌ Missing $FILE"; exit 1; }

cp "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path

p = Path("apps/web/src/components/hotq/HotQuestionTeacherInsights.tsx")
t = p.read_text(encoding="utf-8")

t = t.replace("React.React.", "React.")
t = t.replace("React..", "React.")  # just in case

p.write_text(t, encoding="utf-8")
print("✅ Fixed React.React.* to React.*")
PY

echo "✅ Done. Restart dev:"
echo "pnpm -C apps/web dev"
