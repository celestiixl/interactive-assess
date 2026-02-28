#!/usr/bin/env bash
set -euo pipefail

FILE=$(rg -l "export default function SpecimenGrid" apps/web/src | head -n 1)
if [ -z "$FILE" ]; then
  echo "❌ SpecimenGrid not found"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re, os

# find file dynamically
import subprocess
f = subprocess.check_output("rg -l 'export default function SpecimenGrid' apps/web/src | head -n 1", shell=True).decode().strip()
p = Path(f)
s = p.read_text()

# organism mapping block
mapping = """
const ORGANISMS = [
  { match: "cell", name: "Amoeba", icon: "🦠" },
  { match: "photosynthesis", name: "Elodea", icon: "🌿" },
  { match: "genetic", name: "Fruit Fly", icon: "🪰" },
  { match: "selection", name: "Finch", icon: "🐦" },
  { match: "ecosystem", name: "Wolf", icon: "🐺" },
  { match: "energy", name: "Mushroom", icon: "🍄" },
];
"""

if "ORGANISMS" not in s:
    s = s.replace("{ segments }: Props)", "{ segments }: Props)\n" + mapping)

# replace return body (safe: insert grid after opening div)
grid = """
  const unlocked = segments.map(seg => {
    const found = ORGANISMS.find(o => seg.label.toLowerCase().includes(o.match));
    return {
      ...seg,
      organism: found ?? { name: "Unknown organism", icon: "❔" },
      unlocked: (seg.value ?? 0) >= 0.75
    };
  });

  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {unlocked.map((s,i)=>(
        <div key={i} className={`rounded-xl border p-3 text-center transition ${
          s.unlocked ? "bg-white shadow-sm" : "bg-slate-100 opacity-40"
        }`}>
          <div className="text-3xl">{s.organism.icon}</div>
          <div className="text-sm font-semibold mt-1">{s.organism.name}</div>
          <div className="text-xs text-slate-500">{Math.round((s.value??0)*100)}%</div>
        </div>
      ))}
    </div>
  );
"""

# replace everything inside function after first return
s = re.sub(r'return\s*\([\s\S]*?\);\s*}', grid + "\n}", s, count=1)

p.write_text(s)
print("patched", f)
PY

echo "Restart:"
echo "pnpm dev:web"
