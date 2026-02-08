#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found at /workspaces/interactive-assess"; exit 1; }

# Find app root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router at apps/web/src/app or apps/web/app"
  exit 1
fi

echo "✅ APP_ROOT=$APP_ROOT"

DEFAULT_RC='RC1 • Cell Structure & Function'

# Candidate files where Practice Mode / Open often lives
CANDIDATES=(
  "$APP_ROOT/page.tsx"
  "$APP_ROOT/teacher/dashboard/page.tsx"
  "$APP_ROOT/teacher/builder/page.tsx"
)

STAMP="$(date +%Y%m%d_%H%M%S)"

backup_if_exists () {
  local f="$1"
  if [ -f "$f" ]; then
    cp -v "$f" "$f.bak_practice_open_$STAMP"
  fi
}

patch_file () {
  local f="$1"
  [ -f "$f" ] || return 0

  # Only patch if it even mentions practice
  if ! grep -qi "practice" "$f"; then
    return 0
  fi

  echo ""
  echo "== patching $f =="

  python3 - <<PY
from pathlib import Path
import re

f = Path("$f")
src = f.read_text()

DEFAULT_RC = "$DEFAULT_RC"

changed = False

# 1) router.push("/practice") -> router.push(`/practice?rc=${encodeURIComponent(DEFAULT_RC)}`)
def repl_router(m):
    nonlocal changed
    changed = True
    return f'router.push(`/practice?rc=\${{encodeURIComponent("{DEFAULT_RC}")}}`)'

src2 = re.sub(r'router\.push\(\s*[\'"]\/practice[\'"]\s*\)', repl_router, src)

# 2) window.location.href = "/practice" -> window.location.href = `/practice?rc=${encodeURIComponent(DEFAULT_RC)}`
def repl_loc(m):
    nonlocal changed
    changed = True
    return f'window.location.href = `/practice?rc=\${{encodeURIComponent("{DEFAULT_RC}")}}`'
src2 = re.sub(r'window\.location\.href\s*=\s*[\'"]\/practice[\'"]', repl_loc, src2)

# 3) href="/practice" -> href={"/practice?rc=" + encodeURIComponent(DEFAULT_RC)}
def repl_href(m):
    nonlocal changed
    changed = True
    return f'href={{"/practice?rc=" + encodeURIComponent("{DEFAULT_RC}")}}'
src2 = re.sub(r'href\s*=\s*[\'"]\/practice[\'"]', repl_href, src2)

# 4) If there is a button labeled Open under Practice Mode, force onClick navigate
#    This is heuristic: find <button ...>Open</button> within ~600 chars of "Practice"
if "Practice" in src2 and ">Open<" in src2:
    pattern = re.compile(r'(Practice[\s\S]{0,600}?)(<button[^>]*)(>\\s*Open\\s*<\\/button>)', re.IGNORECASE)
    def repl_open(m):
        nonlocal changed
        block, btnstart, btnend = m.group(1), m.group(2), m.group(3)
        # If already has onClick, skip
        if "onClick=" in btnstart:
            return m.group(0)
        changed = True
        inject = f' onClick={{() => (window.location.href = `/practice?rc=\${{encodeURIComponent("{DEFAULT_RC}")}}`)}}'
        return block + btnstart + inject + btnend
    src2 = pattern.sub(repl_open, src2, count=2)

if changed:
    f.write_text(src2)
    print("✅ updated")
else:
    print("ℹ️ no changes needed")
PY
}

echo "== making backups =="
for f in "${CANDIDATES[@]}"; do
  backup_if_exists "$f"
done

echo "== applying patches =="
for f in "${CANDIDATES[@]}"; do
  patch_file "$f"
done

echo ""
echo "✅ Done. Now restart the dev server."
echo "Run:"
echo "  rm -rf apps/web/.next || true"
echo "  lsof -ti tcp:3002 | xargs -r kill -9 || true"
echo "  HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
