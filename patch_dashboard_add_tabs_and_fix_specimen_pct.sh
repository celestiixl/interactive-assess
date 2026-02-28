#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO"

DASH="apps/web/src/app/(app)/student/dashboard/page.tsx"
SPEC="apps/web/src/components/student/SpecimenGrid.tsx"

if [ ! -f "$DASH" ]; then
  echo "❌ Can't find $DASH"
  exit 1
fi
if [ ! -f "$SPEC" ]; then
  echo "❌ Can't find $SPEC"
  exit 1
fi

cp "$DASH" "$DASH.bak.$(date +%s)"
cp "$SPEC" "$SPEC.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

dash = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = dash.read_text(encoding="utf-8")

# 1) Ensure this page is a client component (tabs need state)
if not s.lstrip().startswith('"use client"') and not s.lstrip().startswith("'use client'"):
  s = '"use client";\n\n' + s

# 2) Ensure React useState import exists
if "useState" not in s:
  # If there's a react import, add useState to it; otherwise add a new import.
  if re.search(r'import\s+\*\s+as\s+React\s+from\s+["\']react["\']', s):
    # rare case
    pass
  elif re.search(r'import\s+\{\s*[^}]*\}\s+from\s+["\']react["\']', s):
    s = re.sub(r'import\s+\{\s*([^}]*)\}\s+from\s+["\']react["\']',
               lambda m: f'import {{ {m.group(1).strip()}, useState }} from "react"',
               s, count=1)
  else:
    # add after first import line
    s = re.sub(r'(^import .*?\n)', r'\1import { useState } from "react";\n', s, count=1, flags=re.M)

# 3) Add tab state inside StudentDashboard function
if "const [tab, setTab]" not in s:
  s = re.sub(
    r'(export default function StudentDashboard\(\)\s*\{\s*)',
    r'\1\n  const [tab, setTab] = useState<"overview" | "specimens">("overview");\n',
    s,
    count=1,
    flags=re.S
  )

# 4) Remove the inline <SpecimenGrid ... /> from the main section (we’ll render it in a separate tab)
s = re.sub(r'\n\s*<SpecimenGrid\s+segments=\{segments\}\s*/>\s*\n', "\n", s, count=1)

# 5) Insert tab buttons near the top of the big dashboard card.
# We’ll place it right after the "segments passed" line if present; otherwise after the biome banner block.
tab_ui = r"""
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setTab("overview")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            tab === "overview" ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab("specimens")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            tab === "specimens" ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          }`}
        >
          Specimens
        </button>
      </div>
"""

if "Overview" not in s or "Specimens" not in s or "setTab(" not in s:
  if "segments passed" in s:
    s = re.sub(r'(<div className="text-xs text-slate-500">segments passed: \{segments\.length\}</div>\s*)',
               r'\1' + tab_ui, s, count=1)
  else:
    # fallback: insert before MasteryDonut
    s = re.sub(r'(\s*<MasteryDonut\s+segments=\{segments\}\s*/>\s*)',
               tab_ui + r'\1', s, count=1)

# 6) Wrap the donut + hover text in tab === "overview"
# We’ll wrap the first MasteryDonut block and its nearby helper text by adding a conditional container around it.
# Minimal: conditionally render MasteryDonut itself and keep layout stable.
s = re.sub(
  r'(<MasteryDonut\s+segments=\{segments\}\s*/>)',
  r'{tab === "overview" ? (\1) : null}',
  s,
  count=1
)

# 7) Add the Specimens tab content near the end of the big main card section.
# Insert before the closing </section> of the main card if we can find it.
if "tab === \"specimens\"" not in s:
  s = re.sub(
    r'(\s*</section>\s*\n\s*<section className="grid gap-4 md:grid-cols-3">)',
    r"""
      {tab === "specimens" ? (
        <div className="mt-4 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="text-sm text-slate-600">Collect organisms by mastering TEKS segments (75%+ unlock).</div>
          <SpecimenGrid segments={segments} />
        </div>
      ) : null}

\1""",
    s,
    count=1,
    flags=re.S
  )

dash.write_text(s, encoding="utf-8")
print("✅ Dashboard tabs added + Specimens moved to its own tab.")
PY

python - <<'PY'
from pathlib import Path
import re

spec = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = spec.read_text(encoding="utf-8")

# Normalize segment value so it works whether input is 0..1 or 0..100
if "function normValue" not in s:
  s = s.replace(
    "function pickOrganism(label: string) {",
    """function normValue(v: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  // if value looks like a percent (e.g., 51), convert to 0..1
  return n > 1 ? n / 100 : n;
}

function pickOrganism(label: string) {"""
  )

# Update unlocked + pct calculation to use normValue
s = re.sub(
  r'unlocked:\s*\(Number\(seg\.value\)\s*\|\|\s*0\)\s*>=\s*0\.75,',
  'unlocked: normValue(seg.value) >= 0.75,',
  s
)
s = re.sub(
  r'pct:\s*Math\.round\(\(Number\(seg\.value\)\s*\|\|\s*0\)\s*\*\s*100\),',
  'pct: Math.round(normValue(seg.value) * 100),',
  s
)

spec.write_text(s, encoding="utf-8")
print("✅ SpecimenGrid percent/unlock normalized.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
