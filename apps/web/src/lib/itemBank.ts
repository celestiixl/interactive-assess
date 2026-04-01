/**
 * Item Bank – localStorage-backed repository of reusable questions.
 *
 * Storage key: "biospark:itembank"
 *
 * All functions are safe to import in Server Components; the localStorage
 * reads/writes are guarded by `typeof window` checks and will silently
 * return empty/default values during SSR.
 */

import type { Question } from "@/types/assignments";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Convenience alias for the full Question discriminated union. */
export type AnyQuestion = Question;

/**
 * A single entry in the item bank: the original question wrapped with
 * metadata that is managed by the bank (not by the question itself).
 */
export type ItemBankEntry = {
  /** Stable unique id for this bank entry (separate from `question.id`). */
  id: string;
  /** The wrapped question. */
  question: AnyQuestion;
  /** Id of the assignment this question was originally created for, if any. */
  sourceAssignmentId?: string;
  /**
   * Unit identifier (e.g. `"unit-1"`) this question belongs to.
   * Used by {@link searchItemBank} when filtering by `unitId`.
   */
  unitId?: string;
  /** ISO 8601 timestamp of when this entry was added to the bank. */
  createdAt: string;
  /** Number of times this question has been included in an assignment. */
  usageCount: number;
};

/** Filters accepted by {@link searchItemBank}. All fields are optional. */
export type ItemBankFilters = {
  /**
   * One or more TEKS codes in canonical `"B.5A"` format.
   * An entry matches only if its question's `teks` array contains
   * **every** listed code.
   */
  teks?: string[];
  /** Exact question-type discriminant (e.g. `"multiple-choice"`). */
  questionType?: AnyQuestion["type"];
  /** Learning level of the wrapped question. */
  learningLevel?: AnyQuestion["learningLevel"];
  /** When `true`, only misconception-targeting questions are returned. */
  misconceptionTarget?: boolean;
  /** Unit identifier to match against {@link ItemBankEntry.unitId}. */
  unitId?: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "biospark:itembank";

/**
 * Generate a unique id.
 * Uses `crypto.randomUUID()` when available (secure contexts + Node ≥ 14.17),
 * and falls back to a timestamp + random string in environments where the
 * Web Crypto API is not present (e.g. HTTP-only dev previews).
 */
function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `ibank-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Numeric ordering of learning levels, used for ascending-level sorts. */
const LEVEL_ORDER: Record<AnyQuestion["learningLevel"], number> = {
  developing: 0,
  progressing: 1,
  proficient: 2,
  advanced: 3,
};

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function readRaw(): ItemBankEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ItemBankEntry[];
  } catch {
    return [];
  }
}

function writeRaw(entries: ItemBankEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage unavailable — silently ignore
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Read and return the full item bank from localStorage.
 *
 * Returns an empty array when the key does not exist, the value cannot be
 * parsed, or the function is called in a server-side (no `window`) context.
 */
export function getItemBank(): ItemBankEntry[] {
  return readRaw();
}

/**
 * Persist the complete item bank array to localStorage, replacing the
 * previously stored value.
 *
 * @param entries - The full item bank to save.
 */
export function saveItemBank(entries: ItemBankEntry[]): void {
  writeRaw(entries);
}

/**
 * Wrap `question` in a new {@link ItemBankEntry}, append it to the persisted
 * item bank, and return the newly created entry.
 *
 * @param question         - The question to store in the bank.
 * @param sourceAssignmentId - Optional id of the originating assignment.
 * @param unitId           - Optional unit identifier (e.g. `"unit-1"`).
 * @returns The newly created `ItemBankEntry` with `usageCount` set to `0`.
 */
export function addToItemBank(
  question: AnyQuestion,
  sourceAssignmentId?: string,
  unitId?: string,
): ItemBankEntry {
  const entry: ItemBankEntry = {
    id: generateId(),
    question,
    sourceAssignmentId,
    unitId,
    createdAt: new Date().toISOString(),
    usageCount: 0,
  };
  const bank = readRaw();
  bank.push(entry);
  writeRaw(bank);
  return entry;
}

/**
 * Search the item bank applying all provided (non-`undefined`) filters.
 *
 * Results are sorted by {@link ItemBankEntry.usageCount} **descending** so
 * that the most-reused questions surface first.
 *
 * @param filters - Any combination of filter fields; `undefined` fields are
 *   ignored and do not restrict the result set.
 * @returns Matching entries sorted by `usageCount` descending.
 */
export function searchItemBank(filters: ItemBankFilters): ItemBankEntry[] {
  const bank = readRaw();

  const results = bank.filter((entry) => {
    const q = entry.question;

    if (
      filters.teks !== undefined &&
      !filters.teks.every((t) => q.teks.includes(t))
    ) {
      return false;
    }
    if (
      filters.questionType !== undefined &&
      q.type !== filters.questionType
    ) {
      return false;
    }
    if (
      filters.learningLevel !== undefined &&
      q.learningLevel !== filters.learningLevel
    ) {
      return false;
    }
    if (
      filters.misconceptionTarget !== undefined &&
      q.misconceptionTarget !== filters.misconceptionTarget
    ) {
      return false;
    }
    if (filters.unitId !== undefined && entry.unitId !== filters.unitId) {
      return false;
    }

    return true;
  });

  return results.sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * Find the item bank entry with the given id, increment its `usageCount` by
 * 1, and persist the updated bank.
 *
 * If no entry with `itemBankEntryId` is found, this function is a no-op.
 *
 * @param itemBankEntryId - The {@link ItemBankEntry.id} to update.
 */
export function incrementUsageCount(itemBankEntryId: string): void {
  const bank = readRaw();
  const idx = bank.findIndex((e) => e.id === itemBankEntryId);
  if (idx === -1) return;
  bank[idx].usageCount += 1;
  writeRaw(bank);
}

/**
 * Partition the supplied questions into the three differentiated tracks used
 * by the BioSpark tiered-assignment feature.
 *
 * A question may appear in **more than one track** when its `learningLevel`
 * falls in an overlapping range:
 *
 * | Track      | Learning levels included            |
 * |------------|-------------------------------------|
 * | support    | `"developing"`, `"progressing"`     |
 * | on-level   | `"progressing"`, `"proficient"`     |
 * | extension  | `"proficient"`, `"advanced"`        |
 *
 * @param questions - Flat list of questions to partition.
 * @returns A record with one array per track.
 */
export function buildDifferentiatedTracks(
  questions: AnyQuestion[],
): Record<"support" | "on-level" | "extension", AnyQuestion[]> {
  const support: AnyQuestion[] = [];
  const onLevel: AnyQuestion[] = [];
  const extension: AnyQuestion[] = [];

  for (const q of questions) {
    const lvl = q.learningLevel;
    if (lvl === "developing" || lvl === "progressing") support.push(q);
    if (lvl === "progressing" || lvl === "proficient") onLevel.push(q);
    if (lvl === "proficient" || lvl === "advanced") extension.push(q);
  }

  return { support, "on-level": onLevel, extension };
}

/**
 * Suggest up to 10 bank entries suitable for a reteach assignment targeting
 * the given TEKS code and class-average mastery level.
 *
 * **Selection rules:**
 * - Only entries whose question's `teks` array contains `teks` are
 *   considered.
 * - `classAvgMastery < 0.5` → include only `"developing"` and
 *   `"progressing"` questions.
 * - `classAvgMastery < 0.7` → include only `"progressing"` and
 *   `"proficient"` questions.
 * - Otherwise all learning levels are included.
 *
 * **Sort order:**
 * 1. Misconception-targeting questions first (`misconceptionTarget === true`).
 * 2. Then by learning level ascending
 *    (`developing` → `progressing` → `proficient` → `advanced`).
 *
 * @param teks            - Canonical TEKS code to target (e.g. `"B.5A"`).
 * @param classAvgMastery - Class-average mastery in the `0`–`1` range.
 * @param itemBank        - The full item bank to search.
 * @returns Up to 10 matching, sorted entries.
 */
export function suggestQuestionsForReteach(
  teks: string,
  classAvgMastery: number,
  itemBank: ItemBankEntry[],
): ItemBankEntry[] {
  const allowedLevels = new Set<AnyQuestion["learningLevel"]>(
    classAvgMastery < 0.5
      ? (["developing", "progressing"] as const)
      : classAvgMastery < 0.7
        ? (["progressing", "proficient"] as const)
        : (["developing", "progressing", "proficient", "advanced"] as const),
  );

  const filtered = itemBank.filter(
    (entry) =>
      entry.question.teks.includes(teks) &&
      allowedLevels.has(entry.question.learningLevel),
  );

  filtered.sort((a, b) => {
    // Misconception-targeting questions come first
    const aM = a.question.misconceptionTarget ? 0 : 1;
    const bM = b.question.misconceptionTarget ? 0 : 1;
    if (aM !== bM) return aM - bM;

    // Then ascending by learning level
    return (
      LEVEL_ORDER[a.question.learningLevel] -
      LEVEL_ORDER[b.question.learningLevel]
    );
  });

  return filtered.slice(0, 10);
}
