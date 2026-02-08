#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Detect web package root
WEB_ROOT="apps/web"
[ -d "$WEB_ROOT" ] || { echo "❌ missing apps/web"; exit 1; }

# Detect app router root (where src lives)
if [ -d "$WEB_ROOT/src" ]; then
  SRC_ROOT="$WEB_ROOT/src"
else
  echo "❌ expected $WEB_ROOT/src to exist"
  exit 1
fi

echo "✅ WEB_ROOT=$WEB_ROOT"
echo "✅ SRC_ROOT=$SRC_ROOT"

# ---- 1) Patch tsconfig alias so @/* resolves to src/* ----
# We patch any tsconfig files we find in apps/web (tsconfig.json, tsconfig.app.json, etc.)
TSFILES=()
while IFS= read -r f; do TSFILES+=("$f"); done < <(find "$WEB_ROOT" -maxdepth 2 -name "tsconfig*.json" -type f 2>/dev/null || true)

if [ ${#TSFILES[@]} -eq 0 ]; then
  echo "⚠️ No tsconfig*.json found under $WEB_ROOT (unexpected)."
else
  for TSC in "${TSFILES[@]}"; do
    cp -v "$TSC" "$TSC.bak.$(date +%Y%m%d_%H%M%S)" >/dev/null

    python - <<PY
import json
from pathlib import Path

p = Path("$TSC")
data = json.loads(p.read_text(encoding="utf-8"))

co = data.setdefault("compilerOptions", {})
# baseUrl must be set for paths to work
co.setdefault("baseUrl", ".")

paths = co.setdefault("paths", {})
# Ensure @/* maps to src/*
paths.setdefault("@/*", ["./src/*"])

p.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
PY

    echo "✅ patched alias in: $TSC"
  done
fi

# ---- 2) Ensure the imported modules exist (create if missing) ----
mkdir -p "$SRC_ROOT/components/ia" "$SRC_ROOT/components/analytics" "$SRC_ROOT/lib"

APPSHELL="$SRC_ROOT/components/ia/AppShell.tsx"
DONUT="$SRC_ROOT/components/analytics/ReportingCategoryDonut.tsx"
RC_LIB="$SRC_ROOT/lib/reportingCategories.ts"

# AppShell: shared layout wrapper (keeps style consistent without copying per-page markup)
if [ ! -f "$APPSHELL" ]; then
  cat > "$APPSHELL" <<'TSX'
import Link from "next/link";
import { ReactNode } from "react";

type ActiveKey = "assessment" | "student" | "teacher" | "practice" | "builder" | "analytics";

export function AppShell({
  children,
  activeKey,
}: {
  children: ReactNode;
  activeKey?: ActiveKey;
}) {
  return (
    <div className="ia-page">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-sm font-bold">
              IA
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">interactive-assess</div>
              <div className="text-xs text-slate-600">
                STAAR Biology • interactive items • practice + test
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="ia-pill ia-pill-violet">STAAR aligned</span>
            <span className="ia-pill ia-pill-teal">Interactive</span>
            <span className="ia-pill ia-pill-amber">Practice/Test</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/practice" className="ia-btn">
              Open Practice
            </Link>
            <Link href="/teacher/dashboard" className="ia-btn">
              Teacher
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-screen-2xl px-6 py-8">
        {children}
      </div>
    </div>
  );
}
TSX
  echo "✅ created: $APPSHELL"
else
  echo "✅ exists: $APPSHELL"
fi

# Reporting categories lib (safe defaults)
if [ ! -f "$RC_LIB" ]; then
  cat > "$RC_LIB" <<'TS'
export type ReportingCategory = {
  code: string;
  name: string;
};

export const REPORTING_CATEGORIES: ReportingCategory[] = [
  { code: "RC1", name: "Cell Structure & Function" },
  { code: "RC2", name: "Biomolecules & Enzymes" },
  { code: "RC3", name: "Genetics" },
  { code: "RC4", name: "Evolution" },
  { code: "RC5", name: "Ecology" },
];
TS
  echo "✅ created: $RC_LIB"
else
  echo "✅ exists: $RC_LIB"
fi

# ReportingCategoryDonut stub (so imports build even if you haven’t finished the chart)
if [ ! -f "$DONUT" ]; then
  cat > "$DONUT" <<'TSX'
"use client";

export default function ReportingCategoryDonut() {
  return (
    <div className="ia-card p-6">
      <div className="text-sm font-semibold">Reporting Category Mastery</div>
      <div className="mt-1 text-sm text-slate-600">
        Chart component not wired yet (placeholder).
      </div>
      <div className="mt-4 h-40 w-40 rounded-full border border-slate-200 bg-white/60" />
    </div>
  );
}
TSX
  echo "✅ created: $DONUT"
else
  echo "✅ exists: $DONUT"
fi

echo
echo "🎯 Done."
echo "Next:"
echo "  1) Restart TS server in VS Code (Cmd/Ctrl+Shift+P → TypeScript: Restart TS server)"
echo "  2) Restart dev server (use a free port)"
echo "     pnpm --filter web dev -p 3011"
