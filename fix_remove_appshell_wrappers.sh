#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1

FILES=(
  "apps/web/src/app/(app)/assessment/page.tsx"
  "apps/web/src/app/(app)/practice/page.tsx"
  "apps/web/src/app/(app)/teacher/dashboard/page.tsx"
)

ts="$(date +%Y%m%d_%H%M%S)"

echo "== backups =="
for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    cp -a "$f" "$f.bak.$ts"
    echo "✅ $f -> $f.bak.$ts"
  else
    echo "⚠️ missing: $f"
  fi
done

echo "== ensure group layout wraps once =="
mkdir -p apps/web/src/app/(app)
cat > apps/web/src/app/(app)/layout.tsx <<'LAY'
import { ActiveShell } from "@/components/ia/ActiveShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ActiveShell>{children}</ActiveShell>;
}
LAY
echo "✅ wrote apps/web/src/app/(app)/layout.tsx"

echo "== strip AppShell from pages (they must NOT wrap themselves) =="

for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || continue

  # remove AppShell import (handles different quote styles)
  perl -0777 -i -pe '
    s/^\s*import\s+\{\s*AppShell\s*\}\s+from\s+["'\''][^"'\''\n]*AppShell["'\''];\s*\n//mg;
  ' "$f"

  # remove opening + closing AppShell tags (multi-line safe)
  perl -0777 -i -pe '
    s/<AppShell\b[^>]*>\s*//sg;
    s/\s*<\/AppShell>\s*//sg;
  ' "$f"

  echo "✅ patched $f"
done

echo "== verify no AppShell imports/wrappers remain in app pages =="
rg 'import\s+\{\s*AppShell\s*\}' apps/web/src/app -n || echo "✅ no AppShell imports in app/"
rg '<AppShell\b' apps/web/src/app -n || echo "✅ no AppShell tags in app/"
