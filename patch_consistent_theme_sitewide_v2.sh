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

# Locate globals.css (prefer app/globals.css)
GLOBALS=""
for cand in \
  "$APP_ROOT/globals.css" \
  "apps/web/src/styles/globals.css" \
  "apps/web/styles/globals.css" \
  "apps/web/app/globals.css"
do
  if [ -f "$cand" ]; then GLOBALS="$cand"; break; fi
done

ASMT="$APP_ROOT/assessment/page.tsx"

echo "✅ APP_ROOT=$APP_ROOT"
echo "✅ LAYOUT=$LAYOUT"
echo "✅ GLOBALS=${GLOBALS:-"(not found)"}"
echo "✅ ASMT=$ASMT"

[ -f "$LAYOUT" ] || { echo "❌ missing layout.tsx"; exit 1; }
[ -f "$ASMT" ] || { echo "❌ missing /assessment/page.tsx"; exit 1; }
[ -n "${GLOBALS:-}" ] || { echo "❌ globals.css not found"; exit 1; }

ts(){ date +%Y%m%d_%H%M%S; }

cp -v "$LAYOUT" "$LAYOUT.bak.$(ts)" >/dev/null
cp -v "$GLOBALS" "$GLOBALS.bak.$(ts)" >/dev/null
cp -v "$ASMT" "$ASMT.bak.$(ts)" >/dev/null

python - <<'PY'
from pathlib import Path
import re

# ---- paths ----
app_root = Path("apps/web/src/app")
if not app_root.exists():
  app_root = Path("apps/web/app")

layout = app_root / "layout.tsx"
asmt = app_root / "assessment" / "page.tsx"

# globals located by bash, but re-discover here in same priority
globals_candidates = [
  app_root / "globals.css",
  Path("apps/web/src/styles/globals.css"),
  Path("apps/web/styles/globals.css"),
  Path("apps/web/app/globals.css"),
]
globals_path = next((p for p in globals_candidates if p.exists()), None)
assert globals_path, "globals.css not found"

# ---- 1) Inject sitewide theme primitives (Tailwind @apply) ----
g = globals_path.read_text(encoding="utf-8")

marker = "/* === IA THEME PRIMITIVES === */"
if marker not in g:
  injection = f"""

{marker}
@layer base {{
  :root {{
    --ia-bg: 248 250 252;          /* slate-50 */
    --ia-panel: 255 255 255;       /* white */
    --ia-panel-2: 248 250 252;     /* subtle wash */
    --ia-border: 226 232 240;      /* slate-200 */
    --ia-text: 15 23 42;           /* slate-900 */
    --ia-muted: 71 85 105;         /* slate-600 */
    --ia-shadow: 2 6 23;           /* slate-950 */
  }}

  html, body {{
    height: 100%;
  }}

  body {{
    @apply antialiased;
    background: rgb(var(--ia-bg));
    color: rgb(var(--ia-text));
  }}
}}

@layer components {{
  /* page backdrop */
  .ia-page {{
    @apply min-h-screen;
    background:
      radial-gradient(900px 420px at 18% 10%, rgba(45,212,191,0.16), transparent 60%),
      radial-gradient(900px 420px at 80% 12%, rgba(245,158,11,0.14), transparent 60%),
      radial-gradient(1100px 520px at 55% 85%, rgba(139,92,246,0.12), transparent 60%),
      rgb(var(--ia-bg));
  }}

  /* surfaces */
  .ia-card {{
    @apply rounded-2xl border bg-white shadow-[0_18px_60px_rgba(2,6,23,0.06)];
    border-color: rgb(var(--ia-border));
  }}

  .ia-card-soft {{
    @apply rounded-2xl border bg-white/85 backdrop-blur;
    border-color: rgb(var(--ia-border));
    box-shadow: 0 18px 60px rgba(2,6,23,0.06);
  }}

  /* typography helpers */
  .ia-h1 {{ @apply text-3xl font-semibold tracking-tight; }}
  .ia-h2 {{ @apply text-xl font-semibold; }}
  .ia-muted {{ color: rgb(var(--ia-muted)); }}

  /* buttons */
  .ia-btn {{
    @apply inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition;
    border-color: rgb(var(--ia-border));
    background: rgba(255,255,255,0.8);
  }}
  .ia-btn:hover {{
    background: rgba(248,250,252,1);
  }}

  /* pills (readable text) */
  .ia-pill {{
    @apply inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold;
    border-color: rgb(var(--ia-border));
    color: rgb(var(--ia-text));
    background: rgba(248,250,252,0.9);
    box-shadow: 0 1px 0 rgba(2,6,23,0.04);
  }}
  .ia-pill-teal {{
    border-color: rgba(45,212,191,0.45);
    background: rgba(45,212,191,0.14);
    color: rgb(13, 94, 91);
  }}
  .ia-pill-emerald {{
    border-color: rgba(52,211,153,0.45);
    background: rgba(52,211,153,0.14);
    color: rgb(6, 95, 70);
  }}
  .ia-pill-amber {{
    border-color: rgba(245,158,11,0.45);
    background: rgba(245,158,11,0.14);
    color: rgb(120, 53, 15);
  }}
  .ia-pill-violet {{
    border-color: rgba(139,92,246,0.40);
    background: rgba(139,92,246,0.12);
    color: rgb(76, 29, 149);
  }}
  .ia-pill-slate {{
    border-color: rgba(148,163,184,0.55);
    background: rgba(148,163,184,0.12);
    color: rgb(15, 23, 42);
  }}
}}
"""
  g = g.rstrip() + "\n" + injection + "\n"
  globals_path.write_text(g, encoding="utf-8")

