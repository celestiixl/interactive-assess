#!/usr/bin/env bash
set -euo pipefail

echo "== Patch: split '</Link></div>' onto separate lines (Teacher Dashboard) =="

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "ERROR: Not inside a git repository."
  exit 1
fi
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

TARGET="$(git ls-files | grep -E 'apps/web/src/app/\(app\)/teacher/dashboard/page\.tsx$|teacher/dashboard/page\.tsx$' | head -n 1 || true)"
if [[ -z "${TARGET}" ]]; then
  echo "ERROR: Could not find teacher/dashboard/page.tsx"
  git ls-files | grep -iE 'teacher.*dashboard.*page\.tsx' || true
  exit 1
fi

echo "Repo root: $REPO_ROOT"
echo "Target file: $TARGET"

STAMP="$(date +%Y%m%d_%H%M%S)"
cp -a "$TARGET" "$TARGET.bak.$STAMP"
echo "Backup: $TARGET.bak.$STAMP"

python3 - "$TARGET" <<'PY'
import sys, re
from pathlib import Path

target = Path(sys.argv[1])
text = target.read_text(encoding="utf-8")

# Fix patterns like: </Link>              </div>
# by inserting a newline + indentation before </div>.
new_text, n = re.subn(
    r"(</Link>)\s*(</div>)",
    r"\\1\n                \\2",
    text
)

# Also fix the reverse rare case: </div></Link>
new_text, n2 = re.subn(
    r"(</div>)\s*(</Link>)",
    r"\\1\n                \\2",
    new_text
)

if n == 0 and n2 == 0:
    raise SystemExit(
        "ERROR: Could not find any '</Link> ... </div>' (or '</div> ... </Link>') pattern to split.\n"
        "That means the JSX is malformed in a different way (usually a missing '>' on an opening tag above)."
    )

target.write_text(new_text, encoding="utf-8")
print(f"Patched: split {n + n2} combined closing-tag occurrence(s).")
PY

echo "Done. Re-run your dev/build."
