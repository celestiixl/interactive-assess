"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { LEARNING_UNITS } from "@/lib/learningHubContent";

export default function StudentLearningHubPage() {
  const [unitIndex, setUnitIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const activeUnit = LEARNING_UNITS[unitIndex] ?? LEARNING_UNITS[0];

  const completedInUnit = useMemo(
    () =>
      activeUnit.lessons.filter((lesson) =>
        completedLessonIds.includes(lesson.id),
      ).length,
    [activeUnit, completedLessonIds],
  );

  const unitProgress = Math.round(
    (completedInUnit / activeUnit.lessons.length) * 100,
  );

  function toggleLesson(lessonId: string) {
    setCompletedLessonIds((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId],
    );
  }

  return (
    <main className="ia-vh-page relative min-h-dvh px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <div className="mx-auto grid w-full max-w-6xl gap-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Learning Hub
              </div>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Readings, Lectures, and Textbook Notes
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                This hub is for learning content first. Practice and assessments
                stay in their own separate flows.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/practice"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Go to Practice
              </Link>
              <Link
                href="/student/assessment"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Go to Assessments
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Units</div>
            <div className="mt-3 space-y-2">
              {LEARNING_UNITS.map((unit, index) => {
                const isActive = index === unitIndex;
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => setUnitIndex(index)}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-sm font-semibold">{unit.title}</div>
                    <div
                      className={`mt-1 text-xs ${
                        isActive ? "text-white/80" : "text-slate-500"
                      }`}
                    >
                      {unit.teks.join(" • ")}
                    </div>
                    <div
                      className={`mt-2 text-xs font-semibold ${
                        isActive ? "text-white/90" : "text-blue-700"
                      }`}
                    >
                      Open Unit →
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {activeUnit.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Objective: {activeUnit.objective}
                </p>
              </div>

              <div className="min-w-[220px]">
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Unit Progress</span>
                  <span>{unitProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${unitProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {activeUnit.lessons.map((lesson) => {
                const complete = completedLessonIds.includes(lesson.id);
                return (
                  <article
                    key={lesson.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {lesson.type} • {lesson.minutes} min
                        </div>
                        <h3 className="mt-1 text-base font-semibold text-slate-900">
                          {lesson.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {lesson.summary}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleLesson(lesson.id)}
                          className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            complete
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                          }`}
                        >
                          {complete ? "Completed" : "Mark Complete"}
                        </button>
                        <Link
                          href={`/student/learn/${activeUnit.id}/${lesson.slug}`}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          Open Lesson
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="mt-4">
              <Link
                href={`/student/learn/${activeUnit.id}`}
                className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Open Full Unit Page →
              </Link>
            </div>
          </section>
        </div>
      </div>

      <StudentFloatingDock />
      <ThemeToggle />
    </main>
  );
}
