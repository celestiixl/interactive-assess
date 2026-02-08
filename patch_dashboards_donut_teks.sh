#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/interactive-assess || exit 1
STAMP="$(date +%Y%m%d_%H%M%S)"

WEB="apps/web/src"
APP="apps/web/src/app"
COMP="$WEB/components"
LIB="$WEB/lib"

mkdir -p "$LIB" "$COMP/analytics" "$APP/student/dashboard"

echo "== backups =="
for f in \
  "$APP/teacher/dashboard/page.tsx" \
  "$APP/student/dashboard/page.tsx" \
  "$APP/teacher/builder/page.tsx" \
; do
  [[ -f "$f" ]] && cp -v "$f" "$f.bak_dash_donut_$STAMP"
done

echo "== lib/reportingCategories.ts =="
cat > "$LIB/reportingCategories.ts" <<'MAP'
export type ReportingCategory = {
  id: "RC1" | "RC2" | "RC3" | "RC4";
  name: string;
  description: string;
  teks: string[];
};

export const REPORTING_CATEGORIES: ReportingCategory[] = [
  { id: "RC1", name: "Cell Structure & Function", description: "Cells, biomolecules, organelles, membranes, transport.", teks: ["BIO.5A","BIO.5B","BIO.5C","BIO.5D","BIO.5E"] },
  { id: "RC2", name: "Mechanisms of Genetics", description: "DNA/RNA, protein synthesis, inheritance, mutations.", teks: ["BIO.6A","BIO.6B","BIO.7A","BIO.7B"] },
  { id: "RC3", name: "Biological Evolution & Classification", description: "Evidence of evolution, natural selection, classification.", teks: ["BIO.9A","BIO.9B","BIO.9C"] },
  { id: "RC4", name: "Biological Processes & Systems", description: "Energy flow, respiration/photosynthesis, systems, ecology.", teks: ["BIO.8A","BIO.8B","BIO.10A","BIO.10B"] },
];

export function teksToRc(teksCode: string): ReportingCategory["id"] | null {
  const code = teksCode.trim().toUpperCase();
  for (const rc of REPORTING_CATEGORIES) {
    if (rc.teks.map((t) => t.toUpperCase()).includes(code)) return rc.id;
  }
  return null;
}
MAP

echo "== components/analytics/ReportingCategoryDonut.tsx =="
cat > "$COMP/analytics/ReportingCategoryDonut.tsx" <<'DONUT'
"use client";
import React, { useMemo, useState } from "react";
import { REPORTING_CATEGORIES } from "@/lib/reportingCategories";

