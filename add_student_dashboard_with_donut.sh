#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || { echo "❌ repo not found"; exit 1; }

# detect Next App Router root
if [ -d apps/web/src/app ]; then
  APP="apps/web/src/app"
elif [ -d apps/web/app ]; then
  APP="apps/web/app"
else
  echo "❌ can't find Next app router at apps/web/src/app or apps/web/app"
  exit 1
fi
echo "✅ APP=$APP"

# find Student Assessment Lab page (the screen in your screenshot)
LAB_PAGE=""
for p in \
  "$APP/(app)/student/assessment/page.tsx" \
  "$APP/(app)/student/assessment-lab/page.tsx" \
  "$APP/(app)/student/assess/page.tsx" \
  "$APP/student/assessment/page.tsx" \
  "$APP/student/assess/page.tsx"
do
  if [ -f "$p" ]; then LAB_PAGE="$p"; break; fi
done

if [ -z "$LAB_PAGE" ]; then
  echo "⚠️ couldn't auto-find the Student Assessment Lab page."
  echo "   Run: find $APP -maxdepth 6 -type f -name page.tsx | rg 'student/(assess|assessment)'"
  exit 1
fi
echo "✅ LAB_PAGE=$LAB_PAGE"

ts="$(date +%Y%m%d_%H%M%S)"
cp -a "$LAB_PAGE" "$LAB_PAGE.bak.$ts"
echo "✅ backup -> $LAB_PAGE.bak.$ts"

# -------------------------------------------------------------------
# 1) Add MasteryDonut component (pure SVG, no deps)
# -------------------------------------------------------------------
mkdir -p apps/web/src/components/student

cat > apps/web/src/components/student/MasteryDonut.tsx <<'TSX'
"use client";

import { useMemo, useState } from "react";

