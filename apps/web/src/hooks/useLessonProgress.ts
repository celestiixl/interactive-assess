"use client";

import { useCallback, useEffect, useState } from "react";

type LessonProgressState = {
  completedSections: string[];
  lastSectionId: string | null;
  isComplete: boolean;
};

const DEFAULT_STATE: LessonProgressState = {
  completedSections: [],
  lastSectionId: null,
  isComplete: false,
};

function readFromStorage(storageKey: string): LessonProgressState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as {
      completedSections?: unknown;
      lastSectionId?: unknown;
      isComplete?: unknown;
    };
    const completedSections = Array.isArray(parsed.completedSections)
      ? (parsed.completedSections as string[]).filter(
          (s): s is string => typeof s === "string",
        )
      : [];
    const lastSectionId =
      typeof parsed.lastSectionId === "string" ? parsed.lastSectionId : null;
    const isComplete =
      typeof parsed.isComplete === "boolean" ? parsed.isComplete : false;
    return { completedSections, lastSectionId, isComplete };
  } catch {
    // Corrupt or missing data — return defaults silently.
    return DEFAULT_STATE;
  }
}

/**
 * Persists a student's section-completion state to localStorage so a page
 * refresh never loses their place in a lesson.
 *
 * Storage key: `biospark:lesson-progress:<lessonSlug>`
 *
 * Shape stored in localStorage (includes a `savedAt` timestamp not held in memory):
 * ```json
 * {
 *   "completedSections": ["Introduction", "Cell Types"],
 *   "lastSectionId": "Cell Types",
 *   "isComplete": false,
 *   "savedAt": 1710000000000
 * }
 * ```
 *
 * All localStorage access is SSR-safe (guarded by `typeof window !== "undefined"`).
 * Corrupt or missing data silently returns the default empty state.
 * Write failures (e.g. private-browsing quota) are caught and ignored so the
 * hook always works with at least in-memory state.
 *
 * Note: `useEffect` is used for the initial read (rather than a `useState` lazy
 * initializer) because `useState` initializers are not re-run on the client
 * during SSR hydration — they receive the serialized server state instead.
 */
export function useLessonProgress(lessonSlug: string): {
  completedSections: string[];
  lastSectionId: string | null;
  isComplete: boolean;
  markSectionComplete: (sectionId: string) => void;
  markLessonComplete: () => void;
  resetProgress: () => void;
} {
  const storageKey = `biospark:lesson-progress:${lessonSlug}`;

  const [progress, setProgress] =
    useState<LessonProgressState>(DEFAULT_STATE);

  // Read persisted progress from localStorage on mount (SSR-safe).
  // A single setState call avoids cascading renders flagged by the lint rule.
  useEffect(() => {
    setProgress(readFromStorage(storageKey));
  }, [storageKey]);

  /** Write the current progress snapshot to localStorage. */
  const persist = useCallback(
    (next: LessonProgressState) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ ...next, savedAt: Date.now() }),
        );
      } catch {
        // localStorage unavailable (private browsing, quota, etc.) — continue
        // with in-memory state only.
      }
    },
    [storageKey],
  );

  const markSectionComplete = useCallback(
    (sectionId: string) => {
      setProgress((prev) => {
        if (prev.completedSections.includes(sectionId)) return prev;
        const next: LessonProgressState = {
          ...prev,
          completedSections: [...prev.completedSections, sectionId],
          lastSectionId: sectionId,
        };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const markLessonComplete = useCallback(() => {
    setProgress((prev) => {
      const next: LessonProgressState = { ...prev, isComplete: true };
      persist(next);
      return next;
    });
  }, [persist]);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_STATE);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return {
    completedSections: progress.completedSections,
    lastSectionId: progress.lastSectionId,
    isComplete: progress.isComplete,
    markSectionComplete,
    markLessonComplete,
    resetProgress,
  };
}
