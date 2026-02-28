#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
BASE="http://127.0.0.1:${PORT}"

echo "🔎 Checking dev server..."
curl -sS -I --max-time 3 "$BASE/" | sed -n '1,10p' || {
  echo "❌ Server not responding on $BASE"
  echo "   Is pnpm dev:web running?"
  exit 1
}

echo
echo "🔎 Checking /student/dashboard (headers)..."
curl -sS -I --max-time 5 "$BASE/student/dashboard" | sed -n '1,20p' || true

echo
echo "🔁 Following redirects (if any) for /student/dashboard..."
# -L follows redirects, --max-redirs prevents infinite loops, -v prints Location headers
curl -sS -L -v --max-redirs 10 --max-time 10 "$BASE/student/dashboard" -o /dev/null 2>&1 \
  | rg -n "HTTP/|location:" || true

echo
echo "⏱️ Testing if the HTML request hangs (10s timeout)..."
if curl -sS --max-time 10 "$BASE/student/dashboard" -o /tmp/dashboard.html; then
  echo "✅ Got HTML response (first 5 lines):"
  head -n 5 /tmp/dashboard.html
else
  echo "❌ Request timed out or failed — likely a hanging server render or API call."
fi

echo
echo "🔎 Checking for middleware (common redirect-loop source)..."
if [[ -f apps/web/src/middleware.ts || -f apps/web/middleware.ts ]]; then
  echo "✅ middleware file exists:"
  ls -la apps/web/src/middleware.ts apps/web/middleware.ts 2>/dev/null || true
else
  echo "ℹ️ No middleware.ts found in common locations."
fi

echo
echo "✅ Done."
echo "Paste the output here."
