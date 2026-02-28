#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

echo "🛑 Stopping any running next dev processes (best effort)…"
# This kills next dev started under apps/web
pkill -f "next dev" 2>/dev/null || true
pkill -f "pnpm --filter web dev" 2>/dev/null || true
pkill -f "pnpm dev:web" 2>/dev/null || true

echo "🧹 Clearing Next caches…"
rm -rf apps/web/.next .next || true

echo "✅ Starting Next on port 3001…"
echo "If this starts, open:"
echo "https://<your-codespace>-3001.app.github.dev/student/dashboard"
echo
PORT=3001 pnpm dev:web
