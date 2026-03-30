"use client";

import { useMemo } from "react";
import { BackLink } from "@/components/nav/BackLink";
import { buildGuardianSnapshot } from "@/lib/learningInsights";
import { loadLearningProgress } from "@/lib/learningProgress";

export default function GuardianSnapshotPage() {
  const snapshot = useMemo(
    () => buildGuardianSnapshot(loadLearningProgress()),
    [],
  );

  return (
    <main className="mx-auto w-full max-w-5xl p-6 text-bs-text">
      <BackLink href="/student/learn" label="Back to hub" />
      <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Guardian Weekly Snapshot</h1>
          <p className="mt-1 text-sm text-bs-text-sub">
            A parent-friendly summary of learning progress and upcoming needs.
          </p>
        </div>
      </section>

      <section className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-bs-text-sub">
            Lessons completed
          </div>
          <div className="mt-1 text-2xl font-bold text-bs-text">
            {snapshot.lessonsCompleted}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-bs-text-sub">
            Average check score
          </div>
          <div className="mt-1 text-2xl font-bold text-bs-text">
            {snapshot.avgCheck}%
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-bs-text-sub">
            Time spent
          </div>
          <div className="mt-1 text-2xl font-bold text-bs-text">
            {snapshot.timeSpentMin} min
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
          <div className="text-sm font-semibold text-bs-text">
            Upcoming Assignments
          </div>
          <div className="mt-2 space-y-2 text-sm text-bs-text-sub">
            {snapshot.upcomingAssignments.length === 0 ? (
              <div className="text-bs-text-sub">
                No upcoming learning assignments.
              </div>
            ) : (
              snapshot.upcomingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-2"
                >
                  <div className="font-semibold">{assignment.title}</div>
                  <div className="text-xs text-bs-text-sub">
                    {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString()
                      : "No due date"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
          <div className="text-sm font-semibold text-bs-text">
            Missing / Not Started
          </div>
          <div className="mt-2 space-y-2 text-sm text-bs-text-sub">
            {snapshot.missingAssignments.length === 0 ? (
              <div className="text-bs-text-sub">
                No missing assignments this week.
              </div>
            ) : (
              snapshot.missingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2"
                >
                  <div className="font-semibold text-rose-900">
                    {assignment.title}
                  </div>
                  <div className="text-xs text-rose-700">
                    Status: Not started
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
