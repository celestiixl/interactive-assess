#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1

echo "== fix_port_and_restart_dev =="

free_port () {
  local port="$1"
  echo ""
  echo "== free port $port =="
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti "tcp:$port" || true)"
    if [ -n "${pids:-}" ]; then
      echo "Killing PIDs on tcp:$port: $pids"
      # shellcheck disable=SC2086
      kill -9 $pids || true
    else
      echo "Nothing using tcp:$port"
    fi
  elif command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" || true
  else
    echo "❌ Neither lsof nor fuser available to kill the port."
  fi
}

is_free () {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -i "tcp:$port" >/dev/null 2>&1 && return 1 || return 0
  fi
  (echo >/dev/tcp/127.0.0.1/"$port") >/dev/null 2>&1 && return 1 || return 0
}

echo ""
echo "== clean Next cache =="
rm -rf apps/web/.next apps/web/node_modules/.cache .next || true

free_port 3002 || true

PORT=3002
if ! is_free "$PORT"; then
  echo "⚠️ Port 3002 still in use. Searching..."
  for p in 3003 3004 3005 3006 3007 3008; do
    free_port "$p" || true
    if is_free "$p"; then
      PORT="$p"
      break
    fi
  done
fi

echo ""
echo "== starting dev server on port $PORT =="
export HOSTNAME=0.0.0.0
export PORT="$PORT"

pnpm --filter web dev
