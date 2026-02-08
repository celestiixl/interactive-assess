#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

PORT="${1:-3002}"

echo "== killing anything on port $PORT =="
(lsof -ti tcp:$PORT | xargs -r kill -9) 2>/dev/null || true
(fuser -k ${PORT}/tcp) 2>/dev/null || true

echo "== clearing Next cache =="
rm -rf apps/web/.next || true

echo "== start dev server =="
HOSTNAME=0.0.0.0 PORT="$PORT" pnpm --filter web dev
