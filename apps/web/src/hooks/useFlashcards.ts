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
 * **Primary storage:** When `studentId` is provided the hook persists mastery
 * state to `POST /api/flashcards/progress` and restores it on mount via
 * `GET /api/flashcards/progress?studentId={studentId}`.
 *
 * **Fallback:** When no `studentId` is provided (or the API is unavailable)
 * the hook falls back to `localStorage` under the key
 * `biospark:flashcards:<lessonSlug>`, maintaining full backward-compat.
 *
 * **localStorage key:** `biospark:flashcards:<lessonSlug>`
 *
 * Cards are built from `lesson.vocabularyTiers.contentSpecific`.
 * The SM-2 scheduling algorithm is intentionally NOT run here — the API
 * stores sensible defaults so Chunk C flashcard progress is queryable.
 */
export function useFlashcards(
  lessonSlug: string,
  lesson: LearningLesson,
  studentId?: string,
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

  // When a studentId is available, hydrate the mastered set from the API.
  // Applied after the localStorage read so API data takes precedence for
  // cards that were mastered in previous sessions.
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    fetch(`/api/flashcards/progress?studentId=${encodeURIComponent(studentId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((records: Array<{ cardId: string; repetitions: number }> | null) => {
        if (cancelled || !records) return;
        const masteredFromApi = records
          .filter((r) => r.repetitions > 0)
          .map((r) => r.cardId);
        if (masteredFromApi.length === 0) return;
        setSession((prev) => {
          // Only hydrate cards that belong to this lesson's deck
          const deckIds = new Set(prev.cards.map((c) => c.id));
          const toAdd = masteredFromApi.filter(
            (id) => deckIds.has(id) && !prev.mastered.includes(id),
          );
          if (toAdd.length === 0) return prev;
          return { ...prev, mastered: [...prev.mastered, ...toAdd] };
        });
      })
      .catch(() => {
        // Network failure — continue with localStorage state
      });
    return () => {
      cancelled = true;
    };
  }, [studentId, lessonSlug]);

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
   * Fire-and-forget POST to persist card mastery to the API.
   * Optimistic — the local state is already updated before this resolves.
   */
  const persistToApi = useCallback(
    (cardId: string, mastered: boolean) => {
      if (!studentId) return;
      const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      fetch("/api/flashcards/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          cardId,
          interval: 1,
          repetitions: mastered ? 1 : 0,
          easeFactor: 2.5,
          dueAt,
        }),
      }).catch(() => {
        // Ignore network errors — state is already updated optimistically
      });
    },
    [studentId],
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
      // Optimistic: local state already set; API call fires in background
      persistToApi(cardId, true);
      return next;
    });
  }, [persist, persistToApi]);

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
      // Record needs-review in API so card stays due for next session
      persistToApi(cardId, false);
      return next;
    });
  }, [persist, persistToApi]);

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
