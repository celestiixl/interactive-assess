#!/usr/bin/env bash
set -euo pipefail

echo "== Patch: fix Teacher Dashboard Link block (v2) =="

# 1) Confirm we're in the repo root
if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "ERROR: Not inside a git repository."
  echo "Run: cd /workspaces/interactive-assess (or your repo folder) and try again."
  exit 1
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
echo "Repo root: $REPO_ROOT"

# 2) Find the file by searching tracked files (works even if the path differs)
echo "Searching for teacher dashboard page.tsx..."
TARGET="$(git ls-files | grep -E 'apps/web/src/app/\(app\)/teacher/dashboard/page\.tsx$|teacher/dashboard/page\.tsx$' | head -n 1 || true)"

if [[ -z "${TARGET}" ]]; then
  echo "ERROR: Could not find teacher/dashboard/page.tsx in tracked files."
  echo ""
  echo "Here are likely matches (if any):"
  git ls-files | grep -iE 'teacher.*dashboard.*page\.tsx' || true
  echo ""
  echo "If you see it listed above, copy the exact path and replace TARGET manually in this script."
  exit 1
fi

echo "Target file: $TARGET"
if [[ ! -f "$TARGET" ]]; then
  echo "ERROR: Target path exists in git but file not found on disk: $TARGET"
  exit 1
fi

# 3) Backup
STAMP="$(date +%Y%m%d_%H%M%S)"
cp -a "$TARGET" "$TARGET.bak.$STAMP"
echo "Backup: $TARGET.bak.$STAMP"

# 4) Ensure Link import
perl -0777 -i -pe '
  my $has = ($_ =~ /^\s*import\s+Link\s+from\s+["\x27]next\/link["\x27]\s*;?/m);
  if (!$has) {
    if ($_ =~ /^\s*["\x27]use client["\x27]\s*;?\s*$/m) {
      $_ =~ s/^(\s*["\x27]use client["\x27]\s*;?\s*\n)/$1import Link from "next\/link";\n/m;
    } else {
      $_ = "import Link from \"next\/link\";\n" . $_;
    }
  }
' "$TARGET"

# 5) Replace the broken Link area with known-good JSX
perl -0777 -i -pe '
  my $replacement = <<'"'"'JSX'"'"';
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
            </div>
JSX

  my $pattern = qr{
    <Link\b[\s\S]*?>\s*Item\s+Bank\s*<\/Link>\s*
    <Link\b[\s\S]*?href\s*=\s*["\x27]\/teacher\/builder["\x27][\s\S]*?>[\s\S]*?<\/Link>
  }x;

  if ($_ =~ $pattern) {
    $_ =~ s/$pattern/$replacement/s;
  } else {
    # If pattern didn't match, we DO NOT silently succeed.
    die "Could not locate the expected <Link> Item Bank + Builder block to replace.\n";
  }
' "$TARGET"

echo "Patch applied successfully."
echo ""
echo "Next steps:"
echo "  1) Run your dev/build again."
echo "  2) If it still fails, the issue is ABOVE this block (an unclosed tag/quote)."
