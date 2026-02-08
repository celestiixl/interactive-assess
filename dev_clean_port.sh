#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

BASE="${1:-3010}"
PORT="$BASE"

is_free () {
  ! lsof -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

while ! is_free "$PORT"; do
  PORT=$((PORT+1))
done

echo "✅ Using free port: $PORT"
PORT="$PORT" pnpm --filter web dev
