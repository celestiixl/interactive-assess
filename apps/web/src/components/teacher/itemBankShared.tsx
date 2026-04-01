/**
 * Shared UI primitives used across teacher content-quality and private bank
 * components. Not exported from the main component library - internal use only.
 */

"use client";

import React, { useEffect } from "react";

// ---------------------------------------------------------------------------
// Type badge color map
// ---------------------------------------------------------------------------

export const QUESTION_TYPE_COLORS: Record<string, string> = {
  "multiple-choice":
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "multiple-selection":
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "short-answer":
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "open-ended":
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  cer: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

export const DEFAULT_TYPE_COLOR =
  "border-[var(--bs-border)] bg-[var(--bs-raised)] text-bs-text-sub";

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

export function Badge({
  label,
  className = "",
}: {
  label: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold leading-none ${className}`}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

export function Toast({
  message,
  onDismiss,
  durationMs = 3500,
}: {
  message: string;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
    >
      {message}
    </div>
  );
}
