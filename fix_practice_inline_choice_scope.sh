#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

P="apps/web/src/app/practice/page.tsx"
STAMP="$(date +%Y%m%d_%H%M%S)"

if [[ ! -f "$P" ]]; then
  echo "❌ Missing: $P"
  exit 1
fi

cp -v "$P" "$P.bak_fix_inline_choice_scope_$STAMP"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/practice/page.tsx")
s = p.read_text()

# ------------------------------------------------------------
# 1) Remove the stray injected block that references {item.type === "inline_choice"...}
#    (it is currently outside component scope)
# ------------------------------------------------------------
# Remove any JSX block that starts with "{item.type === "inline_choice"" and ends with " : null}"
pattern = re.compile(
    r'\n\s*\{\s*item\.type\s*===\s*"inline_choice"\s*\?\s*\([\s\S]*?\)\s*:\s*null\s*\}\s*\n',
    re.MULTILINE
)
s2, n = pattern.subn("\n", s)
s = s2

# Also remove common variant with ": null}" on same line without extra whitespace
pattern2 = re.compile(
    r'\{\s*item\.type\s*===\s*"inline_choice"\s*\?\s*\([\s\S]*?\)\s*:\s*null\s*\}',
    re.MULTILINE
)
s, n2 = pattern2.subn("", s)

# ------------------------------------------------------------
# 2) Ensure InlineChoice import exists
# ------------------------------------------------------------
if 'from "@/components/items/InlineChoice"' not in s:
    lines = s.splitlines(True)
    insert_at = 0
    for i, line in enumerate(lines):
        if 'from "@/components/items/' in line:
            insert_at = i + 1
    lines.insert(insert_at, 'import InlineChoice from "@/components/items/InlineChoice";\n')
    s = "".join(lines)

# ------------------------------------------------------------
# 3) Ensure state exists INSIDE component: inlineChoiceResponse + setInlineChoiceResponse
# ------------------------------------------------------------
if "setInlineChoiceResponse" not in s:
    # Insert right after the first useState declaration inside the component body
    # Find "export default function" start, then first "useState(" after it.
    fn = re.search(r'export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{', s)
    if fn:
        after = s[fn.end():]
        m = re.search(r'\n\s*const\s+\[[^\]]+\]\s*=\s*useState<[^>]*>\([^)]*\);\s*', after)
        if m:
            ins = fn.end() + m.end()
            s = s[:ins] + '\n  const [inlineChoiceResponse, setInlineChoiceResponse] = useState<Record<string, string>>({});\n' + s[ins:]
        else:
            # fallback: put right after function opening brace
            s = s[:fn.end()] + '\n  const [inlineChoiceResponse, setInlineChoiceResponse] = useState<Record<string, string>>({});\n' + s[fn.end():]

# ------------------------------------------------------------
# 4) Insert InlineChoice renderer in the correct scope using safeItem (not item)
#    We try to place it right before existing DragDrop/CardSort render inside "Your Work".
# ------------------------------------------------------------
inject = r'''
                {safeItem.type === "inline_choice" ? (
                  <InlineChoice
                    item={safeItem as any}
                    disabled={mode === "exam" && !!checked}
                    onChange={(r) => setInlineChoiceResponse(r)}
                  />
                ) : null}

'''

# If already inserted with safeItem, don't duplicate
if "safeItem.type === \"inline_choice\"" not in s:
    # Find an anchor where other item components render
    anchor_candidates = ["<DragDrop", "<CardSort", "<Hotspot", "safeItem.type === \"dragdrop\"", "safeItem.type === \"mcq\""]
    anchor_pos = -1
    for a in anchor_candidates:
        pos = s.find(a)
        if pos != -1:
            anchor_pos = pos
            break

    if anchor_pos != -1:
        s = s[:anchor_pos] + inject + s[anchor_pos:]
    else:
        # last resort: insert before the final return closing of JSX in component
        # find last occurrence of "</main>" and insert before it
        pos = s.rfind("</main>")
        if pos != -1:
            s = s[:pos] + inject + s[pos:]
        else:
            # truly last resort: append
            s = s + "\n" + inject

p.write_text(s)
print("✅ Fixed: removed out-of-scope inline_choice block, ensured import/state, inserted safeItem inline_choice renderer.")
PY

echo ""
echo "➡️ Restart clean (route cache + port):"
echo "  rm -rf apps/web/.next"
echo "  (lsof -ti tcp:3002 | xargs -r kill -9) || true"
echo "  HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
