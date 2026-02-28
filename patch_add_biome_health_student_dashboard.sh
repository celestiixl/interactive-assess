#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO"

DASH="apps/web/src/app/(app)/student/dashboard/page.tsx"
if [ ! -f "$DASH" ]; then
  echo "❌ Can't find: $DASH"
  exit 1
fi

echo "✅ Patching $DASH"
cp "$DASH" "$DASH.bak.$(date +%s)"

python - <<'PY'
from pathlib import Path
import re

path = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = path.read_text(encoding="utf-8")

# 1) Add helper functions (once) right after the function header line
if "function getBiomeHealth" not in s:
  s = re.sub(
    r"(export default function StudentDashboard\(\)\s*\{\s*)",
    r"""\1

  // --- Biome health helpers ---
  function clamp01(n: number) {
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function getBiomeHealth(segments: { value: number }[]) {
    const total = segments.reduce((acc, seg) => acc + (Number(seg.value) || 0), 0);
    const avg = segments.length ? total / segments.length : 0; // assumes value is 0..1
    const p = clamp01(avg);

    // 0-25 / 26-50 / 51-75 / 76-100
    if (p < 0.25) return { level: "Collapsed", biome: "Polluted Waters", desc: "Food web is unstable.", pct: Math.round(p * 100), bg: "bg-slate-50" };
    if (p < 0.50) return { level: "Recovering", biome: "Sparse Grassland", desc: "Some stability, gaps remain.", pct: Math.round(p * 100), bg: "bg-slate-50" };
    if (p < 0.75) return { level: "Stable", biome: "Balanced Forest", desc: "Most relationships are solid.", pct: Math.round(p * 100), bg: "bg-slate-50" };
    return { level: "Thriving", biome: "Thriving Reef", desc: "Ecosystem is strong and resilient.", pct: Math.round(p * 100), bg: "bg-slate-50" };
  }
""",
    s,
    count=1,
    flags=re.S
  )

# 2) After the segments declaration (or the first occurrence of "const segments = [")
# inject a derived biomeHealth variable.
if "const biomeHealth = getBiomeHealth(segments);" not in s:
  s = re.sub(
    r"(const\s+segments\s*=\s*\[.*?\];)",
    r"""\1

  const biomeHealth = getBiomeHealth(segments);
""",
    s,
    count=1,
    flags=re.S
  )

# 3) Wrap the main return container with a background class (safe: only if there's a top-level <main or outer <div)
# We'll add a light background to the outermost wrapper that already exists.
# Try to find a top-level <main ...> and add className if missing; otherwise add biomeHealth.bg to existing className.
def add_bg_to_tag(tagname: str, text: str):
  # existing className
  pat = rf"<{tagname}\s+([^>]*?)className=\{{\s*([\"'][^\"']*[\"'])\s*\}}([^>]*)>"
  m = re.search(pat, text, flags=re.S)
  if m:
    before, cls, after = m.group(1), m.group(2), m.group(3)
    # inject biomeHealth.bg
    if "biomeHealth.bg" in cls:
      return text
    new_cls = cls[:-1] + ' + " " + biomeHealth.bg' + cls[-1]
    return re.sub(pat, rf"<{tagname} {before}className={{ {new_cls} }}{after}>", text, count=1, flags=re.S)

  # no className -> add one
  pat2 = rf"<{tagname}\s*>"
  if re.search(pat2, text):
    return re.sub(pat2, rf'<{tagname} className={{biomeHealth.bg}}>', text, count=1)
  return text

s2 = add_bg_to_tag("main", s)
if s2 == s:
  s2 = add_bg_to_tag("div", s)
s = s2

# 4) Insert a Biome Health card near the top of the dashboard (right above MasteryDonut section if possible)
if "Biome Health" not in s:
  insert_pat = r"(<section\s+className=\"rounded-2xl border bg-white p-6 shadow-sm\">)"
  if re.search(insert_pat, s):
    s = re.sub(
      insert_pat,
      r"""\1
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-2xl border bg-white/60 p-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Biome Health</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {biomeHealth.level} • {biomeHealth.biome}
            <span className="ml-2 align-middle text-sm font-semibold text-slate-600">({biomeHealth.pct}%)</span>
          </div>
          <div className="mt-1 text-sm text-slate-600">{biomeHealth.desc}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full border bg-white px-3 py-1 text-sm font-semibold text-slate-800">
            Next: raise 1 segment
          </div>
        </div>
      </div>
""",
      s,
      count=1,
      flags=re.S
    )

path.write_text(s, encoding="utf-8")
print("✅ Patch applied.")
PY

echo "✅ Done. Restart dev server if running:"
echo "   pnpm dev:web"