type Segment = {
  key: string;   // e.g. "RC1"
  label: string; // e.g. "Cell Structure & Function"
  value: number; // 0..100
  colorClass: string; // tailwind text-* for stroke
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function MasteryDonut({
  segments,
  size = 220,
  stroke = 18,
}: {
  segments: Segment[];
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const total = useMemo(() => {
    const sum = segments.reduce((a, s) => a + s.value, 0);
    return sum <= 0 ? 1 : sum;
  }, [segments]);

  const normalized = useMemo(() => {
    // convert each segment into fraction of the ring
    return segments.map((s) => ({
      ...s,
      frac: clamp01(s.value / total),
    }));
  }, [segments, total]);

  // build stroke offsets
  let acc = 0;

  const active =
    (hoverKey && segments.find((s) => s.key === hoverKey)) || null;

  const overall = Math.round(
    segments.reduce((a, s) => a + s.value, 0) / segments.length
  );

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-700">Personal mastery</div>
          <div className="text-xs text-slate-500">
            Hover a slice to see the reporting category.
          </div>
        </div>
        <div className="rounded-full border bg-white px-3 py-1 text-sm font-semibold text-slate-800">
          {active ? `${active.key}: ${active.value}%` : `Overall: ${overall}%`}
        </div>
      </div>

      <div className="relative w-fit">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {/* track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              className="stroke-slate-200"
            />
            {/* segments */}
            {normalized.map((s) => {
              const segLen = c * s.frac;
              const dasharray = `${segLen} ${c - segLen}`;
              const dashoffset = -acc;
              acc += segLen;

              const isActive = hoverKey === s.key;

              return (
                <circle
                  key={s.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={dasharray}
                  strokeDashoffset={dashoffset}
                  className={`${s.colorClass} transition-opacity ${hoverKey && !isActive ? "opacity-40" : "opacity-100"}`}
                  onMouseEnter={() => setHoverKey(s.key)}
                  onMouseLeave={() => setHoverKey(null)}
                />
              );
            })}
          </g>

          {/* center */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r - stroke * 0.6}
            className="fill-white"
          />
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            className="fill-slate-900"
            fontSize="24"
            fontWeight="700"
          >
            {active ? active.key : `${overall}%`}
          </text>
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            className="fill-slate-500"
            fontSize="12"
          >
            {active ? active.label : "mastery"}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {segments.map((s) => (
          <button
            key={s.key}
            className="rounded-lg border bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
            onMouseEnter={() => setHoverKey(s.key)}
            onMouseLeave={() => setHoverKey(null)}
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900">{s.key}</div>
              <div className="text-slate-600">{s.value}%</div>
            </div>
            <div className="mt-1 text-xs text-slate-500 line-clamp-2">
              {s.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
TSX

echo "✅ wrote MasteryDonut component"

# -------------------------------------------------------------------
# 2) Create Demo Student Dashboard page
# -------------------------------------------------------------------
mkdir -p "$APP/(app)/student/dashboard"

cat > "$APP/(app)/student/dashboard/page.tsx" <<'PAGE'
import Link from "next/link";
import { MasteryDonut } from "@/components/student/MasteryDonut";

export default function StudentDashboard() {
  // demo data (we'll wire real stats later)
  const segments = [
    { key: "RC1", label: "Cell Structure & Function", value: 62, colorClass: "stroke-emerald-500" },
    { key: "RC2", label: "Mechanisms of Genetics", value: 48, colorClass: "stroke-sky-500" },
    { key: "RC3", label: "Biological Evolution & Classification", value: 71, colorClass: "stroke-violet-500" },
    { key: "RC4", label: "Biological Processes & Systems", value: 39, colorClass: "stroke-amber-500" },
  ];

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Student Dashboard</h1>
            <p className="mt-1 text-slate-600">
              Your personal mastery tracker (demo).
            </p>
          </div>
          <Link href="/student/assessment" className="ia-btn text-sm">
            Back to Assessment Lab
          </Link>
        </div>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <MasteryDonut segments={segments} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">Next best step</div>
            <div className="mt-2 text-sm text-slate-600">
              Focus on RC4 practice sets (lowest mastery).
            </div>
            <div className="mt-4 flex gap-2">
              <Link className="ia-btn-primary text-sm" href="/practice?rc=RC4%20%E2%80%A2%20Biological%20Processes%20%26%20Systems">
                Practice RC4
              </Link>
              <Link className="ia-btn text-sm" href="/practice?rc=RC1%20%E2%80%A2%20Cell%20Structure%20%26%20Function">
                Practice RC1
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">Streak</div>
            <div className="mt-2 text-2xl font-semibold">3 days</div>
            <div className="mt-1 text-sm text-slate-600">Keep going.</div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">Accuracy</div>
            <div className="mt-2 text-2xl font-semibold">74%</div>
            <div className="mt-1 text-sm text-slate-600">Last 20 checks (demo).</div>
          </div>
        </section>
      </div>
    </main>
  );
}
PAGE

echo "✅ wrote $APP/(app)/student/dashboard/page.tsx"

# -------------------------------------------------------------------
# 3) Patch Student Assessment Lab page:
#    - add a "Student Dashboard" card/link
#    - lighten background to match main style
# -------------------------------------------------------------------

# 3a) ensure there's a quick action card
# insert a third card under existing grid if it exists; otherwise add a simple button row.
perl -0777 -i -pe '
  # lighten page if it uses a dark bg class like bg-slate-950 / bg-black
  s/bg-slate-950/bg-slate-50/g;
  s/bg-black/bg-slate-50/g;
  s/text-white/text-slate-900/g;

  # if it has "Assessment Lab" heading area, add a button to dashboard near top
  if ($_ !~ /href="\/student\/dashboard"/) {
    s|(Assessment Lab[^<]*</h1>\s*<p[^>]*>.*?</p>)|$1\n\n<div className="mt-5 flex flex-wrap gap-2">\n  <a href="/student/dashboard" className="ia-btn-primary text-sm">Open Student Dashboard</a>\n</div>|s;
  }

  # also add a card if the page already has a 2-card grid
  if ($_ !~ /Student Dashboard.*Personal mastery tracker/s) {
    s|(<div className="[^"]*grid[^"]*"[^>]*>\s*)(<[^>]+>.*?Demo Student Practice Runner.*?</[^>]+>\s*<[^>]+>.*?Interactive Items Test Screen.*?</[^>]+>)|$1$2\n\n  <a href="/student/dashboard" className="block rounded-2xl border bg-white p-6 shadow-sm hover:bg-slate-50">\n    <div className="flex items-center justify-between">\n      <div>\n        <div className="text-sm font-semibold text-slate-900">Student Dashboard (demo)</div>\n        <div className="mt-1 text-sm text-slate-600">Personal mastery donut + next steps.</div>\n      </div>\n      <span className="text-slate-400">→</span>\n    </div>\n  </a>|s;
  }
' "$LAB_PAGE"

echo "✅ patched LAB_PAGE to add Student Dashboard link + lighter styling"

echo "== done =="
echo "Open: /student/dashboard"
echo "And Assessment Lab now has a button/card linking to it."
