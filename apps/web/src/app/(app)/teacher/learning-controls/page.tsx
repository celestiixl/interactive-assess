"use client";

import { useEffect, useState } from "react";
import { LEARNING_UNITS } from "@/lib/learningHubContent";
import { BackLink } from "@/components/nav/BackLink";
import {
  defaultLearningSettings,
  loadLearningSettings,
  saveLearningSettings,
  type LearningHubSettings,
  type PacingMode,
} from "@/lib/learningSettings";

export default function TeacherLearningControlsPage() {
  const [settings, setSettings] = useState<LearningHubSettings>(() =>
    defaultLearningSettings(LEARNING_UNITS.map((unit) => unit.id)),
  );

  useEffect(() => {
    setSettings(loadLearningSettings(LEARNING_UNITS.map((unit) => unit.id)));
  }, []);

  function toggleUnit(unitId: string) {
    const visibleUnitIds = settings.visibleUnitIds.includes(unitId)
      ? settings.visibleUnitIds.filter((id) => id !== unitId)
      : [...settings.visibleUnitIds, unitId];

    const next = { ...settings, visibleUnitIds };
    setSettings(next);
    saveLearningSettings(next);
  }

  function setPacing(gradingPeriod: 1 | 2 | 3 | 4, pacing: PacingMode) {
    const next = {
      ...settings,
      pacingByGradingPeriod: {
        ...settings.pacingByGradingPeriod,
        [gradingPeriod]: pacing,
      },
    };
    setSettings(next);
    saveLearningSettings(next);
  }

  function addLessonToPeriod(
    period: "P1" | "P2" | "P3" | "P4",
    lessonId: string,
  ) {
    if (!lessonId) return;
    const current = settings.playlistsByPeriod[period];
    if (current.lessonIds.includes(lessonId)) return;
    const next = {
      ...settings,
      playlistsByPeriod: {
        ...settings.playlistsByPeriod,
        [period]: {
          ...current,
          lessonIds: [...current.lessonIds, lessonId],
        },
      },
    };
    setSettings(next);
    saveLearningSettings(next);
  }

  function removeLessonFromPeriod(
    period: "P1" | "P2" | "P3" | "P4",
    lessonId: string,
  ) {
    const current = settings.playlistsByPeriod[period];
    const next = {
      ...settings,
      playlistsByPeriod: {
        ...settings.playlistsByPeriod,
        [period]: {
          ...current,
          lessonIds: current.lessonIds.filter((id) => id !== lessonId),
        },
      },
    };
    setSettings(next);
    saveLearningSettings(next);
  }

  function setPeriodDueDate(
    period: "P1" | "P2" | "P3" | "P4",
    dueDate: string,
  ) {
    const current = settings.playlistsByPeriod[period];
    const next = {
      ...settings,
      playlistsByPeriod: {
        ...settings.playlistsByPeriod,
        [period]: {
          ...current,
          dueDate: dueDate || null,
        },
      },
    };
    setSettings(next);
    saveLearningSettings(next);
  }

  const lessonOptions = LEARNING_UNITS.flatMap((unit) =>
    unit.lessons.map((lesson) => ({
      id: lesson.id,
      label: `U${unit.unitNumber} • ${lesson.title}`,
    })),
  );

  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-bs-text">
      <BackLink href="/teacher/dashboard" label="Back to dashboard" />
      <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Learning Hub Controls</h1>
          <p className="mt-1 text-sm text-bs-text-sub">
            Choose which units students can see and set pacing by grading
            period.
          </p>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
        <div className="text-sm font-semibold text-bs-text">
          Pacing by Grading Period
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map((gradingPeriod) => (
            <div
              key={gradingPeriod}
              className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-3"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                Grading Period {gradingPeriod}
              </div>
              <select
                value={
                  settings.pacingByGradingPeriod[gradingPeriod as 1 | 2 | 3 | 4]
                }
                onChange={(event) =>
                  setPacing(
                    gradingPeriod as 1 | 2 | 3 | 4,
                    event.target.value as PacingMode,
                  )
                }
                className="mt-2 w-full rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-sm"
              >
                <option value="on_track">On Track</option>
                <option value="review">Review Focus</option>
                <option value="accelerated">Accelerated</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
        <div className="text-sm font-semibold text-bs-text">
          Visible Units
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {LEARNING_UNITS.map((unit) => {
            const checked = settings.visibleUnitIds.includes(unit.id);
            return (
              <label
                key={unit.id}
                className="flex items-start gap-3 rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleUnit(unit.id)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-semibold text-bs-text">
                    GP {unit.gradingPeriod} • Unit {unit.unitNumber}:{" "}
                    {unit.title}
                  </div>
                  <div className="mt-1 text-xs text-bs-text-sub">
                    {unit.teks.join(" • ")}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
        <div className="text-sm font-semibold text-bs-text">
          Class Period Playlists
        </div>
        <p className="mt-1 text-xs text-bs-text-sub">
          Build lesson playlists per class period and set a due window.
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(["P1", "P2", "P3", "P4"] as const).map((period) => {
            const config = settings.playlistsByPeriod[period];
            return (
              <div
                key={period}
                className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-3"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                  {period} Playlist
                </div>

                <label className="mt-2 block text-xs font-semibold text-bs-text-sub">
                  Due Date
                  <input
                    type="date"
                    value={config.dueDate ?? ""}
                    onChange={(event) =>
                      setPeriodDueDate(period, event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-sm"
                  />
                </label>

                <label className="mt-2 block text-xs font-semibold text-bs-text-sub">
                  Add Lesson
                  <select
                    onChange={(event) => {
                      addLessonToPeriod(period, event.target.value);
                      event.target.value = "";
                    }}
                    defaultValue=""
                    className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-sm"
                  >
                    <option value="" disabled>
                      Select lesson
                    </option>
                    {lessonOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-2 space-y-1">
                  {config.lessonIds.length === 0 ? (
                    <div className="text-xs text-bs-text-sub">
                      No lessons added yet.
                    </div>
                  ) : (
                    config.lessonIds.map((lessonId) => {
                      const label =
                        lessonOptions.find((option) => option.id === lessonId)
                          ?.label ?? lessonId;
                      return (
                        <div
                          key={lessonId}
                          className="flex items-center justify-between gap-2 rounded-lg border border-[var(--bs-border)] bg-bs-surface px-2 py-1.5 text-xs"
                        >
                          <span className="text-bs-text-sub">{label}</span>
                          <button
                            type="button"
                            onClick={() =>
                              removeLessonFromPeriod(period, lessonId)
                            }
                            className="rounded-md border border-[var(--bs-border)] bg-bs-surface px-2 py-1 font-semibold text-bs-text-sub hover:bg-bs-raised"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
