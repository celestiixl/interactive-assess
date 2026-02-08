#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

PAGES=(
  "apps/web/src/app/(app)/teacher/dashboard/page.tsx"
  "apps/web/src/app/(app)/teacher/builder/page.tsx"
)

ts="$(date +%Y%m%d_%H%M%S)"
for f in "${PAGES[@]}"; do
  [[ -f "$f" ]] || continue
  cp -a "$f" "$f.bak.$ts"

  # remove import { AppShell ... }
  perl -0777 -i -pe 's/^\s*import\s+\{\s*AppShell\s*\}\s+from\s+["'\''][^"'\''\n]*AppShell["'\''];\s*\n//mg' "$f"

  # remove <AppShell ...> and </AppShell>
  perl -0777 -i -pe 's/<AppShell\b[^>]*>\s*//sg; s/\s*<\/AppShell>\s*//sg' "$f"

  echo "✅ stripped AppShell from $f"
done

echo "== remaining AppShell refs in (app)/teacher =="
rg 'AppShell|<AppShell|@/components/ia/AppShell' apps/web/src/app/(app)/teacher -n || echo "✅ none"
