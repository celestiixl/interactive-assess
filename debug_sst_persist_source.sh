#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

echo "🔎 1) Searching for the error string INCLUDING ignored/hidden dirs..."
# -uuu = search hidden + ignored + binary-ish; --no-ignore-vcs avoids .gitignore filtering
# limit output
rg -n -uuu --no-ignore-vcs --hidden \
  "Persisting failed|Unable to write SST file|\\.sst" \
  . | head -n 120 || true

echo
echo "🔎 2) Finding any existing .sst files (or partial DB dirs) in the repo..."
find . -type f -name "*.sst" 2>/dev/null | head -n 50 || true

echo
echo "🔎 3) Looking for common embedded DB directories (rocks/level/kv/cache/data)..."
find . -maxdepth 6 -type d \( \
  -iname "*rocks*" -o -iname "*level*" -o -iname "*sled*" -o -iname "*kv*" -o -iname "*db*" -o -iname "*data*" -o -iname "*cache*" \
\) 2>/dev/null | head -n 120 || true

echo
echo "✅ Done."
echo
echo "Next: paste the output of step (1) if it finds a file path."
echo "If it shows a directory path where it tries to write 00000xxx.sst, we’ll mkdir -p that exact directory (or reroute it)."
