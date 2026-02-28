#!/usr/bin/env bash
set -euo pipefail

echo "== Patch: repair teacher dashboard (remove \\1/\\2 + restore button block) =="

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "ERROR: Not inside a git repository."
  exit 1
fi
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
echo "Repo root: $REPO_ROOT"

TARGET="$(git ls-files | grep -E 'apps/web/src/app/\(app\)/teacher/dashboard/page\.tsx$|teacher/dashboard/page\.tsx$' | head -n 1 || true)"
if [[ -z "${TARGET}" ]]; then
  echo "ERROR: Could not find teacher/dashboard/page.tsx"
  git ls-files | grep -iE 'teacher.*dashboard.*page\.tsx' || true
  exit 1
fi
echo "Target file: $TARGET"

STAMP="$(date +%Y%m%d_%H%M%S)"
cp -a "$TARGET" "$TARGET.bak.$STAMP"
echo "Backup: $TARGET.bak.$STAMP"

python3 - "$TARGET" <<'PY'
import sys, re
from pathlib import Path

target = Path(sys.argv[1])
text = target.read_text(encoding="utf-8")

# 1) Remove any literal "\1" or "\2" tokens that were accidentally inserted
#    (including ones surrounded by whitespace)
text, n_backrefs = re.subn(r"^[ \t]*\\[12][ \t]*\r?\n", "", text, flags=re.M)
text, n_backrefs_inline = re.subn(r"[ \t]*\\[12][ \t]*", "", text)

# 2) Ensure Link import exists
if not re.search(r'^\s*import\s+Link\s+from\s+[\'"]next/link[\'"]\s*;?\s*$', text, flags=re.M):
    m = re.search(r'^\s*[\'"]use client[\'"]\s*;?\s*$', text, flags=re.M)
    if m:
        insert_at = m.end()
        text = text[:insert_at] + '\nimport Link from "next/link";\n' + text[insert_at:]
    else:
        text = 'import Link from "next/link";\n' + text

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

# 3) Replace the entire button container if present
pattern_div = re.compile(
    r'^[ \t]*<div\s+className="flex\s+flex-wrap\s+items-center\s+gap-3">\s*'
    r'[\s\S]*?'
    r'^[ \t]*</div>\s*',
    re.M
)

m = pattern_div.search(text)
if m:
    text = text[:m.start()] + replacement + "\n" + text[m.end():]
else:
    # Fallback: try to replace the two Link blocks even if div wrapper differs
    pattern_links = re.compile(
        r"<Link\b[\s\S]*?>\s*Item\s+Bank\s*</Link>\s*"
        r"<Link\b[\s\S]*?href\s*=\s*[\"']\/teacher\/builder[\"'][\s\S]*?>[\s\S]*?</Link>",
        re.M
    )
    m2 = pattern_links.search(text)
    if not m2:
        raise SystemExit(
            "ERROR: Couldn't find the button block to replace.\n"
            "Your JSX is still malformed around that area.\n"
            "Run the command below and paste the output:\n"
            "  nl -ba " + str(target) + " | sed -n '1,80p'\n"
        )
    text = text[:m2.start()] + replacement + text[m2.end():]

target.write_text(text, encoding="utf-8")
print(f"Removed stray backref tokens: {n_backrefs + n_backrefs_inline}")
print("Restored the Item Bank / Builder button block.")
PY

echo "Done. Re-run your dev/build."
