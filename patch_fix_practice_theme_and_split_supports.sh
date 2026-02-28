#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

PRACTICE="apps/web/src/app/(app)/practice/page.tsx"
SUPPORTS_BTN="apps/web/src/components/student/AccommodationsButton.tsx"  # keeping filename for now

[ -f "$PRACTICE" ] || { echo "❌ Missing: $PRACTICE"; exit 1; }
[ -f "$SUPPORTS_BTN" ] || { echo "❌ Missing: $SUPPORTS_BTN"; exit 1; }

cp "$PRACTICE" "${PRACTICE}.bak.$(date +%Y%m%d_%H%M%S)"
cp "$SUPPORTS_BTN" "${SUPPORTS_BTN}.bak.$(date +%Y%m%d_%H%M%S)"

echo "🛠️  1) Fix Practice page container styling to match dashboard theme (remove bg-slate-50 full-page overrides)"
python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/practice/page.tsx")
t = p.read_text(encoding="utf-8")

# Replace the big full-page container if present
# From earlier lint output you had: space-y-6 h-dvh w-full overflow-y-auto bg-slate-50 text-[15px] leading-normal
t2, n = re.subn(
    r'className="([^"]*)space-y-6\s+h-dvh\s+w-full\s+overflow-y-auto\s+bg-slate-50\s+text-\[15px\]\s+leading-normal([^"]*)"',
    r'className="ia-container py-6 space-y-6 text-[15px] leading-normal\2"',
    t,
    count=1
)

# If not found, at least remove bg-slate-50 + h-dvh/w-full/overflow-y-auto on the first obvious page wrapper
if n == 0:
    # remove bg-slate-50
    t2 = re.sub(r'\sbg-slate-50/90\b', ' bg-white/70', t)  # sticky header: lighter glass
    t2 = re.sub(r'\sbg-slate-50\b', '', t2, count=1)
    t2 = re.sub(r'\sh-dvh\b', '', t2, count=1)
    t2 = re.sub(r'\sw-full\b', '', t2, count=1)
    t2 = re.sub(r'\soverflow-y-auto\b', '', t2, count=1)
t = t2

# Make the primary header card feel like dashboard: add ia-card to the first major content wrapper if it exists
# This is best-effort and safe (only first match).
t = re.sub(
    r'className="([^"]*)rounded-3xl\s+border\s+bg-white\s+p-5\s+shadow-sm([^"]*)"',
    r'className="ia-card p-5\2"',
    t,
    count=1
)

p.write_text(t, encoding="utf-8")
print("✅ Practice container styling patched.")
PY

echo "🛠️  2) Fix React purity/hydration risk in Practice page (Date.now in useRef)"
python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/practice/page.tsx")
t = p.read_text(encoding="utf-8")

# Replace: useRef<number>(Date.now())
t, n = re.subn(r'useRef<number>\(\s*Date\.now\(\)\s*\)', 'useRef<number>(0)', t, count=1)

# Add an effect to set it once (only if we actually changed it and no existing init effect)
if n > 0 and "questionStartRef.current = Date.now()" not in t:
    # insert after confetti ref line or after questionStartRef line
    t = re.sub(
        r'(const\s+questionStartRef\s*=\s*useRef<number>\(0\);\s*)',
        r'\1\n  useEffect(() => {\n    if (!questionStartRef.current) questionStartRef.current = Date.now();\n  }, []);\n',
        t,
        count=1
    )

p.write_text(t, encoding="utf-8")
print("✅ Practice Date.now() purity fix applied.")
PY

echo "🛠️  3) Rename student-facing panel to Supports and REMOVE 504/IEP-only toggles from student control"
python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/components/student/AccommodationsButton.tsx")
t = p.read_text(encoding="utf-8")

# Ensure "use client" is first statement
lines = t.splitlines()
# Strip any leading blank lines
while lines and lines[0].strip() == "":
    lines.pop(0)
