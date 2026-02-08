#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess || exit 1

if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
else
  APP_ROOT="apps/web/app"
fi

PAGE="$APP_ROOT/assessment/page.tsx"
[ -f "$PAGE" ] || { echo "❌ missing: $PAGE"; exit 1; }

cp -v "$PAGE" "$PAGE.bak.$(date +%Y%m%d_%H%M%S)" >/dev/null

python - <<'PY'
import pathlib, re

p = pathlib.Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
    p = pathlib.Path("apps/web/app/assessment/page.tsx")
t = p.read_text(encoding="utf-8")

# --- 1) Upgrade Chip to have clearer contrast ---
t = t.replace(
    'className="inline-flex items-center rounded-full border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur shadow-[0_1px_0_rgba(2,6,23,0.04)]"',
    'className="inline-flex items-center rounded-full border border-foreground/10 bg-background/75 px-2.5 py-1 text-xs text-foreground/70 backdrop-blur shadow-[0_1px_0_rgba(2,6,23,0.06)]"'
)

# --- 2) Add accent support to CardLink (student=teal, teacher=slate) ---
# Replace CardLink signature props and add accent param defaults
t = re.sub(
    r'function CardLink\(\{\s*href,\s*title,\s*desc,\s*chips,\s*badge,\s*\}:\s*\{\s*href: string;\s*title: string;\s*desc: string;\s*chips: string\[\];\s*badge: string;\s*\}\)\s*\{',
    'function CardLink({ href, title, desc, chips, badge, accent }: { href: string; title: string; desc: string; chips: string[]; badge: string; accent: "teal" | "slate" | "amber"; }) {',
    t
)

# If accent not provided earlier, set a default in calls (we’ll patch calls below)
# Add a left accent rail and clearer backgrounds/borders in CardLink container
t = t.replace(
    'className="group relative overflow-hidden rounded-2xl border bg-background/60 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"',
    'className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"'
)

# Insert accent rail inside CardLink right after opening Link div
if '/* subtle corner glow */' in t and 'data-accent' not in t:
    t = t.replace(
        '<Link\n      href={href}\n      className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"\n    >',
        '<Link\n      href={href}\n      className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"\n      data-accent={accent}\n    >\n      {/* accent rail */}\n      <div\n        className={\n          \"pointer-events-none absolute left-0 top-0 h-full w-[5px] opacity-70 \" +\n          (accent === \"teal\"\n            ? \"bg-teal-500/70\"\n            : accent === \"amber\"\n            ? \"bg-amber-500/70\"\n            : \"bg-slate-500/60\")\n        }\n      />'
    )

# Make badge slightly clearer
t = t.replace(
    'bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground',
    'bg-muted/40 px-2 py-1 text-[11px] font-semibold text-foreground/70'
)

# Improve body text contrast (subtle but clearer)
t = t.replace(
    'text-sm leading-relaxed text-muted-foreground',
    'text-sm leading-relaxed text-foreground/70'
)

# Improve title contrast
t = t.replace(
    'text-lg font-semibold tracking-tight',
    'text-lg font-semibold tracking-tight text-foreground'
)

# --- 3) Strengthen page header contrast and add a secondary accent underline ---
t = t.replace(
    '<h1 className="text-3xl font-semibold tracking-tight">\n              Assessment\n            </h1>',
    '<h1 className="text-3xl font-semibold tracking-tight text-foreground">\n              Assessment\n            </h1>\n            <div className="mt-2 h-px w-40 bg-gradient-to-r from-teal-500/60 via-emerald-500/40 to-amber-500/40" />'
)

t = t.replace(
    'className="max-w-2xl text-sm leading-relaxed text-muted-foreground"',
    'className="max-w-2xl text-sm leading-relaxed text-foreground/70"'
)

# --- 4) Update the two CardLink calls with accents and slightly better chip sets ---
t = t.replace(
    'chips={["Practice runner", "Item sandbox", "Goals", "Mastery"]}',
    'chips={["Practice", "Interactive items", "Goals", "Mastery"]}'
)
t = t.replace(
    'chips={["Teacher dashboard", "Builder", "Analytics", "Student view"]}',
    'chips={["Builder", "Analytics", "Assign", "Student view"]}'
)

# Add accent props to CardLink calls (student=teal, teacher=slate)
t = t.replace(
    'badge="Student"\n              title="Continue as Student"',
    'badge="Student"\n              accent="teal"\n              title="Continue as Student"'
)
t = t.replace(
    'badge="Teacher"\n              title="Continue as Teacher"',
    'badge="Teacher"\n              accent="slate"\n              title="Continue as Teacher"'
)

# --- 5) Improve Quick links panel contrast and add amber accent header ---
# Make the panel background less blended + stronger border
t = t.replace(
    'className="rounded-2xl border bg-background/60 p-5 backdrop-blur',
    'className="rounded-2xl border border-foreground/10 bg-background/85 p-5 backdrop-blur'
)

# Add a small header bar for quick links if present
t = t.replace(
    '<div className="text-sm font-medium">Quick links</div>',
    '<div className="flex items-center justify-between">\n                <div className="text-sm font-semibold text-foreground">Quick links</div>\n                <span className="inline-flex items-center rounded-full border border-foreground/10 bg-muted/30 px-2 py-1 text-[11px] font-semibold text-foreground/70">shortcuts</span>\n              </div>'
)

# --- 6) Make What’s next bullets pop slightly more ---
t = t.replace('bg-teal-500/70', 'bg-teal-500/80')
t = t.replace('bg-amber-500/70', 'bg-amber-500/80')
t = t.replace('bg-slate-500/70', 'bg-slate-500/60')

# --- 7) Increase spacing between top cards and lower panel for scanability ---
t = t.replace(
    '<div className="mt-8 grid',
    '<div className="mt-10 grid'
)

p.write_text(t, encoding="utf-8")
print("✅ Readability + accents applied:", p)
PY

echo "🎯 Done. Hard refresh /assessment (Ctrl+Shift+R)."
