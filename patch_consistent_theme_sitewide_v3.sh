#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Detect Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router root"
  exit 1
fi

LAYOUT="$APP_ROOT/layout.tsx"

# Find globals.css
GLOBALS=""
for cand in \
  "$APP_ROOT/globals.css" \
  "apps/web/src/styles/globals.css" \
  "apps/web/styles/globals.css" \
  "apps/web/app/globals.css"
do
  if [ -f "$cand" ]; then GLOBALS="$cand"; break; fi
done

[ -f "$LAYOUT" ] || { echo "❌ layout.tsx not found at $LAYOUT"; exit 1; }
[ -n "${GLOBALS:-}" ] || { echo "❌ globals.css not found"; exit 1; }

echo "✅ APP_ROOT=$APP_ROOT"
echo "✅ LAYOUT=$LAYOUT"
echo "✅ GLOBALS=$GLOBALS"

# Try to locate assessment route robustly.
ASMT=""
if [ -f "$APP_ROOT/assessment/page.tsx" ]; then
  ASMT="$APP_ROOT/assessment/page.tsx"
else
  # Search for a page that looks like the assessment entry you built earlier
  # Heuristics: "AssessmentDashboardEntry" or id="assessment-root" or "/student/assessment"
  ASMT="$(rg -l --hidden --glob '!.next' --glob '!node_modules' \
      'AssessmentDashboardEntry\(|id="assessment-root"|href="/student/assessment"|export default function AssessmentDashboardEntry' \
      "$APP_ROOT" 2>/dev/null | head -n 1 || true)"
fi

if [ -n "${ASMT:-}" ]; then
  echo "✅ ASMT=$ASMT"
else
  echo "⚠️ Could not locate /assessment/page.tsx automatically."
  echo "   No problem: we will still apply the theme sitewide via globals + layout."
fi

ts(){ date +%Y%m%d_%H%M%S; }

cp -v "$LAYOUT" "$LAYOUT.bak.$(ts)" >/dev/null
cp -v "$GLOBALS" "$GLOBALS.bak.$(ts)" >/dev/null
if [ -n "${ASMT:-}" ]; then
  cp -v "$ASMT" "$ASMT.bak.$(ts)" >/dev/null
fi

python - <<'PY'
from pathlib import Path
import re
import os

app_root = Path(os.environ.get("APP_ROOT", "apps/web/src/app"))
layout = Path(os.environ.get("LAYOUT"))
globals_path = Path(os.environ.get("GLOBALS"))
asmt = os.environ.get("ASMT", "").strip()
asmt_path = Path(asmt) if asmt else None

# ---- 1) Inject IA theme primitives into globals.css (once) ----
g = globals_path.read_text(encoding="utf-8")
marker = "/* === IA THEME PRIMITIVES === */"

if marker not in g:
  injection = f"""

{marker}
@layer base {{
  :root {{
    --ia-bg: 248 250 252;          /* slate-50 */
    --ia-panel: 255 255 255;       /* white */
    --ia-border: 226 232 240;      /* slate-200 */
    --ia-text: 15 23 42;           /* slate-900 */
    --ia-muted: 71 85 105;         /* slate-600 */
  }}

  html, body {{ height: 100%; }}

  body {{
    @apply antialiased;
    background: rgb(var(--ia-bg));
    color: rgb(var(--ia-text));
  }}
}}

@layer components {{
  .ia-page {{
    @apply min-h-screen;
    background:
      radial-gradient(900px 420px at 18% 10%, rgba(45,212,191,0.16), transparent 60%),
      radial-gradient(900px 420px at 80% 12%, rgba(245,158,11,0.14), transparent 60%),
      radial-gradient(1100px 520px at 55% 85%, rgba(139,92,246,0.12), transparent 60%),
      rgb(var(--ia-bg));
  }}

  .ia-card {{
    @apply rounded-2xl border bg-white shadow-[0_18px_60px_rgba(2,6,23,0.06)];
    border-color: rgb(var(--ia-border));
  }}

  .ia-card-soft {{
    @apply rounded-2xl border bg-white/85 backdrop-blur;
    border-color: rgb(var(--ia-border));
    box-shadow: 0 18px 60px rgba(2,6,23,0.06);
  }}

  .ia-h1 {{ @apply text-3xl font-semibold tracking-tight; }}
  .ia-h2 {{ @apply text-xl font-semibold; }}
  .ia-muted {{ color: rgb(var(--ia-muted)); }}

  .ia-btn {{
    @apply inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition;
    border-color: rgb(var(--ia-border));
    background: rgba(255,255,255,0.85);
  }}
  .ia-btn:hover {{ background: rgba(248,250,252,1); }}

  .ia-pill {{
    @apply inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold;
    border-color: rgb(var(--ia-border));
    color: rgb(var(--ia-text));
    background: rgba(248,250,252,0.92);
    box-shadow: 0 1px 0 rgba(2,6,23,0.04);
  }}
  .ia-pill-teal {{
    border-color: rgba(45,212,191,0.45);
    background: rgba(45,212,191,0.14);
    color: rgb(13,94,91);
  }}
  .ia-pill-emerald {{
    border-color: rgba(52,211,153,0.45);
    background: rgba(52,211,153,0.14);
    color: rgb(6,95,70);
  }}
  .ia-pill-amber {{
    border-color: rgba(245,158,11,0.45);
    background: rgba(245,158,11,0.14);
    color: rgb(120,53,15);
  }}
  .ia-pill-violet {{
    border-color: rgba(139,92,246,0.40);
    background: rgba(139,92,246,0.12);
    color: rgb(76,29,149);
  }}
  .ia-pill-slate {{
    border-color: rgba(148,163,184,0.55);
    background: rgba(148,163,184,0.12);
    color: rgb(15,23,42);
  }}
}}
"""
  g = g.rstrip() + "\n" + injection + "\n"
  globals_path.write_text(g, encoding="utf-8")

