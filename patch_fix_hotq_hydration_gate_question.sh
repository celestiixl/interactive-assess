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

# Ensure we have a mounted state; if not, add it immediately after function start.
if "mounted" not in t or "setMounted" not in t:
    t = re.sub(
        r'(export\s+default\s+function\s+HotQuestionTeacherInsights\s*\([^)]*\)\s*\{\s*)',
        r'\1\n  const [mounted, setMounted] = React.useState(false);\n  React.useEffect(() => { setMounted(true); }, []);\n',
        t,
        count=1
    )

# Change q initialization to a safe placeholder first
# Replace: React.useState(() => pickDailyQuestion())
t = re.sub(
    r'const\s+\[q,\s*setQ\]\s*=\s*React\.useState\s*\(\s*\(\s*\)\s*=>\s*pickDailyQuestion\(\)\s*\)\s*;',
    r'const [q, setQ] = React.useState<any>(null);',
    t,
    count=1
)

# On mount, set q once
if "setQ(pickDailyQuestion())" not in t:
    t = re.sub(
        r'(React\.useEffect\(\s*\(\)\s*=>\s*\{\s*setMounted\(true\);\s*\}\s*,\s*\[\s*\]\s*\);\s*)',
        r'\1\n  React.useEffect(() => {\n    setQ(pickDailyQuestion());\n  }, []);\n',
        t,
        count=1
    )

# Gate prompt rendering
# Replace {q.prompt} with {mounted && q ? q.prompt : ""}
t = re.sub(
    r'\{q\.prompt\}',
    r'{mounted && q ? q.prompt : ""}',
    t,
    count=1
)

# Gate other q.* uses that commonly appear (optional but helpful)
t = re.sub(r'\{q\.stem\}', r'{mounted && q ? q.stem : ""}', t)
t = re.sub(r'\{q\.teks\}', r'{mounted && q ? q.teks : ""}', t)

p.write_text(t, encoding="utf-8")
print("✅ HotQ hydration fix: question chosen after mount; prompt gated.")
PY

echo "✅ Done. Restart dev:"
echo "pnpm -C apps/web dev"
