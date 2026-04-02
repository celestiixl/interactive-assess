"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";
import { LEARNING_UNITS } from "@/lib/learningHubContent";
import {
  MOCK_STUDENT_ASSIGNMENTS,
  type StudentAssignment,
} from "@/lib/studentAssignments";
import {
  loadLearningProgress,
  type LearningProgressMap,
} from "@/lib/learningProgress";
import { loadLearningSettings } from "@/lib/learningSettings";

type LessonStatus = "not_started" | "in_progress" | "complete";

interface Microlesson {
  id: string;
  title: string;
  unitTitle: string;
  lessonType: "Reading" | "Lecture" | "Notes";
  teks: string;
  description: string;
  durationMin: number;
  status: LessonStatus;
  progress: number; // 0-100
  href: string;
  assignmentTitle?: string;
  dueDateIso?: string;
  dueDateLabel?: string;
}

function formatDueLabel(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined;
  const due = new Date(iso);
  const diffDays = Math.round(
    (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays < 0) return `Due ${Math.abs(diffDays)}d ago`;
  return `Due in ${diffDays}d`;
}

function dueSortValue(iso: string | null | undefined): number {
  if (!iso) return Number.MAX_SAFE_INTEGER;
  return new Date(iso).getTime();
}

function toLessonStatus(assignment?: StudentAssignment): LessonStatus {
  if (!assignment) return "not_started";
  if (assignment.status === "graded" || assignment.status === "submitted") {
    return "complete";
  }
  if (assignment.status === "in_progress") return "in_progress";
  return "not_started";
}

function toProgress(
  status: LessonStatus,
  assignment?: StudentAssignment,
): number {
  if (!assignment)
    return status === "complete" ? 100 : status === "in_progress" ? 45 : 0;
  if (status === "complete") return 100;
  if (status === "in_progress") {
    if (assignment.totalItems > 0) {
      return Math.round(
        (assignment.completedItems / assignment.totalItems) * 100,
      );
    }
    return 45;
  }
  return 0;
}

const STATUS_LABEL: Record<LessonStatus, string> = {
  not_started: "Start",
  in_progress: "Continue",
  complete: "Review",
};

const STATUS_BADGE: Record<LessonStatus, string> = {
  not_started: "bg-[var(--bs-raised)] text-bs-text-sub",
  in_progress: "bg-amber-100 text-amber-800",
  complete: "bg-green-100 text-green-800",
};

const STATUS_TEXT: Record<LessonStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
};

const BTN_CLS: Record<LessonStatus, string> = {
  not_started:
    "rounded-full bg-bs-teal px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--mint)] transition",
  in_progress:
    "rounded-full bg-bs-amber px-4 py-1.5 text-xs font-semibold text-white hover:bg-bs-amber transition",
  complete:
    "rounded-full border border-[var(--bs-border)] bg-bs-surface px-4 py-1.5 text-xs font-semibold text-bs-text-sub hover:bg-[var(--bs-raised)] transition",
};

type FilterKey = "all" | "in_progress" | "not_started" | "complete";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "not_started", label: "Not Started" },
  { key: "complete", label: "Complete" },
];

interface LearningHubProps {
  streak: number;
  accuracy: number;
}

