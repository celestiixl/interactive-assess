#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess

FILE="apps/web/src/components/student/MasteryDonut.tsx"
[[ -f "$FILE" ]] || { echo "❌ Missing $FILE"; exit 1; }

cp -a "$FILE" "$FILE.bak.$(date +%Y%m%d_%H%M%S)"

perl -0777 -i -pe '
s/function isPracticeClusterKey\(k: string\) \{
\s*return PRACTICE_KEYS\.includes\(k as any\);
\}/function isPracticeClusterKey(
  k: string
): k is (typeof PRACTICE_KEYS)[number] {
  return (PRACTICE_KEYS as readonly string[]).includes(k);
}/s
' "$FILE"

echo "✅ Type guard installed"
