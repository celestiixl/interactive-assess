#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

APPSHELL="apps/web/src/components/ia/AppShell.tsx"
[ -f "$APPSHELL" ] || { echo "❌ Missing AppShell"; exit 1; }

cp "$APPSHELL" "${APPSHELL}.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<'PY'
from pathlib import Path
p = Path("apps/web/src/components/ia/AppShell.tsx")
t = p.read_text()

import re

# replace outer layout wrapper
t = re.sub(
    r'return\s*\([\s\S]*?<main',
    '''
return (
  <div className="min-h-dvh ia-bg relative">
    <div className="absolute inset-0 ia-grid pointer-events-none"></div>

    <div className="relative z-10 px-6 pt-8 pb-16">
      <div className="mx-auto max-w-[1400px]">
        <main
''',
    t,
    count=1
)

# replace closing main/container
t = re.sub(
    r'</main>\s*\)\s*;',
    '''
        </main>
      </div>
    </div>
  </div>
);
''',
    t,
    count=1
)

p.write_text(t)
print("✅ AppShell now uses dashboard layout")
PY

echo "Restart dev server:"
echo "pnpm -C apps/web dev"
