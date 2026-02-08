#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

F="apps/web/src/components/ia/ActiveShell.tsx"
ts="$(date +%Y%m%d_%H%M%S)"
cp -a "$F" "$F.bak.$ts"
echo "✅ backup $F -> $F.bak.$ts"

cat > "$F" <<'TSX'
"use client";

export function ActiveShell({ children }: { children: React.ReactNode }) {
  // Single source of truth:
  // Route-group layout wraps this ONCE. ActiveShell should NOT wrap another shell.
  return <>{children}</>;
}
TSX

echo "✅ patched ActiveShell to be passthrough"
echo "== sanity: show file =="
sed -n '1,80p' "$F"
