"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getPrivateBank,
  submitForReview,
  saveItemBank,
  type ItemBankEntry,
} from "@/lib/itemBank";
import {
  Badge,
  Toast,
  QUESTION_TYPE_COLORS,
  DEFAULT_TYPE_COLOR,
} from "./itemBankShared";

// ---------------------------------------------------------------------------
// Question card
// ---------------------------------------------------------------------------

function PrivateQuestionCard({
  entry,
  onSubmit,
  onDelete,
}: {
  entry: ItemBankEntry;
  onSubmit: (entry: ItemBankEntry) => void;
  onDelete: (entryId: string) => void;
}) {
  const q = entry.question;

  const questionText =
    "stem" in q
      ? (q as { stem: string }).stem
      : "prompt" in q
        ? (q as { prompt: string }).prompt
        : q.id;

  const typeColor = QUESTION_TYPE_COLORS[q.type] ?? DEFAULT_TYPE_COLOR;

  const addedDate = new Date(entry.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Type badge + TEKS tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge label={q.type} className={typeColor} />
            {q.teks.map((t) => (
              <Badge
                key={t}
                label={t}
                className="border-[var(--bs-border)] bg-[var(--bs-raised)] text-bs-text-sub"
              />
            ))}
            {q.learningLevel && (
              <Badge
                label={q.learningLevel}
                className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
              />
            )}
          </div>

          {/* Question text */}
          <p className="mt-2 text-sm leading-relaxed text-bs-text line-clamp-3">
            {questionText}
          </p>

          {/* Metadata row */}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-bs-text-muted">
            <span>Added {addedDate}</span>
            {entry.usageCount > 0 && (
              <span>
                Used {entry.usageCount} time
                {entry.usageCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onSubmit(entry)}
            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-sm hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40"
            aria-label="Submit question for review"
          >
            Submit for Review
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-1.5 text-xs font-semibold text-bs-text-sub shadow-sm hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-1 dark:hover:border-rose-700 dark:hover:bg-rose-900/20 dark:hover:text-rose-300"
            aria-label="Delete question"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function PrivateBankClient({
  teacherId,
}: {
  teacherId: string;
}) {
  const [entries, setEntries] = useState<ItemBankEntry[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setEntries(getPrivateBank(teacherId));
  }, [teacherId]);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleSubmit = (entry: ItemBankEntry) => {
    submitForReview(entry.question, teacherId);
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    setToast("Question submitted for review.");
  };

  const handleDelete = (entryId: string) => {
    const updated = entries.filter((e) => e.id !== entryId);
    saveItemBank(updated, teacherId);
    setEntries(updated);
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-8 text-center text-sm text-bs-text-sub shadow-sm">
        No questions in your private bank yet. Create questions using the Item
        Builder.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {entries.map((entry) => (
          <PrivateQuestionCard
            key={entry.id}
            entry={entry}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </>
  );
}
