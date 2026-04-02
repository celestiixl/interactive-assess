/**
 * serverAssignmentStore – server-side in-memory assignment store.
 *
 * Module-level Maps persist across requests within the same Next.js server
 * process. This is the prototype's in-process storage layer — no database
 * schema is involved.
 *
 * TODO: Replace with a real persistence layer (DB, Redis, etc.) when one
 * is available.
 */

import type {
  AssignmentGoal,
  AssignmentMode,
  DifferentiationMode,
  Question,
} from "@/types/assignments";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A full assignment record held in the server-side store.
 * Created by POST /api/assignments/create.
 */
export type StoredAssignment = {
  id: string;
  /** Teacher who created this assignment (from x-teacher-id header). */
  teacherId: string;
  title: string;
  goal: AssignmentGoal;
  mode: AssignmentMode;
  questions: Question[];
  /** Source id when mode is "pre-made". */
  preMadeSourceId?: string;
  differentiationMode: DifferentiationMode;
  periodIds: string[];
  dueDate: string;
  status: "draft" | "published";
  /**
   * Populated when mode is "custom" and differentiationMode is "tiered".
   * Built by {@link buildDifferentiatedTracks} from `lib/itemBank`.
   */
  tracks?: Record<"support" | "on-level" | "extension", Question[]>;
  createdAt: string;
  publishedAt?: string;
};

/**
 * A student's scored result for a single assignment.
 *
 * `totalScore` is a fraction in the `0`–`1` range.
 * A pending (not-yet-submitted) entry created by the reassign route
 * is indicated by an empty `submittedAt` string and `totalScore: 0`.
 */
export type AssignmentResult = {
  assignmentId: string;
  studentId: string;
  /** Fraction of total points earned: 0–1. */
  totalScore: number;
  /** Per-question answers keyed by question id. */
  answers: Record<string, unknown>;
  /** ISO 8601 submission timestamp, or empty string if pending. */
  submittedAt: string;
};

// ---------------------------------------------------------------------------
// In-memory stores (module-level singletons)
// ---------------------------------------------------------------------------

/**
 * All assignments created via POST /api/assignments/create.
 * Keyed by assignment id.
 */
export const assignmentStore = new Map<string, StoredAssignment>();

/**
 * All student results keyed by assignmentId.
 * Each value is the list of all results for that assignment.
 */
export const resultStore = new Map<string, AssignmentResult[]>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a collision-resistant unique id.
 * Uses `crypto.randomUUID()` when available (secure contexts + Node ≥ 14.17);
 * falls back to a timestamp + random string otherwise.
 */
export function generateAssignmentId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `asgn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