# ---- 2) Patch RootLayout to apply ia-page exactly once ----
l = layout.read_text(encoding="utf-8")

# Replace the return (<html>...</html>) with our consistent wrapper
# Works even if layout is compact one-liner-ish.
new_block = """return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="ia-page">
          {children}
        </div>
      </body>
    </html>
  );
}"""

# Try to replace the whole return section
if re.search(r"return\s*\(\s*<html[\s\S]*?</html>\s*\);\s*\}", l):
  l2 = re.sub(r"return\s*\(\s*<html[\s\S]*?</html>\s*\);\s*\}", new_block, l, count=1)
else:
  # fallback: just remove any padded wrapper div around {children}
  l2 = l
  l2 = re.sub(r'<div className="mx-auto[^"]*p-6[^"]*">\s*\{children\}\s*</div>', "{children}", l2)

layout.write_text(l2, encoding="utf-8")

# ---- 3) If we found the assessment page, remove its duplicate shell (header/sidebar) ----
if asmt_path and asmt_path.exists():
  a = asmt_path.read_text(encoding="utf-8")

  # If assessment currently renders its own "ia-page" outer wrapper OR big header/sidebar,
  # rewrite to content-only. We only touch the exported component.
  if re.search(r"export\s+default\s+function\s+AssessmentDashboardEntry", a):
    a2 = re.sub(
      r"export\s+default\s+function\s+AssessmentDashboardEntry\(\)\s*\{[\s\S]*?\n\}\s*$",
      """export default function AssessmentDashboardEntry() {
  return (
    <main id="assessment-root" className="space-y-6">
      <div>
        <h1 className="ia-h1">Assessment</h1>
        <p className="mt-2 max-w-2xl text-sm ia-muted">
          Choose your view. Student is the practice + item sandbox. Teacher is building, managing, and analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ActionCard
          href="/student/assessment"
          accent="teal"
          title="Continue as Student"
          desc="Practice runner entry, interactive item testing, goals, and progress."
          chips={["Practice", "Interactive items", "Goals", "Mastery"]}
        />
        <ActionCard
          href="/teacher/dashboard"
          accent="slate"
          title="Continue as Teacher"
          desc="Build items, manage assessments, view analytics, and jump into student view."
          chips={["Builder", "Analytics", "Assign", "Student view"]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <section className="ia-card p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Quick actions</div>
              <div className="mt-1 text-xs ia-muted">Handy jumps while you’re building and testing.</div>
            </div>
            <Pill tone="slate">shortcuts</Pill>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/practice" className="ia-btn">Practice Runner</a>
            <a href="/student/assessment/items" className="ia-btn">Items Test Screen</a>
            <a href="/student/assessment" className="ia-btn">Student Lab</a>
          </div>
        </section>

        <section className="ia-card p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">What’s next</div>
            <Pill tone="amber">roadmap</Pill>
          </div>

          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Inline Choice: show in pills + builder + runner (no hook errors)
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-500" />
              Role-based login routing (student/teacher) + remember my view
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
              Accommodations: text-to-speech, extended time, reduced answer choices
            </li>
          </ul>

          <div className="mt-4 text-xs ia-muted">
            Tip: once we add auth, this page becomes the smart gate that routes by role automatically.
          </div>
        </section>
      </div>
    </main>
  );
}
""",
      a.strip(),
      count=1
    )
    asmt_path.write_text(a2 + "\n", encoding="utf-8")

# ---- 4) Light normalization: remove bg-white on page-level containers (no layout copying) ----
def normalize_tsx(p: Path) -> int:
  s = p.read_text(encoding="utf-8")
  o = s

  # Remove bg-white token from className strings
  s = re.sub(
    r'className="([^"]*)\bbg-white\b([^"]*)"',
    lambda m: f'className="{(m.group(1)+m.group(2)).replace("  "," ").strip()}"',
    s
  )
  s = s.replace("min-h-dvh bg-white", "min-h-dvh")

  if s != o:
    p.write_text(s, encoding="utf-8")
    return 1
  return 0

changed = 0
for p in app_root.rglob("*.tsx"):
  if "node_modules" in p.parts or ".next" in p.parts:
    continue
  changed += normalize_tsx(p)

print("✅ globals primitives: injected" )
print("✅ layout: ia-page wrapper applied")
if asmt_path and asmt_path.exists():
  print(f"✅ assessment: content-only shell enforced -> {asmt_path}")
else:
  print("⚠️ assessment: not found, skipped")
print(f"✅ normalized bg-white wrappers across TSX: {changed}")
PY

echo
echo "🎯 Done."
echo "Next:"
echo "  1) Restart dev server (pick a free port)"
echo "     pnpm --filter web dev -p 3010"
echo "  2) Hard refresh: Ctrl+Shift+R (and refresh preview frame if using Codespaces)"
