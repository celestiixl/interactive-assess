"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildLearningFunnel, buildStuckPoints } from "@/lib/learningInsights";
import { loadLearningProgress } from "@/lib/learningProgress";

export default function TeacherLearningAnalyticsPage() {
  const progress = useMemo(() => loadLearningProgress(), []);
  const funnel = useMemo(() => buildLearningFunnel(progress), [progress]);
  const stuck = useMemo(() => buildStuckPoints(progress, 6), [progress]);

  const startedPct = funnel.totalLessons
    ? Math.round((funnel.started / funnel.totalLessons) * 100)
    : 0;
  const checkedPct = funnel.totalLessons
    ? Math.round((funnel.checked / funnel.totalLessons) * 100)
    : 0;
  const completePct = funnel.totalLessons
    ? Math.round((funnel.completed / funnel.totalLessons) * 100)
    : 0;

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-slate-900">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Learning Analytics</h1>
            <p className="mt-1 text-sm text-slate-600">
              Completion funnel, check behavior, and stuck-point analysis.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/teacher/learning-analytics/weekly-digest"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
            >
              Weekly Digest
            </Link>
            <Link
              href="/teacher/dashboard"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Total Lessons</div>
          <div className="mt-1 text-2xl font-bold">{funnel.totalLessons}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Started</div>
          <div className="mt-1 text-2xl font-bold">{startedPct}%</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Checked</div>
          <div className="mt-1 text-2xl font-bold">{checkedPct}%</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-slate-500">Completed</div>
          <div className="mt-1 text-2xl font-bold">{completePct}%</div>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Stuck Points</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {stuck.length === 0 ? (
            <div className="text-sm text-slate-500">No stuck points yet.</div>
          ) : (
            stuck.map((row) => (
              <Link
                key={row.lessonId}
                href={row.href}
                className="rounded-2xl border border-amber-200 bg-amber-50 p-3 hover:bg-amber-100"
              >
                <div className="text-sm font-semibold text-amber-900">
                  {row.lessonTitle}
                </div>
                <div className="text-xs text-amber-800">
                  Avg score: {row.avgScore}% • Attempts: {row.attempts}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
