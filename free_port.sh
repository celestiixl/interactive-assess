#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-3002}"

echo "== Freeing port $PORT =="

# 1) Try fuser first (usually installed)
if command -v fuser >/dev/null 2>&1; then
  echo "-> fuser -k ${PORT}/tcp"
  fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
fi

# 2) Use ss to find any remaining PIDs and kill -9
if command -v ss >/dev/null 2>&1; then
  PIDS="$(ss -lptn "sport = :$PORT" 2>/dev/null | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u)"
  if [[ -n "${PIDS:-}" ]]; then
    echo "-> ss found pid(s): $PIDS"
    for pid in $PIDS; do
      kill -9 "$pid" 2>/dev/null || true
    done
  fi
fi

# 3) Verify
if command -v ss >/dev/null 2>&1; then
  if ss -lptn "sport = :$PORT" 2>/dev/null | tail -n +2 | grep -q .; then
    echo "⚠️ Still something on port $PORT:"
    ss -lptn "sport = :$PORT" || true
    exit 1
  fi
fi

echo "✅ Port $PORT should be free."
