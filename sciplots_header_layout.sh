#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/interactive-assess

FILE="apps/web/src/app/(app)/student/dashboard/page.tsx"
cp "$FILE" "$FILE.bak.$(date +%s)"

python3 <<'PY'
from pathlib import Path
p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
s = p.read_text()

old = '''
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div
            className="inline-block rounded-2xl border bg-white px-6 py-5 shadow-sm"
          >
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Student Dashboard
            </h1>
            <p className="mt-1 text-slate-600">
              Your personal mastery tracker.
'''

new = '''
      {/* FULL WIDTH HEADER BAND */}
      <div className="w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              Student Dashboard
            </h1>
            <p className="mt-2 text-slate-600">
              Your personal mastery tracker.
'''

if old not in s:
    raise SystemExit("Header block not found — layout slightly different. Send me lines around title.")

s = s.replace(old, new, 1)
p.write_text(s)
print("✅ Converted header to full-width band")
PY

rm -rf apps/web/.next
HOSTNAME=0.0.0.0 PORT=3001 pnpm dev:web
