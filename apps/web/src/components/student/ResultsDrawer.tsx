"use client";

import { useMemo } from "react";

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
  const summary = useMemo(() => {
    if (max <= 0) return "Checked.";
    if (score === max) return "Correct! Nice work.";
    if (score === 0) return "Not yet. Try again.";
    return "Partially correct. Keep going.";
  }, [score, max]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Scrim */}
      <button
        aria-label="Close results"
        className="absolute inset-0 bg-slate-900/45"
        onClick={onClose}
      />

      {/* Modal */}
      <aside className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Check result
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {summary}
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                correct
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {correct ? "Correct" : "Needs review"}
            </span>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Score
              </div>
              <div className="mt-1 text-base font-semibold text-slate-900">
                {score}/{max}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Time
              </div>
              <div className="mt-1 text-base font-semibold text-slate-900">
                {Math.max(0, timeSeconds)}s
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Attempts left
              </div>
              <div className="mt-1 text-base font-semibold text-slate-900">
                {attemptsLeft == null ? "—" : String(attemptsLeft)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Explanation
            </div>
            {explanation ? (
              <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {explanation}
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-500">
                Explanation is locked until you use your attempts.
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            {hasNext && onNext ? (
              <button
                type="button"
                onClick={onNext}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
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
