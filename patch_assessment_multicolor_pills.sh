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

# 1) Replace Chip component with a color-aware version
chip_new = r'''
function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "teal" | "emerald" | "amber" | "slate" | "violet";
}) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur shadow-[0_1px_0_rgba(2,6,23,0.06)]";

  const tones: Record<string, string> = {
    neutral: "border-foreground/10 bg-background/80 text-foreground/70",
    teal: "border-teal-500/25 bg-teal-500/10 text-teal-900 dark:text-teal-200",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-950 dark:text-amber-200",
    slate: "border-slate-500/20 bg-slate-500/10 text-slate-900 dark:text-slate-200",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-950 dark:text-violet-200",
  };

  return <span className={`${base} ${tones[tone] ?? tones.neutral}`}>{children}</span>;
}
'''.strip()

# Replace existing Chip function block
t2 = re.sub(r'function Chip\([\s\S]*?\n\}\n', chip_new + "\n\n", t, count=1)
if t2 == t:
    raise SystemExit("❌ Could not find Chip() function to replace in /assessment/page.tsx")
t = t2

# 2) Update CardLink chip rendering to cycle colors (so the pills are NOT all the same)
# Replace `{chips.map((c) => (<Chip key={c}>{c}</Chip>))}`
# with indexed + tone cycle
tone_block = r'''
      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((c, i) => {
          const cycle: Array<"teal" | "emerald" | "amber" | "slate" | "violet"> = [
            "teal",
            "emerald",
            "amber",
            "slate",
            "violet",
          ];
          const tone = cycle[i % cycle.length];
          return (
            <Chip key={c} tone={tone}>
              {c}
            </Chip>
          );
        })}
      </div>
'''.rstrip()

t = re.sub(
    r'<div className="mt-5 flex flex-wrap gap-2">\s*\{chips\.map\(\(c\)\s*=>\s*\(\s*<Chip key=\{c\}>\{c\}</Chip>\s*\)\)\}\s*</div>',
    tone_block,
    t,
    count=1,
    flags=re.M
)

# 3) Give the top chips intentional tones (not neutral)
# Replace the three Chip usages near the top if they exist
t = t.replace('<Chip>STAAR Biology aligned</Chip>', '<Chip tone="violet">STAAR Biology aligned</Chip>')
t = t.replace('<Chip>Interactive items</Chip>', '<Chip tone="teal">Interactive items</Chip>')
t = t.replace('<Chip>Practice + Test modes</Chip>', '<Chip tone="amber">Practice + Test modes</Chip>')

p.write_text(t, encoding="utf-8")
print("✅ Multi-color pills applied:", p)
PY

echo "🎯 Done. Hard refresh /assessment (Ctrl+Shift+R)."
