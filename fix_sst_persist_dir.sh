#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

echo "🔎 Looking for env/config that might define a persistence directory…"

# Collect candidate files
FILES=()
for f in .env .env.local .env.development .env.development.local apps/web/.env.local apps/web/.env.development.local; do
  [[ -f "$f" ]] && FILES+=("$f")
done

# Print candidate variables if present
if [[ ${#FILES[@]} -gt 0 ]]; then
  echo "✅ Found env file(s):"
  printf " - %s\n" "${FILES[@]}"
  echo
  echo "📌 Possible persistence vars (showing matches):"
  rg -n '(DATA|DB|DATABASE|KV|CACHE|PERSIST|ROCKS|LEVEL|LMDB|SQLITE).*=' "${FILES[@]}" || true
else
  echo "⚠️ No .env* files found in common locations."
fi

echo
echo "🧱 Creating common persistence directories…"
mkdir -p \
  "$REPO/.data" \
  "$REPO/.data/db" \
  "$REPO/.data/kv" \
  "$REPO/apps/web/.data" \
  "$REPO/apps/web/.data/db" \
  "$REPO/apps/web/.data/kv" \
  "$REPO/data" \
  "$REPO/apps/web/data" \
  "$REPO/.cache" \
  "$REPO/apps/web/.cache"

echo "✅ Common dirs created."

echo
echo "🧭 If your env files define a path, creating those too (best-effort)…"
# Extract right-hand side values that look like paths and mkdir -p them
if [[ ${#FILES[@]} -gt 0 ]]; then
  while IFS= read -r line; do
    # Strip comments
    line="${line%%#*}"
    [[ "$line" =~ = ]] || continue
    val="${line#*=}"
    # Remove quotes
    val="${val%\"}"; val="${val#\"}"
    val="${val%\'}"; val="${val#\'}"
    # Skip empties and URLs
    [[ -z "$val" ]] && continue
    [[ "$val" =~ ^https?:// ]] && continue
    [[ "$val" =~ ^postgres://|^mysql://|^mongodb:// ]] && continue

    # If it looks like a relative/absolute path, create its parent dir
    if [[ "$val" == /* || "$val" == ./* || "$val" == ../* || "$val" == *"/"* ]]; then
      # If it's a file path, mkdir its parent; if it's a dir, mkdir it
      parent="$val"
      if [[ "$val" == *"."* && "$val" != */ ]]; then
        parent="$(dirname "$val")"
      fi
      mkdir -p "$parent" 2>/dev/null || true
      echo " - ensured: $parent"
    fi
  done < <(cat "${FILES[@]}" 2>/dev/null || true)
fi

echo
echo "✅ Done."
echo
echo "Next:"
echo "1) Stop dev server (Ctrl+C)"
echo "2) Restart: pnpm -C apps/web dev"
