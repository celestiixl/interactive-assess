"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getPendingQueue,
  approveQuestion,
  rejectQuestion,
  type PendingQuestion,
} from "@/lib/itemBank";
import {
  Badge,
  Toast,
  QUESTION_TYPE_COLORS,
  DEFAULT_TYPE_COLOR,
} from "./itemBankShared";

// ---------------------------------------------------------------------------
// Pending question card
// ---------------------------------------------------------------------------

function PendingCard({
  question,
  onApprove,
  onReject,
}: {
  question: PendingQuestion;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const questionText =
    "stem" in question
      ? (question as { stem: string }).stem
      : "prompt" in question
        ? (question as { prompt: string }).prompt
        : question.id;

  const submittedDate = new Date(question.submittedAt).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );

  const typeColor = QUESTION_TYPE_COLORS[question.type] ?? DEFAULT_TYPE_COLOR;

  return (
    <article className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Type badge + TEKS tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge label={question.type} className={typeColor} />
            {question.teks.map((t) => (
              <Badge
                key={t}
                label={t}
                className="border-[var(--bs-border)] bg-[var(--bs-raised)] text-bs-text-sub"
              />
            ))}
            {question.learningLevel && (
              <Badge
                label={question.learningLevel}
                className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
              />
            )}
          </div>

          {/* Question text */}
          <p className="mt-2 text-sm leading-relaxed text-bs-text line-clamp-3">
            {questionText}
          </p>

          {/* Submission date */}
          <p className="mt-1.5 text-xs text-bs-text-muted">
            Submitted {submittedDate}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onApprove(question.id)}
            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
            aria-label={`Approve question ${question.id}`}
          >
            Approve
          </button>
          <button
            type="button"
            onClick={() => onReject(question.id)}
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/40"
            aria-label={`Reject question ${question.id}`}
          >
            Reject
          </button>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function ContentQualityClient({
  teacherId,
}: {
  teacherId: string;
}) {
  const [queue, setQueue] = useState<PendingQuestion[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setQueue(getPendingQueue(teacherId));
  }, [teacherId]);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleApprove = (questionId: string) => {
    approveQuestion(questionId, teacherId);
    setQueue((prev) => prev.filter((q) => q.id !== questionId));
    setToast(
      "Question approved - add to bank.example.json to publish to all teachers",
    );
  };

  const handleReject = (questionId: string) => {
    rejectQuestion(questionId, teacherId);
    setQueue((prev) => prev.filter((q) => q.id !== questionId));
  };

  return (
    <>
      <div className="space-y-3">
        {queue.length === 0 ? (
          <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-8 text-center text-sm text-bs-text-sub shadow-sm">
            No questions pending review.
          </div>
        ) : (
          queue.map((q) => (
            <PendingCard
              key={q.id}
              question={q}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))
        )}
      </div>

      {toast && <Toast message={toast} onDismiss={dismissToast} durationMs={4000} />}
    </>
  );
}

