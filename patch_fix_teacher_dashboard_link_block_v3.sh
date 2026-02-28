#!/usr/bin/env bash
set -euo pipefail

echo "== Patch: fix Teacher Dashboard Link block (v3) =="

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

# Ensure: import Link from "next/link";
if not re.search(r'^\s*import\s+Link\s+from\s+[\'"]next/link[\'"]\s*;?\s*$', text, flags=re.M):
    # Insert after "use client" if present, else at top
    m = re.search(r'^\s*[\'"]use client[\'"]\s*;?\s*$', text, flags=re.M)
    if m:
        insert_at = m.end()
        text = text[:insert_at] + "\nimport Link from \"next/link\";\n" + text[insert_at:]
    else:
        text = "import Link from \"next/link\";\n" + text

replacement = """\
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/teacher/item-bank"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                Item Bank
              </Link>

              <Link
                href="/teacher/builder"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Builder
              </Link>
            </div>"""

pattern = re.compile(
    r"<Link\b[\s\S]*?>\s*Item\s+Bank\s*</Link>\s*"
    r"<Link\b[\s\S]*?href\s*=\s*[\"']\/teacher\/builder[\"'][\s\S]*?>[\s\S]*?</Link>",
    re.MULTILINE
)

m = pattern.search(text)
if not m:
    raise SystemExit(
        "ERROR: Could not find the combined <Link> block for 'Item Bank' + '/teacher/builder'.\n"
        "This usually means the JSX is malformed *above* the Link block (missing >, </div>, ), etc.).\n"
        "Paste 40 lines above the Item Bank Link and I will generate a targeted patch."
    )

text = text[:m.start()] + replacement + text[m.end():]
target.write_text(text, encoding="utf-8")
print("Patched successfully.")
PY

echo "Done. Re-run your dev/build."
