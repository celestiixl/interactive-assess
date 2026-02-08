#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

P="apps/web/src/app/practice/page.tsx"
STAMP="$(date +%Y%m%d_%H%M%S)"

[[ -f "$P" ]] || { echo "❌ Missing: $P"; exit 1; }
cp -v "$P" "$P.bak_inline_choice_state_$STAMP"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/practice/page.tsx")
s = p.read_text()

# ------------------------------------------------------------
# 1) Add state if missing
# ------------------------------------------------------------
if "setInlineChoiceResponse" not in s:
    # Insert inside the component function after the first useState block
    fn = re.search(r'export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{', s)
    if not fn:
        raise SystemExit("❌ Could not find component function start (export default function …).")

    # Find a reasonable insertion point: after the first few const useState lines
    after = s[fn.end():]
    m = re.search(r'(\n\s*const\s+\[[^\]]+\]\s*=\s*useState[\s\S]*?;\s*)', after)
    insert_at = fn.end() + (m.end() if m else 0)

    block = "\n  // Inline Choice (cloze) response: blankId -> chosenOption\n  const [inlineChoiceResponse, setInlineChoiceResponse] = useState<Record<string, string>>({});\n"
    s = s[:insert_at] + block + s[insert_at:]

# ------------------------------------------------------------
# 2) Normalize InlineChoice render block (safeItem + setter)
#    We only touch the specific InlineChoice JSX chunk.
# ------------------------------------------------------------
# Replace any InlineChoice block that sets onChange to setInlineChoiceResponse
# and ensure it uses safeItem.
pattern = re.compile(
    r'\{[^\n]*type\s*===\s*"inline_choice"[^\n]*\?\s*\(\s*'
    r'<InlineChoice[\s\S]*?/>'
    r'\s*\)\s*:\s*null\}',
    re.M
)

def normalize_block(m):
    return (
        '{safeItem.type === "inline_choice" ? (\n'
        '  <InlineChoice\n'
        '    item={safeItem as any}\n'
        '    disabled={mode === "exam" && !!checked}\n'
        '    onChange={(r) => setInlineChoiceResponse(r)}\n'
        '  />\n'
        ') : null}'
    )

if pattern.search(s):
    s = pattern.sub(normalize_block, s, count=1)
else:
    # If no existing block, do nothing (user may paste later)
    pass

p.write_text(s)
print("✅ Patched InlineChoice state + normalized render block (if found).")
PY

echo ""
echo "✅ Done. If you want to confirm:"
echo "   grep -n \"setInlineChoiceResponse\" -n \"$P\" | head"
