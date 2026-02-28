#!/usr/bin/env bash
set -euo pipefail

echo "== Patch: remove one extra </div> immediately before <div className=\"grid gap-6\"> =="

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

# Also strip any remaining literal \1/\2 tokens (just in case)
s = re.sub(r"^[ \t]*\\[12][ \t]*\r?\n", "", s, flags=re.M)
s = re.sub(r"[ \t]*\\[12][ \t]*", "", s)

# Remove ONE </div> that occurs immediately before the <div className="grid gap-6"> section.
pattern = re.compile(
    r"\n([ \t]*)</div>\s*\n\s*\n(\1<div\s+className=\"grid\s+gap-6\">)",
    re.M
)

m = pattern.search(s)
if not m:
    # Less strict fallback: ignore indentation match, still only remove ONE close-div right before the grid.
    pattern2 = re.compile(r"\n[ \t]*</div>\s*\n\s*\n(\s*<div\s+className=\"grid\s+gap-6\">)", re.M)
    s2, n2 = pattern2.subn(r"\n\1", s, count=1)
    if n2 == 0:
        raise SystemExit(
            "ERROR: Could not find an extra </div> right before <div className=\"grid gap-6\"> to remove.\n"
            "At this point the JSX is still broken earlier (missing </div>, missing >, or bad quotes).\n"
            "Run:\n"
            "  nl -ba " + str(p) + " | sed -n '50,95p'\n"
            "and paste it."
        )
    p.write_text(s2, encoding="utf-8")
    print("Removed 1 </div> before <div className=\"grid gap-6\"> (fallback match).")
else:
    # Remove the matched </div> line, keep the grid section
    s2 = s[:m.start()] + "\n" + m.group(2) + s[m.end():]
    p.write_text(s2, encoding="utf-8")
    print("Removed 1 </div> before <div className=\"grid gap-6\"> (indent-aware match).")
PY

echo "Done. Re-run your dev/build."
