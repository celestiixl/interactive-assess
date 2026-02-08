#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Find Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
else
  echo "❌ can't find Next app router at apps/web/src/app or apps/web/app"
  exit 1
fi
echo "✅ APP_ROOT=$APP_ROOT"

ASSESS_DIR="$APP_ROOT/assessment"
ASSESS_PAGE="$ASSESS_DIR/page.tsx"
ROOT_LAYOUT="$APP_ROOT/layout.tsx"

restore_latest_bak () {
  local f="$1"
  local bak
  bak="$(ls -1 "${f}.bak."* 2>/dev/null | tail -n 1 || true)"
  if [ -n "${bak:-}" ] && [ -f "$bak" ]; then
    echo "↩️  restoring latest backup for $f -> $bak"
    cp -f "$bak" "$f"
    return 0
  fi
  return 1
}

echo "== 1) Restore assessment page if it got nuked/dimmed =="
if [ -f "$ASSESS_PAGE" ]; then
  # If it contains the problematic styled-jsx/client-only import patterns OR looks like the dark prototype shell,
  # restore from the latest backup (your scripts created *.bak.*)
  if rg -n "styled-jsx|client-only" "$ASSESS_PAGE" >/dev/null 2>&1; then
    restore_latest_bak "$ASSESS_PAGE" || true
  fi
fi

# Also restore root layout if it was over-patched and is now causing huge dark/blank shells
if [ -f "$ROOT_LAYOUT" ]; then
  if rg -n "styled-jsx|client-only" "$ROOT_LAYOUT" >/dev/null 2>&1; then
    restore_latest_bak "$ROOT_LAYOUT" || true
  fi
fi

echo "== 2) Make /assessment a proper Client Component (no styled-jsx server import issues) =="
mkdir -p "$ASSESS_DIR"
if [ ! -f "$ASSESS_PAGE" ]; then
  cat > "$ASSESS_PAGE" <<'TSX'
"use client";

import Link from "next/link";

