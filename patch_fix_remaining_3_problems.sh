#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" 2>/dev/null || cd "$(pwd)"

PAGE="apps/web/src/app/(app)/student/dashboard/page.tsx"
DONUT="apps/web/src/components/student/MasteryDonut.tsx"

if [ ! -f "$PAGE" ]; then
  echo "❌ Missing: $PAGE"
  exit 1
fi
if [ ! -f "$DONUT" ]; then
  echo "❌ Missing: $DONUT"
  exit 1
fi

backup () {
  local f="$1"
  local b="${f}.bak.$(date +%Y%m%d_%H%M%S)"
  cp "$f" "$b"
  echo "🧷 backup -> $b"
}

backup "$PAGE"
backup "$DONUT"

echo "🛠️  Fix A: dashboard useMemo deps (line 111) -> include segments"
python3 - <<'PY'
import re
from pathlib import Path

path = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
lines = path.read_text(encoding="utf-8").splitlines(True)

# The warning says Ln 111, Col 57. Use 1-based line indexing.
target_i = 111 - 1
if target_i < 0 or target_i >= len(lines):
    raise SystemExit("❌ Expected line 111 not found (file shorter than 111 lines). Paste the useMemo block if this happens.")

line = lines[target_i]

# Only patch if this line appears to be the useMemo line and has an empty deps array.
# Replace the deps array ONLY, not other [] on the line.
patched = line
if "useMemo" in line and re.search(r",\s*\[\s*\]\s*\)", line):
    patched = re.sub(r",\s*\[\s*\]\s*\)", ", [segments])", line, count=1)
elif "useMemo" in line and re.search(r",\s*\[\s*\]\s*$", line):
    # In case the line ends with ", []" and ")" is on next line
    patched = re.sub(r",\s*\[\s*\]\s*$", ", [segments]\n", line, count=1)

if patched == line:
    # Fallback: scan entire file for the first "useMemo(..., [])" and patch it.
    text = "".join(lines)
    new_text, n = re.subn(r"(useMemo\([\s\S]*?),\s*\[\s*\]\s*\)", r"\1, [segments])", text, count=1)
    if n == 0:
        raise SystemExit("❌ Couldn't find a useMemo(..., []) to patch. Paste the useMemo code around line 111.")
    path.write_text(new_text, encoding="utf-8")
else:
    lines[target_i] = patched
    path.write_text("".join(lines), encoding="utf-8")

print("✅ dashboard deps patched")
PY

echo "🛠️  Fix B/C: MasteryDonut Segment unused + stray expression"
python3 - <<'PY'
import re
from pathlib import Path

path = Path("apps/web/src/components/student/MasteryDonut.tsx")
text = path.read_text(encoding="utf-8")

# 1) Remove a stray expression line like:
#    Segment
#    Segment;
text2 = re.sub(r"(?m)^[ \t]*Segment[ \t]*;?[ \t]*\r?\n", "", text)

# 2) Ensure Segment type is exported (safe if already exported)
#    Convert leading "type Segment =" into "export type Segment ="
text2 = re.sub(r"(?m)^[ \t]*type[ \t]+Segment[ \t]*=", "export type Segment =", text2, count=1)

# 3) Make sure Segment is actually used in the function props:
#    export default function MasteryDonut({ segments }) {
#    export default function MasteryDonut({ segments }: any) {
text2, n = re.subn(
    r"export\s+default\s+function\s+MasteryDonut\s*\(\s*\{\s*segments\s*\}\s*(?::\s*any\s*)?\)\s*\{",
    "export default function MasteryDonut({ segments }: { segments: Segment[] }) {",
    text2,
    count=1,
    flags=re.S
)

# If it didn't match (different style), try an arrow component pattern:
# const MasteryDonut = ({ segments }: any) => {
if n == 0:
    text2 = re.sub(
        r"(?m)^(\s*const\s+MasteryDonut\s*=\s*\(\s*\{\s*segments\s*\}\s*)(:\s*any)?(\s*\)\s*=>\s*\{)",
        r"\1: { segments: Segment[] }\3",
        text2,
        count=1
    )

path.write_text(text2, encoding="utf-8")
print("✅ MasteryDonut cleaned + Segment now used")
PY

echo "✅ Done. Re-run:"
echo "  pnpm -C apps/web lint"
