#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

echo "🔎 Searching for likely persistence/DB libs in the repo..."
rg -n --hidden -S "(rocksdb|leveldb|leveldown|classic-level|abstract-level|better-sqlite3|sqlite|sled|lmdb|kv|sst)" \
  apps/web package.json pnpm-lock.yaml 2>/dev/null | head -n 120 || true

echo
echo "🧱 Creating a safe writable data directory inside the repo..."
mkdir -p "$REPO/.data/kv" "$REPO/.data/db" "$REPO/apps/web/.data/kv" "$REPO/apps/web/.data/db"

echo "✅ Created:"
echo " - $REPO/.data/kv"
echo " - $REPO/.data/db"
echo " - $REPO/apps/web/.data/kv"
echo " - $REPO/apps/web/.data/db"

echo
echo "📝 Ensuring apps/web/.env.local sets common persistence directory env vars..."
ENV_FILE="apps/web/.env.local"
touch "$ENV_FILE"

append_if_missing () {
  local key="$1"
  local val="$2"
  if ! rg -q "^${key}=" "$ENV_FILE"; then
    echo "${key}=${val}" >> "$ENV_FILE"
    echo " + added ${key}=${val}"
  else
    echo " = kept existing ${key} (already set)"
  fi
}

# Use repo-root anchored paths so they always exist in Codespaces
append_if_missing "PERSIST_DIR" "$REPO/.data"
append_if_missing "DATA_DIR" "$REPO/.data"
append_if_missing "DB_DIR" "$REPO/.data/db"
append_if_missing "DB_PATH" "$REPO/.data/db"
append_if_missing "KV_DIR" "$REPO/.data/kv"
append_if_missing "KV_PATH" "$REPO/.data/kv"
append_if_missing "SLED_PATH" "$REPO/.data/db"
append_if_missing "ROCKSDB_PATH" "$REPO/.data/db"
append_if_missing "LEVELDB_PATH" "$REPO/.data/db"
append_if_missing "CACHE_DIR" "$REPO/.data/cache"

echo
echo "🧹 Clearing Next caches to force refresh..."
rm -rf apps/web/.next .next 2>/dev/null || true

echo
echo "✅ Done."
echo
echo "NEXT STEPS:"
echo "1) Stop dev server (Ctrl+C) in the terminal running pnpm dev:web"
echo "2) Restart: pnpm dev:web"
echo
echo "If the .sst error still happens:"
echo "Run: rg -n --hidden -S \"PERSIST_DIR|DATA_DIR|DB_DIR|DB_PATH|SLED_PATH|ROCKSDB|LEVELDB\" apps/web -n"
echo "and paste the output + the full error block."
