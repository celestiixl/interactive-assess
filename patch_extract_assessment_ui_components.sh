#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# Detect Next App Router root
if [ -d apps/web/src/app ]; then
  APP_ROOT="apps/web/src/app"
  WEB_ROOT="apps/web/src"
elif [ -d apps/web/app ]; then
  APP_ROOT="apps/web/app"
  WEB_ROOT="apps/web"
else
  echo "❌ can't find Next app router root"
  exit 1
fi

echo "✅ APP_ROOT=$APP_ROOT"
echo "✅ WEB_ROOT=$WEB_ROOT"

UI_DIR="$WEB_ROOT/components/ia"
mkdir -p "$UI_DIR"

ts(){ date +%Y%m%d_%H%M%S; }

backup() {
  local f="$1"
  [ -f "$f" ] || return 0
  cp -v "$f" "$f.bak.$(ts)" >/dev/null
}

# -----------------------------
# 1) Pill + IconPill
# -----------------------------
cat > "$UI_DIR/Pill.tsx" <<'TS'
import * as React from "react";

export type Tone = "neutral" | "teal" | "emerald" | "amber" | "violet" | "slate";

export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm " +
    "leading-none select-none";

  // Light mode is the primary look right now (clean, airy).
  // Dark mode classes are still included but not the focus.
  const tones: Record<Tone, string> = {
    neutral: "border-slate-200 bg-white text-slate-800",
    teal: "border-teal-200 bg-teal-50 text-teal-900 shadow-[0_0_0_1px_rgba(20,184,166,0.08)]",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-[0_0_0_1px_rgba(16,185,129,0.08)]",
    amber: "border-amber-200 bg-amber-50 text-amber-900 shadow-[0_0_0_1px_rgba(245,158,11,0.10)]",
    violet:
      "border-violet-200 bg-violet-50 text-violet-900 shadow-[0_0_0_1px_rgba(139,92,246,0.10)]",
    slate: "border-slate-200 bg-slate-50 text-slate-900 shadow-[0_0_0_1px_rgba(148,163,184,0.10)]",
  };

  return <span className={`${base} ${tones[tone]} ${className}`}>{children}</span>;
}

export function IconPill({
  tone = "slate",
  className = "",
  title,
}: {
  tone?: Tone;
  className?: string;
  title?: string;
}) {
  const dot: Record<Tone, string> = {
    neutral: "bg-slate-500",
    teal: "bg-teal-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
    slate: "bg-slate-500",
  };

  return (
    <span
      title={title}
      className={
        "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold shadow-sm " +
        className
      }
    >
      <span className={`h-2 w-2 rounded-full ${dot[tone]} opacity-80`} />
    </span>
  );
}
TS

# -----------------------------
# 2) Surface (cards/panels)
# -----------------------------
cat > "$UI_DIR/Surface.tsx" <<'TS'
import * as React from "react";

export function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_16px_45px_rgba(2,6,23,0.06)] " +
        className
      }
    >
      {children}
    </div>
  );
}
TS

# -----------------------------
# 3) Topbar
# -----------------------------
cat > "$UI_DIR/Topbar.tsx" <<'TS'
import Link from "next/link";
import { Pill } from "./Pill";

