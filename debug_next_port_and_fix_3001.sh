#!/usr/bin/env bash
set -euo pipefail

echo "🔎 Finding next-server process…"
PID="$(ps aux | rg "next-server \\(v" | awk '{print $2}' | head -n 1 || true)"

if [[ -z "${PID}" ]]; then
  echo "❌ next-server not running."
  echo "Start it with: pnpm dev:web"
  exit 1
fi

echo "✅ next-server PID: $PID"
echo

echo "🔎 Checking which port that PID is listening on…"
# Show listening sockets for this process
ss -ltnp 2>/dev/null | rg "pid=${PID}," || true

echo
PORT="$(ss -ltnp 2>/dev/null | rg "pid=${PID}," | sed -n 's/.*:\([0-9]\+\)\s.*/\1/p' | head -n 1 || true)"

if [[ -z "${PORT}" ]]; then
  echo "⚠️ Could not parse port from ss output above."
  echo "Look at the LISTEN line and use that port in your URL."
  exit 0
fi

echo "✅ Next is listening on port: $PORT"
echo
echo "➡️ Use THIS URL format:"
echo "https://<your-codespace>-${PORT}.app.github.dev/student/dashboard"
echo
if [[ "$PORT" != "3001" ]]; then
  echo "ℹ️ You are currently opening -3001, but Next is on -${PORT}."
  echo
  echo "If you want to FORCE Next to run on 3001:"
  echo "1) Stop dev server (Ctrl+C)"
  echo "2) Restart with:"
  echo "   PORT=3001 pnpm dev:web"
fi