export default function LearningHub({ streak, accuracy }: LearningHubProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [progressMap, setProgressMap] = useState<LearningProgressMap>({});
  const [visibleUnitIds, setVisibleUnitIds] = useState<string[]>(
    LEARNING_UNITS.map((unit) => unit.id),
  );

  useEffect(() => {
    setProgressMap(loadLearningProgress());
    const settings = loadLearningSettings(
      LEARNING_UNITS.map((unit) => unit.id),
    );
    setVisibleUnitIds(settings.visibleUnitIds);
  }, []);

  const learningAssignments = useMemo(
    () => MOCK_STUDENT_ASSIGNMENTS.filter((a) => a.kind === "assignment"),
    [],
  );

  const lessons = useMemo<Microlesson[]>(() => {
    return LEARNING_UNITS.filter((unit) =>
      visibleUnitIds.includes(unit.id),
    ).flatMap((unit) => {
      return unit.lessons.map((lesson) => {
        const assignmentId = unit.linkedAssignmentId;
        const linkedAssignment = assignmentId
          ? learningAssignments.find(
              (assignment) => assignment.id === assignmentId,
            )
          : learningAssignments.find((assignment) =>
              assignment.teks.some((teks) => unit.teks.includes(teks)),
            );

        const status = toLessonStatus(linkedAssignment);
        const persisted = progressMap[lesson.id];
        const isComplete = persisted?.completed ?? false;
        const resolvedStatus: LessonStatus = isComplete ? "complete" : status;
        const resolvedProgress = Math.max(
          persisted?.percent ?? 0,
          toProgress(resolvedStatus, linkedAssignment),
        );

        return {
          id: lesson.id,
          title: lesson.title,
          unitTitle: unit.title,
          lessonType: lesson.type,
          teks: unit.teks[0] ?? "BIO",
          description: lesson.summary,
          durationMin: lesson.minutes,
          status: resolvedStatus,
          progress: resolvedProgress,
          href: `/student/learn/${unit.id}/${lesson.slug}`,
          assignmentTitle: linkedAssignment?.title,
          dueDateIso: linkedAssignment?.dueDate ?? undefined,
          dueDateLabel: formatDueLabel(linkedAssignment?.dueDate),
        };
      });
    });
  }, [learningAssignments, progressMap, visibleUnitIds]);

  const visible = (
    filter === "all" ? lessons : lessons.filter((l) => l.status === filter)
  ).sort((left, right) => {
    if (left.status !== right.status) {
      const order: Record<LessonStatus, number> = {
        in_progress: 0,
        not_started: 1,
        complete: 2,
      };
      return order[left.status] - order[right.status];
    }
    return dueSortValue(left.dueDateIso) - dueSortValue(right.dueDateIso);
  });

  const completedCount = lessons.filter((l) => l.status === "complete").length;
  const overallProgress =
    lessons.length > 0
      ? Math.round(
          lessons.reduce((acc, lesson) => acc + lesson.progress, 0) /
            lessons.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-bs-text">Learning Hub</h2>
          <p className="mt-0.5 text-sm text-bs-text-sub">
            Structured readings, lectures, and notes with linked learning
            assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border bg-bs-surface px-4 py-2 text-center shadow-sm">
            <div className="text-2xl font-bold text-bs-text">{streak}</div>
            <div className="text-xs text-bs-text-sub">day streak 🔥</div>
          </div>
          <div className="rounded-xl border bg-bs-surface px-4 py-2 text-center shadow-sm">
            <div className="text-2xl font-bold text-bs-text">{accuracy}%</div>
            <div className="text-xs text-bs-text-sub">accuracy</div>
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl border bg-bs-surface p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-bs-text">
            Overall learning progress
          </span>
          <span className="text-sm text-bs-text-sub">
            {completedCount}/{lessons.length} complete
          </span>
        </div>
        <ProgressBar percent={overallProgress} label="" />
        <div className="mt-2 text-xs text-bs-text-sub">
          {learningAssignments.length} linked learning assignment
          {learningAssignments.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors hover:scale-100 ${
              filter === f.key
                ? "bg-bs-teal text-white border-bs-text"
                : "bg-bs-surface text-bs-text-sub hover:bg-[var(--bs-raised)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Microlesson cards */}
      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-bs-text-muted">
          No lessons match this filter.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((lesson) => (
            <div
              key={lesson.id}
              className="flex flex-col rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm"
            >
              {/* Top row: TEKS + status badge */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {lesson.teks}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[lesson.status]}`}
                >
                  {STATUS_TEXT[lesson.status]}
                </span>
              </div>

              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-bs-text-sub">
                {lesson.lessonType} • {lesson.unitTitle}
              </div>

              <h3 className="text-sm font-semibold text-bs-text">
                {lesson.title}
              </h3>
              <p className="mt-1 grow text-sm text-bs-text-sub">
                {lesson.description}
              </p>

              {lesson.assignmentTitle ? (
                <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                    Linked Assignment
                  </div>
                  <div className="text-xs font-semibold text-gray-900">
                    {lesson.assignmentTitle}
                  </div>
                  {lesson.dueDateLabel ? (
                    <div className="text-[11px] text-gray-600">
                      {lesson.dueDateLabel}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Duration */}
              <div className="mt-3 text-xs text-bs-text-muted">
                ⏱ {lesson.durationMin} min
              </div>

              <div className="mt-3">
                <ProgressBar percent={lesson.progress} label="" />
              </div>

              {/* CTA */}
              <div className="mt-4">
                <Link href={lesson.href} className={BTN_CLS[lesson.status]}>
                  {STATUS_LABEL[lesson.status]}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily challenge callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Need Practice After Reading?
          </div>
          <div className="mt-1 text-sm font-semibold text-gray-900">
            Open your assigned lessons and continue progress.
          </div>
          <div className="mt-0.5 text-xs text-gray-600">
            Synced from teacher assignments
          </div>
        </div>
        <Link
          href="/student/assignments?kind=assignment"
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors hover:scale-100"
        >
          Open Assignments
        </Link>
      </div>
    </div>
  );
}
