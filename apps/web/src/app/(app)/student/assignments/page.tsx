"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BackLink } from "@/components/nav/BackLink";
import { PageContent, PageBanner, Card, Badge } from "@/components/ui";
import {
  type AssignmentKind,
  type AssignmentStatus,
  type StudentAssignment,
  MOCK_STUDENT_ASSIGNMENTS,
} from "@/lib/studentAssignments";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AssignmentStatus,
  { label: string; color: string; dot: string }
> = {
  not_started: {
    label: "Not Started",
    color: "text-bs-text-sub bg-bs-raised border-[var(--bs-border)]",
    dot: "bg-bs-text-muted",
  },
  in_progress: {
    label: "In Progress",
    color: "text-amber-800 bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
  },
  submitted: {
    label: "Submitted",
    color: "text-blue-800 bg-blue-50 border-blue-200",
    dot: "bg-blue-400",
  },
  graded: {
    label: "Graded",
    color: "text-green-800 bg-green-50 border-green-200",
    dot: "bg-green-500",
  },
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.round(
    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
  return `In ${diffDays}d`;
}

function progressPercent(a: StudentAssignment): number {
  if (a.totalItems === 0) return 0;
  return Math.round((a.completedItems / a.totalItems) * 100);
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-700";
  if (score >= 60) return "text-amber-700";
  return "text-red-600";
}

function practiceHref(a: StudentAssignment): string {
  const focus = a.teks[0] ?? "";
  return `/practice?focus=${encodeURIComponent(focus)}`;
}

// ─── AssignmentCard component ─────────────────────────────────────────────────

function AssignmentCard({ a }: { a: StudentAssignment }) {
  const cfg = STATUS_CONFIG[a.status];
  const pct = progressPercent(a);
  const isDue = a.dueDate && new Date(a.dueDate).getTime() < Date.now();
  const isPastDue = isDue && a.status !== "submitted" && a.status !== "graded";

  return (
    <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm transition hover:shadow-md">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                a.kind === "assessment"
                  ? "border-purple-200 bg-purple-50 text-purple-700"
                  : "border-teal-200 bg-teal-50 text-teal-700"
              }`}
            >
              {a.kind === "assessment" ? "Assessment" : "Assignment"}
            </span>
            <span
              className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.color}`}
            >
              <span className={`size-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            {isPastDue && (
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                Past Due
              </span>
            )}
          </div>
          <div className="mt-2 text-sm font-semibold text-bs-text">
            {a.title}
          </div>
          <div className="mt-0.5 text-xs text-bs-text-sub">{a.subject}</div>
        </div>

        {/* Score */}
        {a.score !== null && (
          <div className="shrink-0 text-right">
            <div
              className={`text-2xl font-bold tabular-nums ${scoreColor(a.score)}`}
            >
              {a.score}%
            </div>
            <div className="text-xs text-bs-text-sub">Score</div>
          </div>
        )}
      </div>

      {/* TEKS tags */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {a.teks.map((t) => (
          <span
            key={t}
            className="rounded-full border border-[var(--bs-border)] bg-bs-surface px-2 py-0.5 text-[10px] font-mono text-bs-text-sub"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Progress bar (for in-progress) */}
      {(a.status === "in_progress" || a.status === "submitted") && (
        <div className="mt-2.5">
          <div className="mb-1 flex items-center justify-between text-[10px] text-bs-text-sub">
            <span>
              {a.completedItems}/{a.totalItems} items
            </span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-bs-raised">
            <div
              className="h-1.5 rounded-full bg-amber-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer row */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs text-bs-text-sub">
          {a.status === "graded" || a.status === "submitted"
            ? `Submitted ${formatDate(a.submittedAt)}`
            : a.dueDate
              ? `Due ${formatDate(a.dueDate)}`
              : "No due date"}
        </div>
        <div className="flex gap-2">
          {(a.status === "graded" || a.status === "submitted") && (
            <Link
              href={practiceHref(a)}
              className="rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-1.5 text-xs font-semibold text-bs-text-sub hover:bg-bs-raised"
            >
              Review topics
            </Link>
          )}
          {a.status === "in_progress" && (
            <Link
              href={`/practice?focus=${encodeURIComponent(a.teks[0] ?? "")}`}
              className="rounded-xl bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
            >
              Continue →
            </Link>
          )}
          {a.status === "not_started" && (
            <Link
              href={`/practice?focus=${encodeURIComponent(a.teks[0] ?? "")}`}
              className="rounded-xl bg-bs-bg px-4 py-1.5 text-xs font-semibold text-white hover:bg-bs-bg"
            >
              Start →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

function StudentAssignmentsPageContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [dueFilter, setDueFilter] = useState<
    "all" | "due" | "past_due" | "coming_up"
  >("all");
  const kindParam = searchParams.get("kind");
  const kindFilter: "all" | "assignment" | "assessment" =
    kindParam === "assignment" || kindParam === "assessment"
      ? kindParam
      : "all";

  const isActiveStatus = (a: StudentAssignment) =>
    a.status === "not_started" || a.status === "in_progress";
  const dueMs = (a: StudentAssignment) =>
    a.dueDate ? new Date(a.dueDate).getTime() - Date.now() : null;
  const isDueToday = (a: StudentAssignment) => {
    const ms = dueMs(a);
    return (
      isActiveStatus(a) && ms !== null && ms >= 0 && ms < 24 * 60 * 60 * 1000
    );
  };
  const isPastDue = (a: StudentAssignment) => {
    const ms = dueMs(a);
    return isActiveStatus(a) && ms !== null && ms < 0;
  };
  const isComingUp = (a: StudentAssignment) => {
    const ms = dueMs(a);
    return isActiveStatus(a) && ms !== null && ms >= 24 * 60 * 60 * 1000;
  };

  const active = MOCK_STUDENT_ASSIGNMENTS.filter(
    (a) => a.status === "not_started" || a.status === "in_progress",
  );
  const completed = MOCK_STUDENT_ASSIGNMENTS.filter(
    (a) => a.status === "submitted" || a.status === "graded",
  );

  const baseDisplayed = tab === "active" ? active : completed;
  const kindFiltered =
    kindFilter === "all"
      ? baseDisplayed
      : baseDisplayed.filter((a) => a.kind === kindFilter);
  const displayed =
    tab !== "active" || dueFilter === "all"
      ? kindFiltered
      : kindFiltered.filter((a) => {
          if (dueFilter === "due") return isDueToday(a);
          if (dueFilter === "past_due") return isPastDue(a);
          if (dueFilter === "coming_up") return isComingUp(a);
          return true;
        });

  // Counts
  const dueToday = active.filter(isDueToday).length;

  const pastDue = active.filter(isPastDue).length;

  const comingUp = active.filter(isComingUp).length;

  const inProgress = active.filter((a) => a.status === "in_progress").length;
  const avgScore =
    completed.filter((a) => a.score !== null).length > 0
      ? Math.round(
          completed
            .filter((a) => a.score !== null)
            .reduce((s, a) => s + (a.score ?? 0), 0) /
            completed.filter((a) => a.score !== null).length,
        )
      : null;

  return (
    <main className="ia-vh-page flex h-dvh flex-col overflow-hidden text-bs-text">
      <BackLink href="/student/dashboard" label="Back to dashboard" />
      <PageBanner
        title="My Assignments"
        subtitle="Track your work, due dates, and scores."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/student/learn"
            className="rounded-2xl bg-bs-surface/20 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-bs-raised/25"
          >
            Learning Hub
          </Link>
          <Link
            href="/student/profile"
            className="rounded-2xl bg-bs-surface/20 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-bs-raised/25"
          >
            My Profile
          </Link>
        </div>
      </PageBanner>

      <PageContent className="flex-1 min-h-0 py-3">
        <div className="ia-vh-scroll h-full min-h-0 overflow-y-auto pr-1">
          {/* Stat row */}
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Active",
                value: active.length,
                color: "text-bs-text",
              },
              {
                label: "Due Today",
                value: dueToday,
                color: dueToday > 0 ? "text-amber-600" : "text-bs-text",
              },
              {
                label: "Past Due",
                value: pastDue,
                color: pastDue > 0 ? "text-red-600" : "text-bs-text",
              },
              {
                label: "Coming Up",
                value: comingUp,
                color: "text-blue-700",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 text-center shadow-sm"
              >
                <div className={`text-2xl font-bold tabular-nums ${s.color}`}>
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-bs-text-sub">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-4 flex items-center gap-2">
            {(["active", "completed"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  tab === t
                    ? "bg-bs-bg text-white"
                    : "bg-bs-surface text-bs-text-sub hover:bg-bs-raised"
                }`}
              >
                {t === "active"
                  ? `Active (${active.length})`
                  : `Completed (${completed.length})`}
              </button>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Link
              href="/student/assignments?kind=assignment"
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                kindFilter === "assignment"
                  ? "border-[var(--bs-border)] bg-bs-bg text-white"
                  : "border-[var(--bs-border)] bg-bs-surface text-bs-text-sub hover:bg-bs-raised"
              }`}
            >
              Assignments
            </Link>
            <Link
              href="/student/assignments?kind=assessment"
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                kindFilter === "assessment"
                  ? "border-[var(--bs-border)] bg-bs-bg text-white"
                  : "border-[var(--bs-border)] bg-bs-surface text-bs-text-sub hover:bg-bs-raised"
              }`}
            >
              Quizzes
            </Link>
          </div>

          {tab === "active" ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDueFilter("all")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  dueFilter === "all"
                    ? "border-[var(--bs-border)] bg-bs-bg text-white"
                    : "border-[var(--bs-border)] bg-bs-surface text-bs-text-sub hover:bg-bs-raised"
                }`}
              >
                All active
              </button>
              <button
                type="button"
                onClick={() => setDueFilter("due")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  dueFilter === "due"
                    ? "border-[var(--bs-border)] bg-bs-bg text-white"
                    : "border-[var(--bs-border)] bg-bs-surface text-bs-text-sub hover:bg-bs-raised"
                }`}
              >
                Due today ({dueToday})
              </button>
              <button
                type="button"
                onClick={() => setDueFilter("past_due")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  dueFilter === "past_due"
                    ? "border-[var(--bs-border)] bg-bs-bg text-white"
                    : "border-[var(--bs-border)] bg-bs-surface text-bs-text-sub hover:bg-bs-raised"
                }`}
              >
                Past due ({pastDue})
              </button>
              <button
                type="button"
                onClick={() => setDueFilter("coming_up")}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  dueFilter === "coming_up"
                    ? "border-[var(--bs-border)] bg-bs-bg text-white"
                    : "border-[var(--bs-border)] bg-bs-surface text-bs-text-sub hover:bg-bs-raised"
                }`}
              >
                Coming up ({comingUp})
              </button>
            </div>
          ) : null}

          {/* Assignment list */}
          {displayed.length === 0 ? (
            <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface px-6 py-12 text-center">
              <div className="text-bs-text-sub">
                {tab === "active"
                  ? "No active assignments right now. 🎉"
                  : "No completed assignments yet."}
              </div>
              {tab === "active" && (
                <Link
                  href="/student/learn"
                  className="mt-4 inline-block rounded-xl bg-bs-bg px-4 py-2 text-sm font-semibold text-white"
                >
                  Go to Learning Hub →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {displayed.map((a) => (
                <AssignmentCard key={a.id} a={a} />
              ))}
            </div>
          )}

          {/* Quick practice CTA */}
          <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-teal-900">
                  Need to review? Jump into the Learning Hub
                </div>
                <div className="mt-1 text-xs text-teal-700">
                  Personalized spaced-repetition review sessions based on your
                  proficiency level.
                </div>
              </div>
              <Link
                href="/student/learn"
                className="rounded-2xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Open Learning Hub →
              </Link>
            </div>
          </div>
        </div>
      </PageContent>
    </main>
  );
}

export default function StudentAssignmentsPage() {
  return (
    <Suspense
      fallback={
        <main className="p-6 text-bs-text">Loading assignments...</main>
      }
    >
      <StudentAssignmentsPageContent />
    </Suspense>
  );
}