# Move directive to top if needed
directive_idx = None
for i, ln in enumerate(lines[:10]):
    if ln.strip().strip(";") in ['"use client"', "'use client'"]:
        directive_idx = i
        break
if directive_idx is None:
    lines.insert(0, '"use client";')
    lines.insert(1, "")
else:
    d = lines.pop(directive_idx)
    lines.insert(0, '"use client";')
    lines.insert(1, "")
t = "\n".join(lines) + "\n"

# Default label should be Supports (and NOT "Accommodations")
t = re.sub(r'label\s*=\s*"Accommodations"', 'label = "Supports"', t)

# Update modal title
t = re.sub(r'>Accommodations<', '>Supports<', t)

# Update helper copy
t = re.sub(
    r'These settings apply to the Student Dashboard and Practice\.',
    'These are optional supports you can turn on for yourself.',
    t
)

# Remove the entire "Answer supports" block (reduce choices etc) so students can't toggle 504/IEP-type mods
# This targets the section that starts with "Answer supports" and ends before the Reset button.
t = re.sub(
    r'<div className="ia-card-soft bg-white p-4">[\s\S]*?<div className="mt-3">[\s\S]*?</div>\s*</div>\s*',
    '',
    t,
    count=1
)

# Also remove any remaining reduceChoices buttons if still present
t = re.sub(r'Choices:\s*Normal', '', t)
t = re.sub(r'Choices:\s*-\s*2', '', t)

# Keep TTS as a student support (optional). If you want TTS to be teacher-only later, we can flip this.
# Rename toggle label to "Read aloud (optional)"
t = re.sub(r'title="Read aloud \(TTS\)"', 'title="Read aloud (optional)"', t)

# Make the trigger pill text "Supports" even if caller passes old label
t = t.replace("Accommodations", "Supports")

p.write_text(t, encoding="utf-8")
print("✅ Supports panel updated (student self-service only).")
PY

echo "🛠️  4) Place Supports pill next to Practice header (NOT floating in the content column)"
python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/practice/page.tsx")
t = p.read_text(encoding="utf-8")

# We saw in your output:
# title={`Practice • ${rcParam || rcLabels[0]}`}
# and later:
# Practice: {rcParam || rcLabels[0]}
#
# We'll inject the pill right next to the "Practice:" label line.
needle = r'(Practice:\s*\{rcParam\s*\|\|\s*rcLabels\[0\][\s\S]*?\})'
if re.search(needle, t):
    # Wrap that line's parent container to include the pill if possible:
    # Find the nearest <div className="..."> that contains "Practice:" and add a right-side area.
    # Best-effort: replace the first occurrence of the line block that prints Practice: ... with a flex row.
    t2, n = re.subn(
        r'(<div className="[^"]*">\s*)(Practice:\s*\{rcParam\s*\|\|\s*rcLabels\[0\][^}]*\})',
        r'\1<div className="flex items-center justify-between gap-3">\n                <div className="text-sm font-semibold text-slate-900">\2</div>\n                <AccommodationsButton label="Supports" />\n              </div>',
        t,
        count=1
    )
    t = t2 if n else t
else:
    # Fallback: inject into any sticky header inner row
    t = re.sub(
        r'(<div className="sticky top-0 z-50[^"]*">[\s\S]*?<div className="[^"]*")',
        r'\1 flex items-center justify-between',
        t,
        count=1
    )
    if 'AccommodationsButton label="Supports"' not in t:
        t = re.sub(
            r'(<div className="[^"]*flex items-center justify-between[^"]*">)',
            r'\1\n              <div className="ml-auto"><AccommodationsButton label="Supports" /></div>',
            t,
            count=1
        )

p.write_text(t, encoding="utf-8")
print("✅ Supports pill placement patched (best-effort).")
PY

echo "✅ Done."
echo "Now restart:"
echo "  pnpm -C apps/web dev"
