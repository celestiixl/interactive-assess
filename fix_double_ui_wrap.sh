#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Files that currently wrap themselves in <AppShell> ... </AppShell>
FILES=(
  "apps/web/src/app/(app)/assessment/page.tsx"
  "apps/web/src/app/(app)/practice/page.tsx"
  "apps/web/src/app/(app)/teacher/dashboard/page.tsx"
)

echo "== backups =="
ts="$(date +%Y%m%d_%H%M%S)"
for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    cp -a "$f" "$f.bak.$ts"
    echo "✅ backed up $f -> $f.bak.$ts"
  else
    echo "⚠️ missing $f (skipping)"
  fi
done

echo "== ensure (app) layout uses ActiveShell =="
mkdir -p apps/web/src/app/(app)
cat > apps/web/src/app/(app)/layout.tsx <<'LAY'
import { ActiveShell } from "@/components/ia/ActiveShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ActiveShell>{children}</ActiveShell>;
}
LAY
echo "✅ wrote apps/web/src/app/(app)/layout.tsx"

echo "== remove AppShell wrappers from pages =="
for f in "${FILES[@]}"; do
  [[ -f "$f" ]] || continue

  # 1) remove AppShell import lines
  perl -0777 -i -pe '
    s/^\s*import\s+\{\s*AppShell\s*\}\s+from\s+["'\'']@\/components\/ia\/AppShell["'\''];\s*\n//mg;
    s/^\s*import\s+\{\s*AppShell\s*\}\s+from\s+["'\'']\@\/components\/ia\/AppShell["'\''];\s*\n//mg;
    s/^\s*import\s+\{\s*AppShell\s*\}\s+from\s+["'\''].*AppShell["'\''];\s*\n//mg;
  ' "$f"

  # 2) strip outer <AppShell ...> and </AppShell>
  perl -0777 -i -pe '
    s/<AppShell\b[^>]*>//g;
    s/<\/AppShell>//g;
  ' "$f"

  echo "✅ patched $f"
done

echo "== done. restart dev =="
echo 'pkill -f "next dev" || true'
echo 'pkill -f "turbopack" || true'
echo 'PORT=3002 pnpm --filter web dev'
