#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python3 - <<'PY'
from pathlib import Path

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
raw = p.read_text()

# Remove any existing "use client" directive lines (handles quotes + semicolon + whitespace)
lines = []
for line in raw.splitlines():
    if line.strip() in ('"use client";', "'use client';", '"use client"', "'use client'"):
        continue
    lines.append(line)

# Strip leading blank lines so the directive is truly at the top
while lines and lines[0].strip() == "":
    lines.pop(0)

new = '"use client";\n' + "\n".join([""] + lines) + ("\n" if not raw.endswith("\n") else "")
p.write_text(new)

print("✅ Forced 'use client' to line 1.")
print("---- first 8 lines now ----")
for i, l in enumerate(new.splitlines()[:8], start=1):
    print(f"{i:>2}: {l}")
PY
