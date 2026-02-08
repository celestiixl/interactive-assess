#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

# 1) delete non-(app) teacher route tree (you already did, but ensure it's gone)
rm -rf apps/web/src/app/teacher || true

# 2) ensure ONLY (app) layout wraps the shell
mkdir -p apps/web/src/app/(app)
cat > apps/web/src/app/(app)/layout.tsx <<'LAY'
import { ActiveShell } from "@/components/ia/ActiveShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ActiveShell>{children}</ActiveShell>;
}
LAY

# 3) strip any remaining <AppShell ...> wrappers inside (app) pages
PAGES=(
  "apps/web/src/app/(app)/assessment/page.tsx"
  "apps/web/src/app/(app)/practice/page.tsx"
  "apps/web/src/app/(app)/teacher/dashboard/page.tsx"
  "apps/web/src/app/(app)/teacher/builder/page.tsx"
)

ts="$(date +%Y%m%d_%H%M%S)"
for f in "${PAGES[@]}"; do
  [[ -f "$f" ]] || continue
  cp -a "$f" "$f.bak.$ts"

  # remove AppShell import
  perl -0777 -i -pe '
    s/^\s*import\s+\{\s*AppShell\s*\}\s+from\s+["'\''][^"'\''\n]*AppShell["'\''];\s*\n//mg;
  ' "$f"

  # remove any <AppShell ...> and </AppShell>
  perl -0777 -i -pe '
    s/<AppShell\b[^>]*>\s*//sg;
    s/\s*<\/AppShell>\s*//sg;
  ' "$f"
done

# 4) verify no AppShell usage remains under (app)
echo "== remaining AppShell refs under (app) =="
rg 'AppShell|<AppShell' apps/web/src/app/(app) -n || echo "✅ none"

