"use client";

import { useCallback, useEffect, useState } from "react";
import type { LearningLesson } from "@/lib/learningHubContent";
import type { Flashcard, FlashcardSession } from "@/types/flashcard";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Fisher-Yates shuffle — returns a new shuffled array, does not mutate input. */
function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function buildCards(lessonSlug: string, lesson: LearningLesson): Flashcard[] {
  const terms = lesson.vocabularyTiers?.contentSpecific ?? [];
  return terms.map(
    (term, index): Flashcard => ({
      id: `${lessonSlug}-vocab-${index}`,
      term,
      lessonSlug,
      lessonTitle: lesson.title,
      teks: lesson.teks ?? [],
    }),
  );
}

function makeInitialSession(
  lessonSlug: string,
  lesson: LearningLesson,
): FlashcardSession {
  const cards = buildCards(lessonSlug, lesson);
  const shuffled = fisherYates(cards);
  const rotation = shuffled.map((c) => c.id);
  return {
    lessonSlug,
    cards: shuffled,
    currentIndex: 0,
    flipped: false,
    seen: [],
    mastered: [],
    rotation,
    savedAt: Date.now(),
  };
}

function readFromStorage(
  storageKey: string,
  lessonSlug: string,
  lesson: LearningLesson,
): FlashcardSession {
  if (typeof window === "undefined")
    return makeInitialSession(lessonSlug, lesson);
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return makeInitialSession(lessonSlug, lesson);
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (
      !Array.isArray(parsed["cards"]) ||
      typeof parsed["currentIndex"] !== "number" ||
      typeof parsed["flipped"] !== "boolean" ||
      !Array.isArray(parsed["seen"]) ||
      !Array.isArray(parsed["mastered"]) ||
      !Array.isArray(parsed["rotation"])
    ) {
      return makeInitialSession(lessonSlug, lesson);
    }
    return parsed as unknown as FlashcardSession;
  } catch {
    return makeInitialSession(lessonSlug, lesson);
  }
}

// ---------------------------------------------------------------------------

/**
 * Manages a vocabulary flashcard study session for a single lesson.
 *
 * **localStorage key:** `biospark:flashcards:<lessonSlug>`
 *
 * **Session shape stored in localStorage:**
 * ```json
 * {
 *   "lessonSlug": "lab-safety",
 *   "cards": [...],
 *   "currentIndex": 2,
 *   "flipped": false,
 *   "seen": ["lab-safety-vocab-0"],
 *   "mastered": [],
 *   "rotation": ["lab-safety-vocab-2", "lab-safety-vocab-0", ...],
 *   "savedAt": 1710000000000
 * }
 * ```
 *
 * - Cards are built exclusively from `lesson.vocabularyTiers.contentSpecific`.
 * - On mount the hook reads any previously saved session from localStorage;
 *   if none exists it initialises a fresh session with the cards shuffled via
 *   the Fisher-Yates algorithm.
 * - `markMastered` adds the current card to `mastered` and advances the queue.
 * - `markNeedsReview` re-appends the card to the end of the rotation queue and
 *   advances the index without adding it to `mastered`.
 * - When the index reaches the end of the rotation and not all cards are
 *   mastered the index loops back to 0 (needs-review cards are still queued).
 * - `restart` clears the localStorage entry and re-initialises with a fresh
 *   shuffle.
 * - All localStorage access is SSR-safe and wrapped in try/catch so the hook
 *   always falls back to in-memory state on failure.
 */
export function useFlashcards(
  lessonSlug: string,
  lesson: LearningLesson,
): {
  session: FlashcardSession;
  currentCard: Flashcard | null;
  isComplete: boolean;
  flip: () => void;
  markMastered: () => void;
  markNeedsReview: () => void;
  restart: () => void;
  progress: {
    total: number;
    mastered: number;
    remaining: number;
  };
} {
  const storageKey = `biospark:flashcards:${lessonSlug}`;

  const [session, setSession] = useState<FlashcardSession>(() =>
    makeInitialSession(lessonSlug, lesson),
  );

  // Read any persisted session from localStorage on mount (SSR-safe).
  // useEffect is used instead of a lazy useState initializer to avoid
  // hydration mismatches during SSR.
  useEffect(() => {
    setSession(readFromStorage(storageKey, lessonSlug, lesson));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  /** Persist the latest session snapshot to localStorage. */
  const persist = useCallback(
    (next: FlashcardSession) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ ...next, savedAt: Date.now() }),
        );
      } catch {
        // localStorage unavailable (private browsing, quota exceeded, etc.) —
        // continue with in-memory state only.
      }
    },
    [storageKey],
  );

  /**
   * Compute the next session state after advancing the rotation index by 1.
   * Loops back to 0 when the end of the queue is reached and cards remain.
   */
  function advance(
    current: FlashcardSession,
  ): FlashcardSession {
    const nextIndex = current.currentIndex + 1;
    if (nextIndex >= current.rotation.length) {
      // End of queue — done or loop
      const allMastered = current.mastered.length === current.cards.length;
      return {
        ...current,
        currentIndex: allMastered ? nextIndex : 0,
        flipped: false,
      };
    }
    return { ...current, currentIndex: nextIndex, flipped: false };
  }

  /** Toggle the card face; mark the card as seen on first flip. */
  const flip = useCallback(() => {
    setSession((prev) => {
      const cardId = prev.rotation[prev.currentIndex];
      const seen =
        cardId && !prev.seen.includes(cardId)
          ? [...prev.seen, cardId]
          : prev.seen;
      const next: FlashcardSession = { ...prev, flipped: !prev.flipped, seen };
      persist(next);
      return next;
    });
  }, [persist]);

  /** Mark the current card as mastered and advance the queue. */
  const markMastered = useCallback(() => {
    setSession((prev) => {
      const cardId = prev.rotation[prev.currentIndex];
      if (!cardId) return prev;
      const mastered = prev.mastered.includes(cardId)
        ? prev.mastered
        : [...prev.mastered, cardId];
      const next = advance({ ...prev, mastered });
      persist(next);
      return next;
    });
  }, [persist]);

  /**
   * Keep the current card in rotation by re-appending it to the end of the
   * queue, then advance the index.
   */
  const markNeedsReview = useCallback(() => {
    setSession((prev) => {
      const cardId = prev.rotation[prev.currentIndex];
      if (!cardId) return prev;
      const rotation = [...prev.rotation, cardId];
      const next = advance({ ...prev, rotation });
      persist(next);
      return next;
    });
  }, [persist]);

  /** Clear the saved session and start over with a freshly shuffled deck. */
  const restart = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
    const fresh = makeInitialSession(lessonSlug, lesson);
    setSession(fresh);
    persist(fresh);
  }, [storageKey, lessonSlug, lesson, persist]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const currentCardId = session.rotation[session.currentIndex] ?? null;
  const cardMap = new Map<string, Flashcard>(
    session.cards.map((c) => [c.id, c]),
  );
  const currentCard = currentCardId ? (cardMap.get(currentCardId) ?? null) : null;
  const isComplete =
    session.cards.length > 0 &&
    session.mastered.length === session.cards.length;

  return {
    session,
    currentCard,
    isComplete,
    flip,
    markMastered,
    markNeedsReview,
    restart,
    progress: {
      total: session.cards.length,
      mastered: session.mastered.length,
      remaining: session.cards.length - session.mastered.length,
    },
  };
}
