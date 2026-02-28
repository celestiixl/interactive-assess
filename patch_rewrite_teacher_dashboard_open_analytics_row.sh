#!/usr/bin/env bash
set -euo pipefail

echo "== Patch: rewrite Open/Analytics action row (Teacher Dashboard) =="

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "ERROR: Not inside a git repository."
  exit 1
fi
cd "$(git rev-parse --show-toplevel)"

TARGET="$(git ls-files | grep -E 'apps/web/src/app/\(app\)/teacher/dashboard/page\.tsx$|teacher/dashboard/page\.tsx$' | head -n 1 || true)"
if [[ -z "${TARGET}" ]]; then
  echo "ERROR: Could not find teacher/dashboard/page.tsx"
  exit 1
fi

STAMP="$(date +%Y%m%d_%H%M%S)"
cp -a "$TARGET" "$TARGET.bak.$STAMP"
echo "Target: $TARGET"
echo "Backup: $TARGET.bak.$STAMP"

python3 - "$TARGET" <<'PY'
import sys, re
from pathlib import Path

p = Path(sys.argv[1])
s = p.read_text(encoding="utf-8")

# Remove any stray literal \1 or \2 tokens anywhere (these were accidentally injected earlier)
s = re.sub(r"^[ \t]*\\[12][ \t]*\r?\n", "", s, flags=re.M)
s = re.sub(r"[ \t]*\\[12][ \t]*", "", s)

# Replace the entire action-row div (Open + Analytics) with known-good JSX.
# We match from: <div className="mt-5 flex justify-end gap-3">
# through the next closing </div> at the same indentation level (approximate but reliable here).
pattern = re.compile(
    r'(^[ \t]*<div\s+className="mt-5\s+flex\s+justify-end\s+gap-3"\s*>\s*\n)'
    r'([\s\S]*?)'
    r'(^[ \t]*</div>\s*$)',
    re.M
)

m = pattern.search(s)
if not m:
    raise SystemExit(
        "ERROR: Could not locate the action-row div with className=\"mt-5 flex justify-end gap-3\".\n"
        "Search manually for that className; the file may differ."
    )

indent = re.match(r'^(\s*)', m.group(1)).group(1)

replacement_inner = f"""{indent}<div className="mt-5 flex justify-end gap-3">
{indent}  <a
{indent}    href="/teacher/builder"
{indent}    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50"
{indent}  >
{indent}    Open
{indent}  </a>

{indent}  <button
{indent}    type="button"
{indent}    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold opacity-60"
{indent}    title="Hook this up later"
{indent}    disabled
{indent}  >
{indent}    Analytics
{indent}  </button>
{indent}</div>"""

s2 = s[:m.start()] + replacement_inner + s[m.end():]
p.write_text(s2, encoding="utf-8")
print("Rewrote Open/Analytics action row successfully.")
PY

echo "Done. Re-run your dev/build."
