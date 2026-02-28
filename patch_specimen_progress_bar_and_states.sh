#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Can't find $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/SpecimenGrid.tsx")
s = p.read_text(encoding="utf-8")

# Insert a small helper for visual state (once)
if "function getState" not in s:
  s = s.replace(
    "function pickOrganism(label: string) {",
    """function getState(v01: number) {
  if (v01 >= 0.75) return "unlocked";
  if (v01 >= 0.40) return "growing";
  return "locked";
}

function pickOrganism(label: string) {"""
  )

# Replace the card rendering block to include progress bar + 3 states
# We'll locate the JSX for the card and replace just the className and inner layout.
pattern = r'className=\{`rounded-2xl border p-3 text-center transition \$\{\s*[\s\S]*?\s*\}`\}'
replacement = 'className={`rounded-2xl border p-4 text-center transition ' \
              '${s.unlocked ? "bg-white shadow-sm ring-2 ring-cyan-200/60" : ' \
              's.pct >= 40 ? "bg-white/80 shadow-sm" : "bg-slate-50 opacity-60"} ' \
              'hover:shadow-md`}'

s, n = re.subn(pattern, replacement, s, count=1)
if n == 0:
  # fallback: if previous class differs slightly
  s = re.sub(
    r'className=\{`rounded-2xl border p-3 text-center transition \$\{[^}]*\}`\}',
    replacement,
    s,
    count=1
  )

# Replace the inner content of each card to add a progress bar.
# We'll swap the chunk starting at the icon div through the pct div.
s = re.sub(
  r'<div className="text-3xl">\{s\.organism\.icon\}</div>\s*<div className="mt-1 text-sm font-semibold text-slate-900">\{s\.organism\.name\}</div>\s*<div className="text-xs text-slate-500">\{s\.pct\}%</div>',
  r'''<div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border ${s.unlocked ? "bg-cyan-50" : s.pct >= 40 ? "bg-white" : "bg-slate-100"}`}>
              <span className="text-3xl">{s.organism.icon}</span>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{s.organism.name}</div>
            <div className="mt-1 text-xs text-slate-500">{s.pct}%</div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${s.unlocked ? "bg-cyan-400" : s.pct >= 40 ? "bg-slate-500" : "bg-slate-400"}`}
                style={{ width: `${Math.max(0, Math.min(100, s.pct))}%` }}
              />
            </div>

            <div className={`mt-2 text-xs font-semibold ${s.unlocked ? "text-cyan-700" : s.pct >= 40 ? "text-slate-700" : "text-slate-500"}`}>
              {s.unlocked ? "Unlocked" : s.pct >= 40 ? "Growing" : "Locked"}
            </div>''',
  s,
  count=1,
  flags=re.S
)

p.write_text(s, encoding="utf-8")
print("✅ Added progress bar + locked/growing/unlocked states.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
