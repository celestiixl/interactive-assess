"use client";

import { useEffect, useMemo, useState } from "react";
import { getMotivationalMessage } from "@/lib/motivationalMessages";

export default function ResultsDrawer({
  open,
  onClose,
  correct,
  score,
  max,
  timeSeconds,
  attemptsLeft,
  explanation,
  onNext,
  hasNext,
}: {
  open: boolean;
  onClose: () => void;
  correct: boolean;
  score: number;
  max: number;
  timeSeconds: number;
  attemptsLeft: number | null;
  explanation?: string;
  onNext?: () => void;
  hasNext?: boolean;
}) {
  const [correctMessage, setCorrectMessage] = useState("");

  // Generate a fresh motivational message each time the drawer opens with a correct answer
  useEffect(() => {
    if (open && score === max && max > 0) {
      setCorrectMessage(getMotivationalMessage());
    }
  }, [open]);

  const summary = useMemo(() => {
    if (max <= 0) return "Checked.";
    if (score === max) return correctMessage || "Correct! Nice work.";
    if (score === 0) return "Not yet. Try again.";
    return "Partially correct. Keep going.";
  }, [score, max, correctMessage]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Scrim */}
      <button
        aria-label="Close results"
        className="absolute inset-0 bg-bs-teal/45"
        onClick={onClose}
      />

      {/* Modal */}
      <aside className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--bs-border)] bg-bs-surface shadow-xl">
        <div className="border-b border-[var(--bs-border)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                Check result
              </div>
              <div className="mt-1 text-lg font-semibold text-bs-text">
                {summary}
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                correct
                  ? "bg-[rgba(74,222,128,0.06)] text-emerald-700 border border-emerald-200"
                  : "bg-[rgba(245,166,35,0.06)] text-bs-amber border border-[rgba(245,166,35,0.25)]"
              }`}
            >
              {correct ? "Correct" : "Needs review"}
            </span>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-bs-text-sub">
                Score
              </div>
              <div className="mt-1 text-base font-semibold text-bs-text">
                {score}/{max}
              </div>
            </div>
            <div className="rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-bs-text-sub">
                Time
              </div>
              <div className="mt-1 text-base font-semibold text-bs-text">
                {Math.max(0, timeSeconds)}s
              </div>
            </div>
            <div className="rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-bs-text-sub">
                Attempts left
              </div>
              <div className="mt-1 text-base font-semibold text-bs-text">
                {attemptsLeft == null ? "—" : String(attemptsLeft)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--bs-border)] p-4">
            <div className="text-sm font-semibold text-bs-text">
              Explanation
            </div>
            {explanation ? (
              <div className="mt-2 whitespace-pre-wrap text-sm text-bs-text-sub">
                {explanation}
              </div>
            ) : (
              <div className="mt-2 text-sm text-bs-text-sub">
                Explanation is locked until you use your attempts.
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--bs-border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--bs-border)] bg-transparent px-4 py-2 text-sm font-semibold text-bs-text hover:bg-[var(--glow)]"
            >
              Close
            </button>
            {hasNext && onNext ? (
              <button
                type="button"
                onClick={onNext}
                className="rounded-xl bg-bs-teal px-4 py-2 text-sm font-semibold text-[#080f12] hover:bg-[var(--mint)]"
              >
                Next question →
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
