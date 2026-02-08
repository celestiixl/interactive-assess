#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1

B="apps/web/src/app/teacher/builder/page.tsx"
STAMP="$(date +%Y%m%d_%H%M%S)"

if [[ ! -f "$B" ]]; then
  echo "❌ Builder file not found: $B"
  exit 1
fi

cp -v "$B" "$B.bak_add_inline_choice_button_$STAMP"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/teacher/builder/page.tsx")
s = p.read_text()

# Find the segmented control container (the row with Multiple Choice / Card Sort / Hotspot)
pattern = re.compile(
    r'(<div[^>]+className="[^"]*flex[^"]*gap-3[^"]*"[^>]*>)([\s\S]*?)(</div>)',
    re.M
)

m = pattern.search(s)
if not m:
    raise SystemExit("❌ Could not find item type button row")

container_start, inner, container_end = m.groups()

# If Inline Choice already exists, do nothing
if "Inline Choice" in inner:
    print("ℹ️ Inline Choice button already present")
    raise SystemExit(0)

# Button JSX (matches your styling)
inline_btn = '''
<button
  type="button"
  onClick={() => setType("inline_choice")}
  className={`flex-1 rounded-full border px-6 py-3 text-lg font-semibold transition ${
    type === "inline_choice"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
  }`}
>
  Inline Choice
</button>
'''

# Insert BEFORE Hotspot button
hotspot_idx = inner.find("Hotspot")
if hotspot_idx == -1:
    # fallback: append at end
    new_inner = inner + "\n" + inline_btn
else:
    # insert just before the hotspot button JSX
    split_idx = inner.rfind("<button", 0, hotspot_idx)
    new_inner = inner[:split_idx] + inline_btn + inner[split_idx:]

new_block = container_start + new_inner + container_end
s = s[:m.start()] + new_block + s[m.end():]

p.write_text(s)
print("✅ Inline Choice button added to segmented control")
PY

echo ""
echo "➡️ Restart dev server:"
echo "  rm -rf apps/web/.next"
echo "  (lsof -ti tcp:3002 | xargs -r kill -9)"
echo "  HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