type Props = {
  masteryByRc?: Partial<Record<"RC1" | "RC2" | "RC3" | "RC4", number>>;
  size?: number;
};

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export default function ReportingCategoryDonut({ masteryByRc, size = 220 }: Props) {
  const [hoverId, setHoverId] = useState<"RC1" | "RC2" | "RC3" | "RC4" | null>(null);

  const data = useMemo(() => {
    return REPORTING_CATEGORIES.map((rc) => {
      const v = clamp01(masteryByRc?.[rc.id] ?? 0);
      return { ...rc, value: v };
    });
  }, [masteryByRc]);

  const r = 84;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 18;
  const gap = 0.008;

  const total = data.reduce((a, b) => a + b.value, 0);
  const avg = data.length ? total / data.length : 0;

  const colors: Record<string, string> = {
    RC1: "#2F8F6B",
    RC2: "#2B6CB0",
    RC3: "#7C3AED",
    RC4: "#B7791F",
  };

  let startTurn = 0;
  const segments = data.map((rc) => {
    const seg = { rc, start: startTurn, end: startTurn + rc.value };
    startTurn += rc.value;
    return seg;
  });

  const hovered = hoverId ? data.find((d) => d.id === hoverId) : null;

  function arcPath(start: number, end: number) {
    const a0 = (start * 2 * Math.PI) - Math.PI / 2;
    const a1 = (end * 2 * Math.PI) - Math.PI / 2;

    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);

    const large = (end - start) > 0.5 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-lg font-semibold text-slate-900">Mastery by Reporting Category</div>
      <div className="mt-1 text-sm text-slate-600">Hover a slice to see details.</div>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
            {segments.map(({ rc, start, end }) => {
              const s = start + gap;
              const e = Math.max(s, end - gap);
              if (rc.value <= 0) return null;
              const isHover = hoverId === rc.id;
              return (
                <path
                  key={rc.id}
                  d={arcPath(s, e)}
                  fill="none"
                  stroke={colors[rc.id]}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  opacity={isHover ? 1 : 0.9}
                  onMouseEnter={() => setHoverId(rc.id)}
                  onMouseLeave={() => setHoverId(null)}
                  style={{ cursor: "default" }}
                />
              );
            })}
            <text x={cx} y={cy - 2} textAnchor="middle" className="fill-slate-900" style={{ fontSize: 22, fontWeight: 700 }}>
              {Math.round(avg * 100)}%
            </text>
            <text x={cx} y={cy + 20} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 12 }}>
              average mastery
            </text>
          </svg>

          {hovered ? (
            <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
              <div className="font-semibold text-slate-900">{hovered.id} • {hovered.name}</div>
              <div className="text-slate-700">{Math.round(hovered.value * 100)}% mastery</div>
            </div>
          ) : null}
        </div>

        <div className="flex-1 grid gap-3">
          {data.map((rc) => (
            <div
              key={rc.id}
              className="rounded-xl border border-slate-200 p-3"
              onMouseEnter={() => setHoverId(rc.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{rc.id} • {rc.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{rc.description}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-semibold text-slate-900">{Math.round(rc.value * 100)}%</div>
                  <div className="text-xs text-slate-600">mastery</div>
                </div>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full" style={{ width: `${Math.round(rc.value * 100)}%`, backgroundColor: colors[rc.id] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
DONUT

echo "== patch teacher dashboard create-assessment link + embed donut + teks list =="
TD="$APP/teacher/dashboard/page.tsx"
if [[ -f "$TD" ]]; then
  perl -pi -e 's/href="\/practice"/href="\/teacher\/builder"/g' "$TD"
  if ! rg -q 'ReportingCategoryDonut' "$TD"; then
    perl -0777 -pi -e 's/(export default function TeacherDashboard\(\)\s*\{)/import ReportingCategoryDonut from "@\/components\/analytics\/ReportingCategoryDonut";\nimport { REPORTING_CATEGORIES } from "@\/lib\/reportingCategories";\n\n$1/s' "$TD"
  fi
  if ! rg -q 'TEKS Alignment to Reporting Categories' "$TD"; then
    perl -0777 -pi -e 's/(<\/section>)/$1\n\n<section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">\n  <div>\n    <ReportingCategoryDonut masteryByRc={{ RC1: 0, RC2: 0, RC3: 0, RC4: 0 }} />\n  </div>\n  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">\n    <div className="text-lg font-semibold text-slate-900">TEKS Alignment to Reporting Categories</div>\n    <div className="mt-1 text-sm text-slate-600">Edit: <code className="rounded bg-slate-100 px-1 py-0.5">apps/web/src/lib/reportingCategories.ts</code></div>\n    <div className="mt-4 grid gap-3">\n      {REPORTING_CATEGORIES.map((rc) => (\n        <div key={rc.id} className="rounded-xl border border-slate-200 p-3">\n          <div className="font-semibold text-slate-900">{rc.id} • {rc.name}</div>\n          <div className="mt-2 flex flex-wrap gap-2">\n            {rc.teks.map((t) => (\n              <span key={t} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">{t}</span>\n            ))}\n          </div>\n        </div>\n      ))}\n    </div>\n  </div>\n</section>\n/s' "$TD"
  fi
fi

echo "== create student dashboard route (if missing) =="
SD="$APP/student/dashboard/page.tsx"
if [[ ! -f "$SD" ]]; then
  mkdir -p "$APP/student/dashboard"
  cat > "$SD" <<'STU'
import ReportingCategoryDonut from "@/components/analytics/ReportingCategoryDonut";
import { REPORTING_CATEGORIES } from "@/lib/reportingCategories";

export default function StudentDashboard() {
  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Student Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Practice by reporting category and track your mastery.
            </p>
          </div>

          <a
            href="/practice"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-semibold shadow-sm hover:bg-emerald-700"
          >
            Start Practice
          </a>
        </div>

        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <ReportingCategoryDonut masteryByRc={{ RC1: 0, RC2: 0, RC3: 0, RC4: 0 }} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-lg font-semibold text-slate-900">TEKS Alignment to Reporting Categories</div>
            <div className="mt-1 text-sm text-slate-600">Standards practiced inside each category.</div>

            <div className="mt-4 grid gap-3">
              {REPORTING_CATEGORIES.map((rc) => (
                <div key={rc.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="font-semibold text-slate-900">{rc.id} • {rc.name}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rc.teks.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
STU
fi

echo "✅ patch complete"
echo "Restart:"
echo "  rm -rf apps/web/.next"
echo "  (fuser -k 3002/tcp 2>/dev/null || true); (lsof -ti tcp:3002 | xargs -r kill -9 2>/dev/null || true)"
echo "  HOSTNAME=0.0.0.0 PORT=3002 pnpm --filter web dev"