export default function AssessmentHome() {
  return (
    <main className="min-h-dvh w-full bg-[radial-gradient(1200px_800px_at_15%_10%,rgba(45,212,191,0.18),transparent_55%),radial-gradient(900px_700px_at_85%_0%,rgba(168,85,247,0.12),transparent_55%),linear-gradient(to_bottom,#050814,#070A16,#050814)] text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10">
              <span className="text-xs font-semibold tracking-wide">IA</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">interactive-assess</div>
              <div className="text-xs text-slate-300">STAAR Biology • interactive items • practice + test</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-100 ring-1 ring-violet-300/25">
              STAAR aligned
            </span>
            <span className="rounded-full bg-teal-500/15 px-3 py-1 text-xs text-teal-100 ring-1 ring-teal-300/25">
              Interactive
            </span>
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-100 ring-1 ring-amber-300/25">
              Practice/Test
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/practice?rc=RC1%20%E2%80%A2%20Cell%20Structure%20%26%20Function"
              className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10"
            >
              Open Practice
            </Link>
            <Link
              href="/teacher/dashboard"
              className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10"
            >
              Teacher
            </Link>
          </div>
        </div>

        {/* Content grid */}
        <div className="mt-8 grid grid-cols-12 gap-5">
          {/* Left nav */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
              <div className="text-xs uppercase tracking-wide text-slate-300">Navigation</div>
              <div className="mt-1 text-sm text-slate-200">Jump between roles and test screens.</div>

              <div className="mt-4 space-y-2">
                <Link className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/assessment">
                  <span>Assessment Home</span>
                  <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-[11px] text-slate-200 ring-1 ring-slate-300/20">slate</span>
                </Link>
                <Link className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/student/assessment">
                  <span>Student Assessment Lab</span>
                  <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[11px] text-teal-100 ring-1 ring-teal-300/25">teal</span>
                </Link>
                <Link className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/student/assessment/items">
                  <span>Items Test Screen</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-100 ring-1 ring-emerald-300/25">emerald</span>
                </Link>
                <Link className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/practice?rc=RC1%20%E2%80%A2%20Cell%20Structure%20%26%20Function">
                  <span>Practice Runner</span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-100 ring-1 ring-amber-300/25">amber</span>
                </Link>
                <Link className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/teacher/dashboard">
                  <span>Teacher Dashboard</span>
                  <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-[11px] text-slate-200 ring-1 ring-slate-300/20">slate</span>
                </Link>
              </div>

              <div className="mt-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <div className="text-xs uppercase tracking-wide text-slate-300">Status</div>
                <div className="mt-1 text-sm text-slate-100">Mode: prototype</div>
                <div className="text-sm text-slate-200">Next build: Inline Choice first-class</div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <section className="col-span-12 lg:col-span-9">
            <h1 className="text-2xl font-semibold">Assessment</h1>
            <p className="mt-1 text-sm text-slate-300">
              Choose your view. Student is the practice + item sandbox. Teacher is building, managing, and analytics.
            </p>

            <div className="mt-6 grid grid-cols-12 gap-5">
              <div className="col-span-12 xl:col-span-6 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
                <div className="text-xs uppercase tracking-wide text-slate-300">Student</div>
                <div className="mt-2 text-lg font-semibold">Continue as Student</div>
                <div className="mt-1 text-sm text-slate-300">
                  Practice runner entry, interactive item testing, goals, and progress.
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs text-teal-100 ring-1 ring-teal-300/25">Practice</span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-100 ring-1 ring-emerald-300/25">Interactive items</span>
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-100 ring-1 ring-amber-300/25">Goals</span>
                  <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-100 ring-1 ring-violet-300/25">Mastery</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/student/assessment">
                    Open Student Lab
                  </Link>
                  <Link className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/practice?rc=RC1%20%E2%80%A2%20Cell%20Structure%20%26%20Function">
                    Practice Runner
                  </Link>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-6 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
                <div className="text-xs uppercase tracking-wide text-slate-300">Teacher</div>
                <div className="mt-2 text-lg font-semibold">Continue as Teacher</div>
                <div className="mt-1 text-sm text-slate-300">
                  Build items, manage assessments, view analytics, and jump into student view.
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs text-teal-100 ring-1 ring-teal-300/25">Builder</span>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-100 ring-1 ring-emerald-300/25">Analytics</span>
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-100 ring-1 ring-amber-300/25">Assign</span>
                  <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-100 ring-1 ring-violet-300/25">Student view</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/teacher/dashboard">
                    Teacher Dashboard
                  </Link>
                  <Link className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/student/assessment/items">
                    Items Test Screen
                  </Link>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-8 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Quick actions</div>
                    <div className="text-xs text-slate-300">Handy jumps while you're building and testing.</div>
                  </div>
                  <span className="rounded-full bg-slate-500/20 px-3 py-1 text-xs text-slate-200 ring-1 ring-slate-300/20">shortcuts</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/practice?rc=RC1%20%E2%80%A2%20Cell%20Structure%20%26%20Function">
                    Practice Runner
                  </Link>
                  <Link className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/student/assessment/items">
                    Items Test Screen
                  </Link>
                  <Link className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10" href="/student/assessment">
                    Student Lab
                  </Link>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">What's next</div>
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-100 ring-1 ring-amber-300/25">roadmap</span>
                </div>

                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-teal-400"></span>
                    <span><b className="text-slate-100">Inline Choice</b>: show in pills + builder + runner (no hook errors)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span>Role-based login routing (student/teacher) + “remember my view”</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-400"></span>
                    <span>Accommodations: text-to-speech, extended time, reduced answer choices</span>
                  </li>
                </ul>

                <div className="mt-4 text-xs text-slate-400">
                  Tip: once we add auth, this page becomes the smart gate that routes by role automatically.
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 text-center text-xs text-slate-500">
          Prototype UI: darker glass with readable text and color-coded pills. No styled-jsx used.
        </div>
      </div>
    </main>
  );
}
TSX
fi

echo "== 3) Ensure /assessment has no Server-Component styled-jsx issues =="
# If your file exists but isn't client, force it (safely).
if [ -f "$ASSESS_PAGE" ]; then
  if ! head -n 5 "$ASSESS_PAGE" | rg -q '"use client"'; then
    cp -f "$ASSESS_PAGE" "$ASSESS_PAGE.bak.$(date +%Y%m%d_%H%M%S)"
    tmp="$(mktemp)"
    {
      echo '"use client";'
      echo
      cat "$ASSESS_PAGE"
    } > "$tmp"
    mv "$tmp" "$ASSESS_PAGE"
    echo "✅ added \"use client\" to top of $ASSESS_PAGE"
  fi
fi

echo "✅ Done. Rebuild your dev server."
echo "Try: pnpm --filter web dev -p 3010"