# ---- 2) Make RootLayout provide ONE consistent page wrapper (no extra padding, no forced bg conflicts) ----
l = layout.read_text(encoding="utf-8")

# Ensure it's a clean html/body and children are wrapped in ia-page once.
# Replace the whole return block safely if it looks like standard Next layout.
return_block = re.search(r"return\s*\(\s*<html[\s\S]*?</html>\s*\);\s*\}", l)
if return_block:
  new_layout = re.sub(
    r"return\s*\(\s*<html[\s\S]*?</html>\s*\);\s*\}",
    """return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="ia-page">
          {children}
        </div>
      </body>
    </html>
  );
}""",
    l,
    count=1
  )
  l = new_layout
else:
  # fallback: at least remove common padded wrapper class if present
  l = l.replace('className="mx-auto w-full min-h-screen p-6"', 'className="w-full"')

layout.write_text(l, encoding="utf-8")

# ---- 3) Fix the DOUBLE SHELL: /assessment must NOT render its own header/sidebar now ----
a = asmt.read_text(encoding="utf-8")

# If assessment still contains its own <header ...> or <aside ...>, rewrite the component body to content-only.
# Keep local components if present (Pill/ActionCard), just replace the exported component render.
m = re.search(r"export\s+default\s+function\s+AssessmentDashboardEntry\(\)\s*\{\s*return\s*\(", a)
if m:
  # grab everything up to the start of the component, and everything after the component closes
  # We will replace only the function implementation with a content-only main.
  a = re.sub(
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

asmt.write_text(a + "\n", encoding="utf-8")

# ---- 4) Light-touch normalization: remove hard bg-white wrappers that fight the theme ----
# We do NOT copy layouts into each page; we just stop pages from forcing their own background.
def normalize_file(p: Path):
  s = p.read_text(encoding="utf-8")
  original = s

  # Remove bg-white from common top-level containers
  s = re.sub(r'className="([^"]*)\bbg-white\b([^"]*)"', lambda m: f'className="{(m.group(1)+m.group(2)).replace("  "," ").strip()}"', s)

  # Replace min-h-dvh bg-white (common pattern) -> min-h-dvh
  s = s.replace("min-h-dvh bg-white", "min-h-dvh")

  if s != original:
    p.write_text(s, encoding="utf-8")
    return 1
  return 0

changed = 0
for p in app_root.rglob("*.tsx"):
  # only patch routes/pages/layouts, skip node_modules etc (already outside)
  if "node_modules" in p.parts: 
    continue
  changed += normalize_file(p)

print(f"✅ globals primitives injected: {marker in g}")
print("✅ layout now provides single ia-page wrapper")
print("✅ assessment double-shell removed (content-only)")
print(f"✅ normalized bg-white wrappers across tsx files: {changed}")
PY

echo
echo "🎯 Done."
echo "Next:"
echo "  1) Kill old dev server if a port is busy"
echo "  2) Restart: pnpm --filter web dev -p 3010 (or any free port)"
echo "  3) Hard refresh: Ctrl+Shift+R (and refresh preview frame if using Codespaces)"
