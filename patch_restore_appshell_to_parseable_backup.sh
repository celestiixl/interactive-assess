#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found"; exit 1; }

APPSHELL="apps/web/src/components/ia/AppShell.tsx"
[ -f "$APPSHELL" ] || { echo "❌ Missing: $APPSHELL"; exit 1; }

echo "🧷 Saving current broken file..."
cp "$APPSHELL" "${APPSHELL}.broken.$(date +%Y%m%d_%H%M%S)"

echo "🔎 Looking for parseable backups..."
mapfile -t CANDIDATES < <(ls -1t "${APPSHELL}.bak."* 2>/dev/null || true)

if [ "${#CANDIDATES[@]}" -eq 0 ]; then
  echo "❌ No backups found at ${APPSHELL}.bak.*"
  echo "   (We can still rebuild AppShell from scratch, but this is the fastest path.)"
  exit 1
fi

GOOD=""

# Use TypeScript to transpile (parse) TSX. If this succeeds, the file is syntactically valid.
node -e "require('typescript')" >/dev/null 2>&1 || {
  echo "❌ TypeScript not available in node_modules. Try: pnpm -C apps/web add -D typescript"
  exit 1
}

for f in "${CANDIDATES[@]}"; do
  node - <<NODE >/dev/null 2>&1 || true
const fs = require("fs");
const ts = require("typescript");
const file = ${f@Q};
const src = fs.readFileSync(file, "utf8");
try {
  ts.transpileModule(src, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
    fileName: "AppShell.tsx",
  });
  process.exit(0);
} catch (e) {
  process.exit(1);
}
NODE
  if [ $? -eq 0 ]; then
    GOOD="$f"
    break
  fi
done

if [ -z "$GOOD" ]; then
  echo "❌ None of the backups parsed cleanly."
  echo "➡️ Next step: I’ll generate a clean AppShell.tsx from scratch."
  exit 1
fi

echo "✅ Restoring parseable backup:"
echo "   $GOOD"
cp "$GOOD" "$APPSHELL"

echo "✅ Restored. Now restart dev:"
echo "   pnpm -C apps/web dev"
