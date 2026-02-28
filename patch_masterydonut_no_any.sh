#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

FILE="apps/web/src/components/student/MasteryDonut.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python3 <<'PY'
from pathlib import Path
p = Path("apps/web/src/components/student/MasteryDonut.tsx")
s = p.read_text(encoding="utf-8")

# Replace:
# function isPracticeClusterKey(k: string) {
#   return PRACTICE_KEYS.includes(k as any);
# }
#
# With a safe string-check (no any):
needle = "function isPracticeClusterKey(k: string) {"
idx = s.find(needle)
if idx == -1:
  raise SystemExit("❌ Could not find isPracticeClusterKey()")

# crude but effective: replace the includes line
s2 = s.replace(
  "  return PRACTICE_KEYS.includes(k as any);",
  "  return (PRACTICE_KEYS as readonly string[]).includes(k);"
)

p.write_text(s2, encoding="utf-8")
print("✅ Patched isPracticeClusterKey() to avoid any")
PY

echo "✅ Updated: $FILE"
