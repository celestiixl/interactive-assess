#!/usr/bin/env bash
set -euo pipefail

echo "== Patch: replace broken Analytics button block =="

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

# Replace the Analytics <button ...>...</button> block with a clean one.
# We match a <button ...> that contains the text Analytics and ends with </button>.
pattern = re.compile(r"<button\b[\s\S]*?>\s*Analytics\s*</button>", re.M)

replacement = """<button
                    type="button"
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold opacity-60"
                    title="Hook this up later"
                    disabled
                  >
                    Analytics
                  </button>"""

s2, n = pattern.subn(replacement, s, count=1)
if n == 0:
    raise SystemExit(
        "ERROR: Could not find an Analytics <button> block to replace.\n"
        "Run and paste:\n"
        "  nl -ba " + str(p) + " | sed -n '55,85p'\n"
    )

p.write_text(s2, encoding="utf-8")
print("Replaced Analytics button block.")
PY

echo "Done. Re-run your dev/build."
