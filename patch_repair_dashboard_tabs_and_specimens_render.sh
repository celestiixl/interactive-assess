#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Can't find $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text(encoding="utf-8")

# 1) Ensure client component
if not s.lstrip().startswith('"use client"') and not s.lstrip().startswith("'use client'"):
  s = '"use client";\n\n' + s

# 2) Ensure useState import
if "useState" not in s:
  if re.search(r'import\s+\{\s*[^}]*\}\s+from\s+["\']react["\']', s):
    s = re.sub(
      r'import\s+\{\s*([^}]*)\}\s+from\s+["\']react["\']',
      lambda m: f'import {{ {m.group(1).strip()}, useState }} from "react";',
      s,
      count=1
    )
  else:
    s = re.sub(r'(^import .*?\n)', r'\1import { useState } from "react";\n', s, count=1, flags=re.M)

# 3) Ensure SpecimenGrid import exists
if "SpecimenGrid" not in s:
  # insert after MasteryDonut import if possible, else after first import
  if "MasteryDonut" in s:
    s = re.sub(r'(import .*MasteryDonut.*\n)', r'\1import SpecimenGrid from "@/components/student/SpecimenGrid";\n', s, count=1)
  else:
    s = re.sub(r'(^import .*?\n)', r'\1import SpecimenGrid from "@/components/student/SpecimenGrid";\n', s, count=1, flags=re.M)

# 4) Ensure tab state
if 'const [tab, setTab]' not in s:
  s = re.sub(
    r'(export default function StudentDashboard\(\)\s*\{\s*)',
    r'\1\n  const [tab, setTab] = useState<"overview" | "specimens">("overview");\n',
    s,
    count=1,
    flags=re.S
  )

# 5) Replace any existing tab UI block with a known-good one
tab_ui = """
      <div className="mt-3 mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTab("overview")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            tab === "overview" ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-50"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setTab("specimens")}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            tab === "specimens" ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-50"
          }`}
        >
          Specimens
        </button>
      </div>
"""

# remove old tab buttons if present
s = re.sub(r'\s*<div className="mb-4 flex items-center gap-2">[\s\S]*?</div>\s*', "\n", s, count=1)
s = re.sub(r'\s*<div className="mt-3 mb-4 flex items-center gap-2">[\s\S]*?</div>\s*', "\n", s, count=1)

# insert tabs right after "segments passed" line if present, else before MasteryDonut
if "segments passed" in s:
  s = re.sub(
    r'(<div className="text-xs text-slate-500">segments passed: \{segments\.length\}</div>\s*)',
    r'\1' + tab_ui,
    s,
    count=1
  )
else:
  s = re.sub(r'(\s*<MasteryDonut\s+segments=\{segments\}\s*/>)', tab_ui + r'\1', s, count=1)

# 6) Ensure MasteryDonut is only rendered on overview
# Normalize any previous conditional versions back to a clean conditional wrapper.
s = re.sub(r'\{tab\s*===\s*"overview"\s*\?\s*\(\s*(<MasteryDonut[\s\S]*?/>)\s*\)\s*:\s*null\s*\}', r'{tab === "overview" ? (\1) : null}', s, count=1)
if "{tab === \"overview\"" not in s:
  s = re.sub(r'(<MasteryDonut\s+segments=\{segments\}\s*/>)', r'{tab === "overview" ? (\1) : null}', s, count=1)

# 7) Remove any stray SpecimenGrid render outside the tab
s = re.sub(r'\n\s*<SpecimenGrid\s+segments=\{segments\}\s*/>\s*\n', "\n", s)

# 8) Ensure specimens tab content exists INSIDE the big first card section
spec_block = """
      {tab === "specimens" ? (
        <div className="mt-4 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-3 text-sm font-semibold text-slate-900">Specimens</div>
          <div className="mb-4 text-sm text-slate-600">
            Collect organisms by mastering TEKS segments (75%+ unlock).
          </div>
          <SpecimenGrid segments={segments} />
        </div>
      ) : null}
"""

if "tab === \"specimens\"" not in s:
  # insert before the closing </section> of the FIRST big card
  s = re.sub(
    r'(\n\s*</section>\s*\n)',
    "\n" + spec_block + r"\1",
    s,
    count=1
  )
else:
  # if it exists somewhere but grid is missing, force the SpecimenGrid line back in
  if "<SpecimenGrid" not in s:
    s = re.sub(r'(tab === "specimens"[^\n]*\?\s*\(\s*<div[^>]*>[\s\S]*?)(</div>\s*\)\s*:\s*null\})',
               r'\1\n          <SpecimenGrid segments={segments} />\n        \2', s, count=1)

p.write_text(s, encoding="utf-8")
print("✅ Repaired tabs + specimens rendering.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
