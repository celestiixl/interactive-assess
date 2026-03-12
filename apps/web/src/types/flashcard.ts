/** A single vocabulary flashcard derived from a lesson's content-specific vocabulary. */
export interface Flashcard {
  /** Unique id formatted as `${lessonSlug}-vocab-${index}` */
  id: string;
  /** The vocabulary word displayed on the front of the card */
  term: string;
  lessonSlug: string;
  lessonTitle: string;
  /** TEKS codes inherited from the parent lesson, e.g. `["B.5A"]` */
  teks: string[];
}

/**
 * Persisted state for a single flashcard study session.
 * Stored in localStorage under `biospark:flashcards:<lessonSlug>`.
 */
export interface FlashcardSession {
  lessonSlug: string;
  /** Full set of flashcards for this lesson (content-specific vocabulary only) */
  cards: Flashcard[];
  /** Index into the current `rotation` queue */
  currentIndex: number;
  /** Whether the current card is showing its back face */
  flipped: boolean;
  /** IDs of cards the student has flipped (i.e. viewed both front and back) */
  seen: string[];
  /** IDs of cards the student has marked as "got it" */
  mastered: string[];
  /**
   * Ordered queue of card IDs to visit.  The queue grows as needs-review cards
   * are re-appended to the end by `markNeedsReview`.
   */
  rotation: string[];
  /** `Date.now()` timestamp of the last write */
  savedAt: number;
}
