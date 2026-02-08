#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1

BUILDER="apps/web/src/app/teacher/builder/page.tsx"

STAMP="$(date +%Y%m%d_%H%M%S)"
cp "$BUILDER" "$BUILDER.bak_practice_mode_$STAMP"

echo "== patching Practice Mode routing =="

python3 - <<'PY'
from pathlib import Path
p = Path("apps/web/src/app/teacher/builder/page.tsx")
src = p.read_text()

if "Practice Mode" in src and "router.push" in src:
    print("⚠️ Practice Mode already exists, not duplicating")
    exit(0)

insert = """
            <button
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              type="button"
              onClick={() => {
                const rc = inferReportingCategoryFromTeks(primaryTeks);
                window.location.href = `/practice?rc=${encodeURIComponent(rc)}`;
              }}
            >
              Practice Mode
            </button>
"""

# place next to Copy JSON button
src = src.replace(
    "</button>\n            <button",
    "</button>\n" + insert + "\n            <button"
)

p.write_text(src)
print("✅ Practice Mode button wired to /practice?rc=")
PY

echo "== done =="
echo "Restart dev server"
