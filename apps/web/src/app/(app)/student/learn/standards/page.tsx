"use client";

import { useMemo } from "react";
import { BackLink } from "@/components/nav/BackLink";
import { buildTeksHeatmap, getWeakestTeks } from "@/lib/learningInsights";
import { loadLearningProgress } from "@/lib/learningProgress";

const tone: Record<string, string> = {
  mastered: "border-emerald-200 bg-emerald-50 text-emerald-900",
  developing: "border-amber-200 bg-amber-50 text-amber-900",
  "needs-support": "border-rose-200 bg-rose-50 text-rose-900",
};

export default function StandardsHeatmapPage() {
  const progress = useMemo(() => loadLearningProgress(), []);
  const rows = useMemo(() => buildTeksHeatmap(progress), [progress]);
  const weakest = useMemo(() => getWeakestTeks(progress, 3), [progress]);

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-900">
      <BackLink href="/student/learn" label="Back to hub" />
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Standards Heatmap</h1>
          <p className="mt-1 text-sm text-slate-600">
            Track TEKS-level mastery and target weak standards first.
          </p>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">
          Weakest 3 Standards
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {weakest.map((row) => (
            <div
              key={row.teks}
              className={`rounded-2xl border p-3 text-sm ${tone[row.proficiency]}`}
            >
              <div className="font-semibold">{row.teks}</div>
              <div className="mt-1 text-xs">Avg check: {row.avgCheck}%</div>
              <div className="text-xs">Completion: {row.completionPct}%</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">TEKS</th>
                <th className="py-2 pr-3">Lessons</th>
                <th className="py-2 pr-3">Avg Check</th>
                <th className="py-2 pr-3">Completion</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.teks} className="border-b border-slate-100">
                  <td className="py-2 pr-3 font-semibold">{row.teks}</td>
                  <td className="py-2 pr-3">{row.lessons}</td>
                  <td className="py-2 pr-3">{row.avgCheck}%</td>
                  <td className="py-2 pr-3">{row.completionPct}%</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${tone[row.proficiency]}`}
                    >
                      {row.proficiency.replace("-", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
