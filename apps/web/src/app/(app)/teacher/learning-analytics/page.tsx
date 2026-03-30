"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BackLink } from "@/components/nav/BackLink";
import { buildLearningFunnel, buildStuckPoints } from "@/lib/learningInsights";
import { loadLearningProgress } from "@/lib/learningProgress";
import TeacherNotebookPeek from "@/components/teacher/TeacherNotebookPeek";
import { loadStudentProfile } from "@/lib/studentProfile";

export default function TeacherLearningAnalyticsPage() {
  const progress = useMemo(() => loadLearningProgress(), []);
  const funnel = useMemo(() => buildLearningFunnel(progress), [progress]);
  const stuck = useMemo(() => buildStuckPoints(progress, 6), [progress]);
  const studentId = useMemo(() => {
    try {
      const profile = loadStudentProfile();
      return profile.name || "anonymous";
    } catch {
      return "anonymous";
    }
  }, []);

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
    <main className="mx-auto w-full max-w-6xl p-6 text-bs-text">
      <BackLink href="/teacher/dashboard" label="Back to dashboard" />
      <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Learning Analytics</h1>
            <p className="mt-1 text-sm text-bs-text-sub">
              Completion funnel, check behavior, and stuck-point analysis.
            </p>
          </div>
          <Link
            href="/teacher/learning-analytics/weekly-digest"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40"
          >
            Weekly Digest
          </Link>
        </div>
      </section>

      <section className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
          <div className="text-xs text-bs-text-sub">Total Lessons</div>
          <div className="mt-1 text-2xl font-bold">{funnel.totalLessons}</div>
        </div>
        <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
          <div className="text-xs text-bs-text-sub">Started</div>
          <div className="mt-1 text-2xl font-bold">{startedPct}%</div>
        </div>
        <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
          <div className="text-xs text-bs-text-sub">Checked</div>
          <div className="mt-1 text-2xl font-bold">{checkedPct}%</div>
        </div>
        <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
          <div className="text-xs text-bs-text-sub">Completed</div>
          <div className="mt-1 text-2xl font-bold">{completePct}%</div>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-bs-text">Stuck Points</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {stuck.length === 0 ? (
            <div className="text-sm text-bs-text-sub">No stuck points yet.</div>
          ) : (
            stuck.map((row) => (
              <div key={row.lessonId} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <Link
                  href={row.href}
                  className="block hover:underline"
                >
                  <div className="text-sm font-semibold text-amber-900">
                    {row.lessonTitle}
                  </div>
                  <div className="text-xs text-amber-800">
                    Avg score: {row.avgScore}% • Attempts: {row.attempts}
                  </div>
                </Link>
                <TeacherNotebookPeek
                  studentId={studentId}
                  lessonSlug={row.lessonSlug}
                  lessonTitle={row.lessonTitle}
                />
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
