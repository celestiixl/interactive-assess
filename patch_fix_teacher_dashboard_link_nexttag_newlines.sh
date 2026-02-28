#!/usr/bin/env bash
set -euo pipefail

echo "== Patch: insert newline after </Link> when next tag starts =="

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "ERROR: Not inside a git repository."
  exit 1
fi
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

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

# Insert newline between </Link> and the next opening tag when they are on same line.
# Covers common next tags used in buttons/controls.
pattern = re.compile(r"(</Link>)\s*(<(?:(?:button)|(?:div)|(?:span)|(?:a)|(?:section)|(?:p))\b)", re.M)
s2, n = pattern.subn(r"\\1\n                  \\2", s)

# Also handle cases like </button><Link or </div><Link if they exist
pattern2 = re.compile(r"(</(?:button|div|span|a|section|p)>)\s*(<Link\b)", re.M)
s3, n2 = pattern2.subn(r"\\1\n                  \\2", s2)

if n == 0 and n2 == 0:
    raise SystemExit("ERROR: No '</Link><tag' or '</tag><Link' same-line patterns found to fix.")

p.write_text(s3, encoding="utf-8")
print(f"Patched occurrences: {n + n2}")
PY

echo "Done. Re-run your dev/build."
