#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

echo "== locate tsconfig used by web =="
ls -la apps/web/tsconfig.json apps/web/tsconfig.* 2>/dev/null || true
ls -la tsconfig.json tsconfig.* 2>/dev/null || true

TSCONFIG=""
if [ -f apps/web/tsconfig.json ]; then
  TSCONFIG="apps/web/tsconfig.json"
elif [ -f tsconfig.json ]; then
  TSCONFIG="tsconfig.json"
else
  echo "❌ no tsconfig.json found"
  exit 1
fi
echo "✅ using $TSCONFIG"

echo "== backup =="
ts="$(date +%Y%m%d_%H%M%S)"
cp -a "$TSCONFIG" "$TSCONFIG.bak.$ts"
echo "✅ $TSCONFIG -> $TSCONFIG.bak.$ts"

echo "== ensure compilerOptions.baseUrl + paths for @/* =="
node - <<'NODE'
const fs = require("fs");
const path = require("path");

const candidates = ["apps/web/tsconfig.json", "tsconfig.json"].filter(p => fs.existsSync(p));
const file = candidates[0];
const raw = fs.readFileSync(file, "utf8");
let json;
try { json = JSON.parse(raw); }
catch (e) { console.error("❌ tsconfig is not valid JSON:", file); process.exit(1); }

json.compilerOptions = json.compilerOptions || {};
json.compilerOptions.baseUrl = json.compilerOptions.baseUrl || ".";

// Figure out where "src" lives relative to this tsconfig
const dir = path.dirname(file);
const hasSrc = fs.existsSync(path.join(dir, "src"));
const srcPath = hasSrc ? "./src/*" : "./apps/web/src/*"; // fallback

json.compilerOptions.paths = json.compilerOptions.paths || {};
json.compilerOptions.paths["@/*"] = [srcPath];

fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
console.log("✅ wrote @/* ->", srcPath, "in", file);
NODE

echo "== show relevant section =="
node - <<'NODE'
const fs = require("fs");
const file = fs.existsSync("apps/web/tsconfig.json") ? "apps/web/tsconfig.json" : "tsconfig.json";
const j = JSON.parse(fs.readFileSync(file,"utf8"));
console.log(JSON.stringify({ compilerOptions: {
  baseUrl: j.compilerOptions?.baseUrl,
  paths: j.compilerOptions?.paths
}}, null, 2));
NODE

echo "== done =="
echo "Now restart dev + reload VSCode TS server if needed."
