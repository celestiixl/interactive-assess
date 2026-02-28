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

# 1) Upgrade biomeHealth helper to include banner styles + a suggested segment key
# Find the return objects and add banner/bgAccent/badge fields.
def add_fields(obj: str, banner: str, accent: str, badge: str):
  # insert before closing }
  return re.sub(r'\}\s*$', f', banner: "{banner}", accent: "{accent}", badge: "{badge}" }}', obj.strip())

pattern = r'return \{ level: "Collapsed".*?\};'
m = re.search(pattern, s, flags=re.S)
if m and 'banner:' not in m.group(0):
  collapsed = re.search(r'return \{[^;]*\};', m.group(0), flags=re.S).group(0)
  s = s.replace(collapsed, add_fields(collapsed[:-1], "bg-gradient-to-r from-neutral-50 to-neutral-100", "bg-neutral-100", "border-neutral-200 text-neutral-800") + ";")

pattern = r'return \{ level: "Recovering".*?\};'
m = re.search(pattern, s, flags=re.S)
if m and 'banner:' not in m.group(0):
  rec = re.search(r'return \{[^;]*\};', m.group(0), flags=re.S).group(0)
  s = s.replace(rec, add_fields(rec[:-1], "bg-gradient-to-r from-amber-50 to-amber-100/60", "bg-amber-50", "border-amber-200 text-amber-900") + ";")

pattern = r'return \{ level: "Stable".*?\};'
m = re.search(pattern, s, flags=re.S)
if m and 'banner:' not in m.group(0):
  st = re.search(r'return \{[^;]*\};', m.group(0), flags=re.S).group(0)
  s = s.replace(st, add_fields(st[:-1], "bg-gradient-to-r from-green-50 to-green-100/60", "bg-green-50", "border-green-200 text-green-900") + ";")

pattern = r'return \{ level: "Thriving".*?\};'
m = re.search(pattern, s, flags=re.S)
if m and 'banner:' not in m.group(0):
  th = re.search(r'return \{[^;]*\};', m.group(0), flags=re.S).group(0)
  s = s.replace(th, add_fields(th[:-1], "bg-gradient-to-r from-cyan-50 to-cyan-100/60", "bg-cyan-50", "border-cyan-200 text-cyan-900") + ";")

# 2) Add "next best segment" logic (lowest value) after biomeHealth const
if "const nextSegment" not in s:
  s = re.sub(
    r"const biomeHealth = getBiomeHealth\(segments\);\s*",
    "const biomeHealth = getBiomeHealth(segments);\n\n  const nextSegment = [...segments].sort((a,b)=> (a.value??0) - (b.value??0))[0];\n",
    s,
    count=1,
    flags=re.S
  )

# 3) Update the banner container class to use biomeHealth.banner
s = re.sub(
  r'<div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-2xl border bg-white/60 p-4">',
  '<div className={`mb-4 flex flex-wrap items-start justify-between gap-3 rounded-2xl border p-4 ${biomeHealth.banner}`}>',
  s,
  count=1
)

# 4) Replace the "Next: raise 1 segment" pill with a dynamic TEKS label (safe even if nextSegment missing)
s = s.replace(
  '<div className="rounded-full border bg-white px-3 py-1 text-sm font-semibold text-slate-800">\n            Next: raise 1 segment\n          </div>',
  '<div className={`rounded-full border px-3 py-1 text-sm font-semibold ${biomeHealth.badge}`}>'
  '{nextSegment ? `Next: practice ${nextSegment.label}` : "Next: practice"}'
  '</div>'
)

p.write_text(s, encoding="utf-8")
print("✅ Biome banner styling + dynamic next action added.")
PY

echo "✅ Done. Restart:"
echo "pnpm dev:web"
