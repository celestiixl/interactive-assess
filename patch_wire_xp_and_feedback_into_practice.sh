#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO"

# Find practice page
PRACTICE_PAGE=""
for f in \
  apps/web/src/app/(app)/practice/page.tsx \
  apps/web/src/app/practice/page.tsx \
  apps/web/app/(app)/practice/page.tsx \
  apps/web/app/practice/page.tsx
do
  if [ -f "$f" ]; then PRACTICE_PAGE="$f"; break; fi
done

if [ -z "$PRACTICE_PAGE" ]; then
  echo "❌ Could not find practice page.tsx"
  exit 1
fi

cp "$PRACTICE_PAGE" "$PRACTICE_PAGE.bak.$(date +%s)"
echo "✅ PRACTICE_PAGE=$PRACTICE_PAGE"

python - <<'PY'
from pathlib import Path
import re

p = Path(r"""'"$PRACTICE_PAGE"'""")
s = p.read_text(encoding="utf-8")

# Ensure client component (XP header uses client APIs)
if not s.lstrip().startswith('"use client"') and not s.lstrip().startswith("'use client'"):
  s = '"use client";\n\n' + s

# Add imports (once)
if "PracticeXPHeader" not in s:
  s = re.sub(r'(^import .*?\n)', r'\1import PracticeXPHeader from "@/components/student/PracticeXPHeader";\n', s, count=1, flags=re.M)

# Insert header near top of render (before the main practice content)
# Best-effort: put it right after the first opening <main> or first wrapper <div>.
if "PracticeXPHeader" in s and "<PracticeXPHeader" not in s:
  # try <main ...>
  s2, n = re.subn(r'(<main[^>]*>\s*)', r'\1\n      <PracticeXPHeader />\n', s, count=1, flags=re.S)
  if n == 0:
    s2, n = re.subn(r'(<div[^>]*>\s*)', r'\1\n      <PracticeXPHeader />\n', s, count=1, flags=re.S)
  s = s2

p.write_text(s, encoding="utf-8")
print("✅ Practice page now shows XP header.")
PY

# Now: emit practice-result events from the component that checks answers.
# We auto-find a likely practice interaction file by searching for "Check Answer" or "isCorrect".
CANDIDATE=$(rg -l 'Check Answer|isCorrect|correctAnswer|setIsCorrect|gradeAnswer' apps/web/src/components apps/web/src/app | head -n 1 || true)

if [ -z "$CANDIDATE" ]; then
  echo "⚠️ Could not auto-find the answer-check component."
  echo "   XP header will show, but XP will not increase until we wire the event emitter."
  echo "   Tell me the file where answers are checked (or paste that snippet) and I’ll patch it."
  exit 0
fi

cp "$CANDIDATE" "$CANDIDATE.bak.$(date +%s)"
echo "✅ Wiring event emitter in: $CANDIDATE"

python - <<'PY'
from pathlib import Path
import re
import sys

path = Path(r"""'"$CANDIDATE"'""")
s = path.read_text(encoding="utf-8")

# We inject a single line to dispatch practice-result after a correctness boolean is computed.
# Best-effort patterns: `const isCorrect = ...` or `const correct = ...` or `setIsCorrect(...)`
injected = False

# 1) After `const isCorrect = ...;`
pat = r'(const\s+isCorrect\s*=\s*[^;]+;)'
if re.search(pat, s) and "practice-result" not in s:
  s = re.sub(pat, r'\1\n    try { window.dispatchEvent(new CustomEvent("practice-result", { detail: { correct: !!isCorrect } })); } catch {}', s, count=1)
  injected = True

# 2) After `const correct = ...;`
if not injected:
  pat = r'(const\s+correct\s*=\s*[^;]+;)'
  if re.search(pat, s) and "practice-result" not in s:
    s = re.sub(pat, r'\1\n    try { window.dispatchEvent(new CustomEvent("practice-result", { detail: { correct: !!correct } })); } catch {}', s, count=1)
    injected = True

# 3) After `setIsCorrect(<expr>);` (we dispatch with same expr)
if not injected:
  pat = r'(setIsCorrect\(([^)]+)\);)'
  if re.search(pat, s) and "practice-result" not in s:
    s = re.sub(pat, r'\1\n    try { window.dispatchEvent(new CustomEvent("practice-result", { detail: { correct: !!(\2) } })); } catch {}', s, count=1)
    injected = True

if not injected:
  print("⚠️ Could not find a safe injection spot in this file.")
  sys.exit(0)

path.write_text(s, encoding="utf-8")
print("✅ practice-result event dispatch added.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
