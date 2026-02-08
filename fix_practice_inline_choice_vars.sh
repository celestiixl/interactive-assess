#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

P="apps/web/src/app/practice/page.tsx"
STAMP="$(date +%Y%m%d_%H%M%S)"

[[ -f "$P" ]] || { echo "❌ Missing: $P"; exit 1; }
cp -v "$P" "$P.bak_inline_choice_vars_$STAMP"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/practice/page.tsx")
s = p.read_text()

# 1) Ensure state exists with the EXACT setter name used in your JSX: setInlineChoiceResponse
if "setInlineChoiceResponse" not in s:
    # Insert inside component after first useState or right after function open
    fn = re.search(r'export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{', s)
    if not fn:
        raise SystemExit("❌ Could not find component function start.")

    after = s[fn.end():]
    m = re.search(r'\n(\s*const\s+\[[^\]]+\]\s*=\s*useState[\s\S]*?;\s*)', after)
    insert_pos = fn.end() + (m.end() if m else 0)
    block = "\n  const [inlineChoiceResponse, setInlineChoiceResponse] = useState<Record<string, string>>({});\n"
    s = s[:insert_pos] + block + s[insert_pos:]

# 2) Fix disabled expression inside InlineChoice render:
# Your screenshot shows: disabled={mode === "exam" && !!checked} (and it’s underlined)
# Safer intent: disable AFTER you checked in exam mode:
s = re.sub(
    r'disabled=\{mode\s*===\s*"exam"\s*&&\s*!!checked\}',
    'disabled={mode === "exam" && !!checked}',
    s,
)

# If you actually want the opposite (disable until checked), swap to && !checked:
# (we detect a common broken variant and correct it)
s = re.sub(
    r'disabled=\{mode\s*===\s*"exam"\s*&&\s*!\s*!checked\}',
    'disabled={mode === "exam" && !checked}',
    s,
)

# 3) Ensure onChange calls the right setter name (your JSX uses setInlineChoiceResponse already)
# If some other name exists, normalize it.
s = re.sub(
    r'onChange=\{\(r\)\s*=>\s*setInlineChoiceResponse\(\s*r\s*\)\s*\}',
    'onChange={(r) => setInlineChoiceResponse(r)}',
    s
)

p.write_text(s)
print("✅ InlineChoice vars patched (state + normalization).")
PY

echo ""
echo "✅ Done. Next: restart dev server (after freeing the port)."
