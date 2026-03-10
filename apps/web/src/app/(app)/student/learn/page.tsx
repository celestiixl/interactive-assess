"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { LEARNING_UNITS } from "@/lib/learningHubContent";
import {
  getMostRecentLessonId,
  loadLearningProgress,
  type LearningProgressMap,
} from "@/lib/learningProgress";
import { loadLearningSettings } from "@/lib/learningSettings";
import {
  buildInterventionQueue,
  buildTeksHeatmap,
  isLessonUnlocked,
} from "@/lib/learningInsights";

export default function StudentLearningHubPage() {
  const [gradingPeriodFilter, setGradingPeriodFilter] = useState<
    0 | 1 | 2 | 3 | 4
  >(0);
  const [progress, setProgress] = useState<LearningProgressMap>({});
  const [visibleUnitIds, setVisibleUnitIds] = useState<string[]>(
    LEARNING_UNITS.map((u) => u.id),
  );

  useEffect(() => {
    setProgress(loadLearningProgress());
    setVisibleUnitIds(
      loadLearningSettings(LEARNING_UNITS.map((unit) => unit.id))
        .visibleUnitIds,
    );
  }, []);

  const allVisibleUnits = useMemo(
    () => LEARNING_UNITS.filter((unit) => visibleUnitIds.includes(unit.id)),
    [visibleUnitIds],
  );

  const filteredUnits = useMemo(
    () =>
      allVisibleUnits.filter((unit) =>
        gradingPeriodFilter === 0
          ? true
          : unit.gradingPeriod === gradingPeriodFilter,
      ),
    [allVisibleUnits, gradingPeriodFilter],
  );

  const totalLessons = useMemo(
    () => allVisibleUnits.reduce((acc, unit) => acc + unit.lessons.length, 0),
    [allVisibleUnits],
  );

  const completedLessons = useMemo(
    () =>
      allVisibleUnits.reduce(
        (acc, unit) =>
          acc +
          unit.lessons.filter((lesson) =>
            Boolean(progress[lesson.id]?.completed),
          ).length,
        0,
      ),
    [allVisibleUnits, progress],
  );

  const recentLessonId = useMemo(
    () => getMostRecentLessonId(progress),
    [progress],
  );

  const continueLesson = useMemo(() => {
    if (!recentLessonId) return null;
    for (const unit of allVisibleUnits) {
      const lesson = unit.lessons.find((entry) => entry.id === recentLessonId);
      if (lesson) {
        return {
          unit,
          lesson,
        };
      }
    }
    return null;
  }, [allVisibleUnits, recentLessonId]);

  const weakestTeks = useMemo(
    () =>
      buildTeksHeatmap(progress)
        .sort(
          (a, b) =>
            a.avgCheck - b.avgCheck || a.completionPct - b.completionPct,
        )
        .slice(0, 3),
    [progress],
  );

  const interventions = useMemo(
    () => buildInterventionQueue(progress),
    [progress],
  );

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
                Curriculum Roadmap
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Readings, lectures, and notes with mastery pathing and
                assignment-linked pacing for Units 1-3.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  {allVisibleUnits.length} Visible Units
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  {completedLessons}/{totalLessons} Lessons Complete
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  {interventions.length} Intervention Flags
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/student/learn/standards"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Standards Heatmap
              </Link>
              <Link
                href="/student/learn/interventions"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Interventions
              </Link>
              <Link
                href="/student/guardian"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Guardian Snapshot
              </Link>
            </div>
          </div>
        </section>

        {continueLesson ? (
          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Continue where you left off
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  Unit {continueLesson.unit.unitNumber}:{" "}
                  {continueLesson.lesson.title}
                </div>
                <div className="text-xs text-slate-600">
                  Last saved progress:{" "}
                  {progress[continueLesson.lesson.id]?.percent ?? 0}%
                </div>
              </div>
              <Link
                href={`/student/learn/${continueLesson.unit.id}/${continueLesson.lesson.slug}`}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Resume Lesson
              </Link>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {([0, 1, 2, 3, 4] as const).map((gp) => (
              <button
                key={gp}
                type="button"
                onClick={() => setGradingPeriodFilter(gp)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  gradingPeriodFilter === gp
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {gp === 0 ? "All Periods" : `GP ${gp}`}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Newly Available
              </div>
              <div className="mt-1 text-sm font-semibold text-emerald-900">
                Unit 7: Processes in Plants
              </div>
              <div className="text-xs text-emerald-800">
                Includes a B.12B phenomenon launch and standalone interactive
                lesson.
              </div>
            </div>
            <Link
              href="/student/learn/unit-7"
              className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              Open Unit 7
            </Link>
          </div>
        </section>

        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Unit Roadmap
            </div>
            <div className="mt-3 space-y-3">
              {filteredUnits.map((unit) => {
                const unitCompleted = unit.lessons.filter(
                  (lesson) => progress[lesson.id]?.completed,
                ).length;
                const unitPct = Math.round(
                  (unitCompleted / unit.lessons.length) * 100,
                );

                return (
                  <article
                    key={unit.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          GP {unit.gradingPeriod} • Unit {unit.unitNumber}
                        </div>
                        <h2 className="mt-1 text-base font-semibold text-slate-900">
                          {unit.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {unit.objective}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {unit.teks.map((teks) => (
                            <span
                              key={teks}
                              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                            >
                              {teks}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={`/student/learn/${unit.id}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Open Unit
                      </Link>
                    </div>

                    <div className="mt-3 h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${unitPct}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {unitCompleted}/{unit.lessons.length} lessons complete
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {unit.lessons.map((lesson, lessonIndex) => {
                        const unlocked = isLessonUnlocked(
                          unit,
                          lessonIndex,
                          progress,
                        );
                        return (
                          <Link
                            key={lesson.id}
                            href={
                              unlocked
                                ? `/student/learn/${unit.id}/${lesson.slug}`
                                : "#"
                            }
                            aria-disabled={!unlocked}
                            className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
                              unlocked
                                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            }`}
                          >
                            {unlocked ? "Open" : "Locked"} • {lesson.title}
                          </Link>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-3">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                Weakest Standards
              </div>
              <div className="mt-2 space-y-2">
                {weakestTeks.map((row) => (
                  <div
                    key={row.teks}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                  >
                    <div className="font-semibold text-slate-800">
                      {row.teks}
                    </div>
                    <div className="text-slate-600">
                      Avg check: {row.avgCheck}% • Completion:{" "}
                      {row.completionPct}%
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                Intervention Queue
              </div>
              <div className="mt-2 space-y-2">
                {interventions.slice(0, 3).map((item) => (
                  <Link
                    key={item.lessonId}
                    href={item.href}
                    className="block rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs hover:bg-amber-100"
                  >
                    <div className="font-semibold text-amber-900">
                      {item.lessonTitle}
                    </div>
                    <div className="text-amber-800">{item.reason}</div>
                  </Link>
                ))}
                {interventions.length === 0 ? (
                  <div className="text-xs text-slate-500">
                    No interventions right now.
                  </div>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <StudentFloatingDock />
      <ThemeToggle />
    </main>
  );
}
