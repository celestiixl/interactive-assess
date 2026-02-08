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

cp "$PAGE" "$PAGE.bak.$(date +%Y%m%d_%H%M%S)"

python - <<'PY'
import pathlib, re

p = pathlib.Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
    p = pathlib.Path("apps/web/app/assessment/page.tsx")

t = p.read_text(encoding="utf-8")

# -------------------------------------------------
# 1) Soften the dot grid a LOT
# -------------------------------------------------

# lower opacity
t = t.replace("opacity-[0.06]", "opacity-[0.035]")

# make the grid less dense if present
t = t.replace(
    "[background-size:18px_18px]",
    "[background-size:26px_26px]"
)

# -------------------------------------------------
# 2) Add a soft accent wash at the top of each CardLink
#    (uses the existing accent prop: teal / slate / amber)
# -------------------------------------------------

needle = "      {/* top highlight */}"
if needle in t and "accent wash" not in t:
    t = t.replace(
        needle,
        """      {/* accent wash */}
      <div
        className={
          "pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60 " +
          (accent === "teal"
            ? "bg-gradient-to-b from-teal-400/20 to-transparent"
            : accent === "amber"
            ? "bg-gradient-to-b from-amber-300/20 to-transparent"
            : "bg-gradient-to-b from-slate-400/20 to-transparent")
        }
      />

      {/* top highlight */}"""
    )

p.write_text(t, encoding="utf-8")
print("✅ softened dot grid + added card accent wash")
PY

echo "🎯 Done. Hard refresh /assessment."
