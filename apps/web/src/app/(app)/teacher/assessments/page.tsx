"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BackLink } from "@/components/nav/BackLink";
import { PageContent, PageBanner, Card } from "@/components/ui";
import {
  defaultAssignmentPublishMeta,
  loadAssignmentPublishingState,
  saveAssignmentPublishingState,
  type AssignmentPublishMeta,
  type ClassPeriod,
} from "@/lib/assignmentPublishing";

type Assignment = {
  id: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
};

const CLASS_PERIODS: ClassPeriod[] = ["P1", "P2", "P3", "P4"];

export default function TeacherAssessmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishState, setPublishState] = useState<
    Record<string, AssignmentPublishMeta>
  >({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setPublishState(loadAssignmentPublishingState());
  }, []);

  function getMeta(assignment: Assignment): AssignmentPublishMeta {
    return (
      publishState[assignment.id] ?? defaultAssignmentPublishMeta(assignment.id)
    );
  }

  function updateMeta(
    assignment: Assignment,
    patch: Partial<AssignmentPublishMeta>,
  ) {
    setPublishState((prev) => {
      const current =
        prev[assignment.id] ?? defaultAssignmentPublishMeta(assignment.id);
      const next = {
        ...prev,
        [assignment.id]: {
          ...current,
          ...patch,
          assignmentId: assignment.id,
        },
      };
      saveAssignmentPublishingState(next);
      return next;
    });
  }

  function togglePeriod(assignment: Assignment, period: ClassPeriod) {
    const meta = getMeta(assignment);
    const has = meta.classPeriods.includes(period);
    const classPeriods = has
      ? meta.classPeriods.filter((value) => value !== period)
      : [...meta.classPeriods, period];

    updateMeta(assignment, { classPeriods });
  }

  function togglePublish(assignment: Assignment) {
    const meta = getMeta(assignment);
    if (meta.published) {
      updateMeta(assignment, { published: false, publishedAt: null });
      return;
    }

    if (!meta.dueDate || meta.classPeriods.length === 0) {
      setExpandedId(assignment.id);
      return;
    }

    updateMeta(assignment, {
      published: true,
      publishedAt: new Date().toISOString(),
    });
  }

  useEffect(() => {
    setLoading(true);
    fetch(`/api/assignments`)
      .then((r) => r.json())
      .then((d) => {
        // Expecting an array or { items: [] }
        if (Array.isArray(d)) setAssignments(d);
        else if (d?.items) setAssignments(d.items);
        else setAssignments([]);
      })
      .catch((e) => {
        console.error(e);
        setAssignments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <BackLink href="/teacher/dashboard" label="Back to dashboard" />
      <PageBanner
        title="Assessments"
        subtitle="A list of your assignments will appear here."
      />
      <PageContent className="py-6">
        <Card className="p-4">
          {loading ? (
            <div>Loading…</div>
          ) : assignments && assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div key={a.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{a.title || a.id}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-bs-text-sub">
                        <span>
                          {a.updatedAt
                            ? new Date(a.updatedAt).toLocaleString()
                            : a.createdAt
                              ? new Date(a.createdAt).toLocaleDateString()
                              : ""}
                        </span>
                        {getMeta(a).published ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                            Published
                          </span>
                        ) : (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                            Draft
                          </span>
                        )}
                        {getMeta(a).dueDate ? (
                          <span className="rounded-full border border-[var(--bs-border)] bg-[var(--bs-raised)] px-2 py-0.5 font-semibold text-bs-text-sub">
                            Due{" "}
                            {new Date(
                              getMeta(a).dueDate as string,
                            ).toLocaleDateString()}
                          </span>
                        ) : null}
                        {getMeta(a).classPeriods.length ? (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                            {getMeta(a).classPeriods.join(", ")}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => togglePublish(a)}
                        className={[
                          "rounded-md px-3 py-1.5 text-xs font-semibold",
                          getMeta(a).published
                            ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                            : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                        ].join(" ")}
                      >
                        {getMeta(a).published ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId((prev) => (prev === a.id ? null : a.id))
                        }
                        className="rounded-md border border-[var(--bs-border)] bg-bs-surface px-3 py-1.5 text-xs font-semibold text-bs-text-sub hover:bg-[var(--bs-raised)]"
                      >
                        Publishing Settings
                      </button>

                      <Link
                        href={`/teacher/assignments/${encodeURIComponent(a.id)}/summary`}
                        className="ia-btn-xs"
                      >
                        Summary
                      </Link>
                    </div>
                  </div>

                  {expandedId === a.id ? (
                    <div className="mt-3 rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                        Publish Assignment
                      </div>

                      <label className="mt-2 block text-xs font-semibold text-bs-text-sub">
                        Due Date
                        <input
                          type="date"
                          value={getMeta(a).dueDate ?? ""}
                          onChange={(event) =>
                            updateMeta(a, {
                              dueDate: event.target.value || null,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-sm"
                        />
                      </label>

                      <div className="mt-3">
                        <div className="text-xs font-semibold text-bs-text-sub">
                          Class Filters
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {CLASS_PERIODS.map((period) => {
                            const selected =
                              getMeta(a).classPeriods.includes(period);
                            return (
                              <button
                                key={`${a.id}-${period}`}
                                type="button"
                                onClick={() => togglePeriod(a, period)}
                                className={[
                                  "rounded-full border px-3 py-1 text-xs font-semibold",
                                  selected
                                    ? "border-blue-300 bg-blue-100 text-blue-800"
                                    : "border-[var(--bs-border)] bg-bs-surface text-bs-text-sub",
                                ].join(" ")}
                              >
                                {period}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {!getMeta(a).dueDate ||
                      getMeta(a).classPeriods.length === 0 ? (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          Set a due date and select at least one class period
                          before publishing.
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="text-bs-text-sub">No assessments found.</div>
              <div className="mt-4">
                <Link href="/teacher/builder" className="ia-btn">
                  Create an assessment
                </Link>
              </div>
            </div>
          )}
        </Card>

      </PageContent>
    </main>
  );
}
