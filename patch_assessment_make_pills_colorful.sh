#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1

if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
else
  APP_ROOT="apps/web/app"
fi

PAGE="$APP_ROOT/assessment/page.tsx"

cp "$PAGE" "$PAGE.bak.$(date +%Y%m%d_%H%M%S)"

python - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/assessment/page.tsx")
if not p.exists():
    p = Path("apps/web/app/assessment/page.tsx")

t = p.read_text()

# Add a stable root id to scope styles
t = re.sub(r'<main\b', '<main id="assessment-root"', t, count=1)

# Inject a small scoped style block (only for this page)
style_block = """
<style jsx global>{`
#assessment-root .rounded-full{
  font-weight: 600;
  filter: saturate(1.35);
  box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 4px 14px rgba(0,0,0,.25);
}

/* rotate hues so pills stop all looking green */
#assessment-root .rounded-full:nth-child(4n+1){ filter: saturate(1.4) hue-rotate(0deg); }
#assessment-root .rounded-full:nth-child(4n+2){ filter: saturate(1.4) hue-rotate(45deg); }
#assessment-root .rounded-full:nth-child(4n+3){ filter: saturate(1.4) hue-rotate(90deg); }
#assessment-root .rounded-full:nth-child(4n+4){ filter: saturate(1.4) hue-rotate(140deg); }

/* boost contrast for card text so it’s actually readable */
#assessment-root h1,
#assessment-root h2,
#assessment-root h3{
  color: rgba(255,255,255,.95);
}

#assessment-root p{
  color: rgba(255,255,255,.78);
}

/* subtle neon edge so the page feels less sterile */
#assessment-root [class*="rounded-"][class*="border"]{
  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.06),
    0 12px 40px rgba(0,0,0,.45);
}
`}</style>
"""

# Inject right after the opening main tag
t2, n = re.subn(
    r'(<main[^>]*>)',
    r'\1\n' + style_block,
    t,
    count=1
)

if n == 0:
    raise SystemExit("Could not inject styles (main tag not found).")

p.write_text(t2)
print("✅ Pills now cycle multiple colors + contrast boosted + less sterile look.")
PY

echo "Hard refresh /assessment to see the changes."