export function Topbar({
  rightPrimaryHref = "/practice",
  rightPrimaryLabel = "Open Practice",
  rightSecondaryHref = "/teacher/dashboard",
  rightSecondaryLabel = "Teacher",
}: {
  rightPrimaryHref?: string;
  rightPrimaryLabel?: string;
  rightSecondaryHref?: string;
  rightSecondaryLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-900">
            IA
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">interactive-assess</div>
            <div className="text-xs text-slate-600">STAAR Biology • interactive items • practice + test</div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Pill tone="violet">STAAR aligned</Pill>
          <Pill tone="teal">Interactive</Pill>
          <Pill tone="amber">Practice/Test</Pill>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={rightPrimaryHref}
            className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
          >
            {rightPrimaryLabel}
          </Link>
          <Link
            href={rightSecondaryHref}
            className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
          >
            {rightSecondaryLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
TS

# -----------------------------
# 4) Sidebar + NavItem
# -----------------------------
cat > "$UI_DIR/Sidebar.tsx" <<'TS'
import Link from "next/link";
import { IconPill, Tone } from "./Pill";
import { Surface } from "./Surface";

export function NavItem({
  href,
  label,
  active,
  tone = "slate",
}: {
  href: string;
  label: string;
  active?: boolean;
  tone?: Tone;
}) {
  return (
    <Link
      href={href}
      className={
        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm font-semibold transition " +
        (active
          ? "border-slate-200 bg-slate-50"
          : "border-slate-200 bg-white/70 hover:bg-white")
      }
    >
      <span className="truncate text-slate-900">{label}</span>
      <IconPill tone={tone} title={label} />
    </Link>
  );
}

export function Sidebar({
  activeKey,
}: {
  activeKey?: "assessment" | "student_lab" | "items" | "practice" | "teacher";
}) {
  return (
    <Surface className="p-4">
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-900">Navigation</div>
        <div className="mt-1 text-xs text-slate-600">Jump between roles and test screens.</div>
      </div>

      <div className="grid gap-2">
        <NavItem href="/assessment" label="Assessment Home" tone="slate" active={activeKey === "assessment"} />
        <NavItem
          href="/student/assessment"
          label="Student Assessment Lab"
          tone="teal"
          active={activeKey === "student_lab"}
        />
        <NavItem
          href="/student/assessment/items"
          label="Items Test Screen"
          tone="emerald"
          active={activeKey === "items"}
        />
        <NavItem href="/practice" label="Practice Runner" tone="amber" active={activeKey === "practice"} />
        <NavItem href="/teacher/dashboard" label="Teacher Dashboard" tone="slate" active={activeKey === "teacher"} />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-semibold text-slate-700">Status</div>
        <div className="mt-2 text-sm text-slate-900">
          <span className="font-semibold">Mode:</span> prototype
        </div>
        <div className="mt-1 text-sm text-slate-900">
          <span className="font-semibold">Next build:</span> Inline Choice first-class
        </div>
      </div>
    </Surface>
  );
}
TS

# -----------------------------
# 5) AppShell (full page layout)
# -----------------------------
cat > "$UI_DIR/AppShell.tsx" <<'TS'
import * as React from "react";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

export function AppShell({
  activeKey,
  children,
}: {
  activeKey?: "assessment" | "student_lab" | "items" | "practice" | "teacher";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42vh] bg-[radial-gradient(520px_260px_at_18%_18%,rgba(20,184,166,0.06),transparent),radial-gradient(520px_260px_at_78%_22%,rgba(245,158,11,0.05),transparent),radial-gradient(640px_320px_at_52%_80%,rgba(139,92,246,0.04),transparent)]" />
      <Topbar />
      <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]">
        <aside>
          <Sidebar activeKey={activeKey} />
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
TS

# -----------------------------
# 6) Refactor /assessment to use AppShell + components
# -----------------------------
ASMT="$APP_ROOT/assessment/page.tsx"
backup "$ASMT"

cat > "$ASMT" <<'TS'
"use client";

import Link from "next/link";
import { AppShell } from "@/components/ia/AppShell";
import { Pill } from "@/components/ia/Pill";
import { Surface } from "@/components/ia/Surface";

function ActionCard({
  href,
  title,
  desc,
  chips,
  accent,
}: {
  href: string;
  title: string;
  desc: string;
  chips: string[];
  accent: "teal" | "slate" | "amber" | "violet" | "emerald";
}) {
  const accentBar =
    accent === "teal"
      ? "bg-teal-500"
      : accent === "amber"
      ? "bg-amber-500"
      : accent === "violet"
      ? "bg-violet-500"
      : accent === "emerald"
      ? "bg-emerald-500"
      : "bg-slate-500";

  const accentWash =
    accent === "teal"
      ? "from-teal-500/10"
      : accent === "amber"
      ? "from-amber-500/10"
      : accent === "violet"
      ? "from-violet-500/10"
      : accent === "emerald"
      ? "from-emerald-500/10"
      : "from-slate-500/10";

  const chipCycle: Array<"teal" | "emerald" | "amber" | "violet" | "slate"> = [
    "teal",
    "emerald",
    "amber",
    "violet",
    "slate",
  ];

  return (
    <Link
      href={href}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_16px_45px_rgba(2,6,23,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(2,6,23,0.08)]">
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${accentWash} to-transparent`} />
        <div className={`pointer-events-none absolute left-0 top-0 h-full w-[6px] ${accentBar}`} />

        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-700">{desc}</p>
          </div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 text-lg text-slate-900 transition group-hover:bg-white">
            →
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <Pill key={c} tone={chipCycle[i % chipCycle.length]}>
              {c}
            </Pill>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function AssessmentDashboardEntry() {
  return (
    <AppShell activeKey="assessment">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Assessment</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-700">
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
        <Surface className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Quick actions</div>
              <div className="mt-1 text-xs text-slate-600">Handy jumps while you’re building and testing.</div>
            </div>
            <Pill tone="slate">shortcuts</Pill>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/practice"
              className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Practice Runner
            </Link>
            <Link
              href="/student/assessment/items"
              className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Items Test Screen
            </Link>
            <Link
              href="/student/assessment"
              className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Student Lab
            </Link>
          </div>
        </Surface>

        <Surface className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">What’s next</div>
            <Pill tone="amber">roadmap</Pill>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-800">
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
          <div className="mt-4 text-xs text-slate-600">
            Tip: once we add auth, this page becomes the smart gate that routes by role automatically.
          </div>
        </Surface>
      </div>
    </AppShell>
  );
}
TS

echo "✅ Extracted UI components into: $UI_DIR"
echo "✅ Refactored: $ASMT"

# -----------------------------
# 7) Wrap a couple key pages (best-effort)
# -----------------------------
wrap_page() {
  local PAGE="$1"
  local ACTIVE="$2"
  [ -f "$PAGE" ] || return 0

  backup "$PAGE"

  python - <<PY
from pathlib import Path
import re

p = Path(r"$PAGE")
s = p.read_text(encoding="utf-8")

# Add use client if missing and if file uses hooks; we won't guess.
# We'll only add AppShell wrapper in a safe way: replace outer <main ...>...</main> with <AppShell>...</AppShell>
# If not found, we leave it alone.
if "AppShell" not in s:
  s = re.sub(r'from "next/link";', 'from "next/link";\\nimport { AppShell } from "@/components/ia/AppShell";', s, count=1)

# Replace first <main ...> with <AppShell ...><main ... className="space-y-6"> and close before final </main>
m = re.search(r"<main[^>]*>", s)
if not m:
  p.write_text(s, encoding="utf-8")
  print("⚠️ skip (no <main>):", p)
  raise SystemExit

# Ensure main spacing is consistent
s = re.sub(r"<main([^>]*)className=\"([^\"]*)\"([^>]*)>",
           lambda mm: f'<main{mm.group(1)}className="space-y-6 {mm.group(2)}"{mm.group(3)}>',
           s, count=1)

# Wrap the first <main ...> ... </main> block
s = re.sub(r"(<main[\\s\\S]*?</main>)", r'<AppShell activeKey="$ACTIVE">\\1</AppShell>', s, count=1)

p.write_text(s, encoding="utf-8")
print("✅ wrapped:", p)
PY
}

PRACTICE_PAGE="$APP_ROOT/practice/page.tsx"
TEACH_DASH="$APP_ROOT/teacher/dashboard/page.tsx"
wrap_page "$PRACTICE_PAGE" "practice" || true
wrap_page "$TEACH_DASH" "teacher" || true

echo ""
echo "🎯 Done."
echo "Next:"
echo "  pnpm --filter web dev -p 3010   (or 3011 if 3010 is busy)"
echo "  Hard refresh: Ctrl+Shift+R"
