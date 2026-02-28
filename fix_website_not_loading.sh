#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

echo "🧭 1) Show running Next/pnpm processes"
ps aux | rg "next dev|pnpm dev|next-server" || true
echo

echo "🧭 2) Show listening ports (expect 3000 or similar)"
# ss is usually present in codespaces
ss -ltnp 2>/dev/null | rg ":(3000|3001|3002|4000|5000)\b" || true
echo

echo "🧹 3) Clear Next cache (common cause of 'won’t load')"
rm -rf apps/web/.next .next || true
echo "✅ cache cleared"
echo

echo "🧱 4) Ensure persistence dirs exist (prevents .sst No such file errors)"
mkdir -p "$REPO/.data/db" "$REPO/.data/kv" "$REPO/apps/web/.data/db" "$REPO/apps/web/.data/kv"
echo "✅ created .data dirs"
echo

echo "📝 5) Ensure apps/web/.env.local has safe data paths (harmless if unused)"
ENV_FILE="apps/web/.env.local"
touch "$ENV_FILE"

append_if_missing () {
  local key="$1"
  local val="$2"
  if ! rg -q "^${key}=" "$ENV_FILE"; then
    echo "${key}=${val}" >> "$ENV_FILE"
    echo " + ${key}=${val}"
  fi
}

append_if_missing "PERSIST_DIR" "$REPO/.data"
append_if_missing "DB_DIR" "$REPO/.data/db"
append_if_missing "KV_DIR" "$REPO/.data/kv"
append_if_missing "ROCKSDB_PATH" "$REPO/.data/db"
append_if_missing "LEVELDB_PATH" "$REPO/.data/db"
append_if_missing "SLED_PATH" "$REPO/.data/db"
echo

echo "🧭 6) Run a clean dev start for web (in foreground)"
echo "   If this errors, COPY/PASTE the output back here."
echo
echo "➡️ Running: pnpm dev:web"
pnpm dev:web
