#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

# Add or remove entries as you like.
# Format: file:line
TARGETS=(
  "apps/web/src/app/(app)/teacher/builder/page.tsx:596"
  "apps/web/src/app/(app)/teacher/builder/page.tsx:602"
  "apps/web/src/app/(app)/teacher/builder/page.tsx:613"
  "apps/web/src/app/(app)/teacher/builder/page.tsx:665"
  "apps/web/src/app/(app)/teacher/builder/page.tsx:679"
  "apps/web/src/app/(app)/teacher/builder/page.tsx:699"
  "apps/web/src/app/(app)/teacher/builder/page.tsx:713"
  "apps/web/src/app/(app)/teacher/builder/page.tsx:722"
  "apps/web/src/app/(app)/teacher/builder/page.tsx:747"

  "apps/web/src/app/(app)/teacher/builder/page.tsx.bak_inline_choice_builder_20260208_002031:704"
  "apps/web/src/app/(app)/teacher/builder/page.tsx.bak_inline_choice_editor_20260208_001159:656"
)

CONTEXT=12

echo "🔎 Showing ±${CONTEXT} lines around each target"
echo

for t in "${TARGETS[@]}"; do
  file="${t%%:*}"
  line="${t##*:}"

  if [ ! -f "$file" ]; then
    echo "⚠️  missing: $file"
    echo
    continue
  fi

  start=$(( line - CONTEXT ))
  end=$(( line + CONTEXT ))
  if [ "$start" -lt 1 ]; then start=1; fi

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📄 $file  (around line $line)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  nl -ba "$file" | sed -n "${start},${end}p"
  echo
done

echo "✅ Done."
