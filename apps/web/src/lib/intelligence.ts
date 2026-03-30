/**
 * intelligence.ts
 *
 * Pure computation helpers for mastery-driven intervention logic.
 * No I/O, no side effects — fully testable.
 *
 * Tier thresholds (aligned with BioSpark curriculum policy and
 * computePeriodMastery.ts):
 *   - Tier 2: score < 0.7  — approaching mastery, needs targeted support
 *   - Tier 3: score < 0.5 OR failedAttempts >= 2 — needs intensive support
 */

/**
 * Derive the intervention tier for a single student on a specific concept.
 *
 * @param score          Mastery score expressed as a value between 0 and 1
 *                       (e.g. 0.65 = 65 %).
 * @param failedAttempts Number of consecutive failed attempts on this concept.
 * @returns `3` if the student needs intensive support,
 *          `2` if they need targeted support,
 *          `null` if they are at or above the mastery threshold.
 */
export function computeInterventionTier(
  score: number,
  failedAttempts: number,
): 2 | 3 | null {
  if (score < 0.5 || failedAttempts >= 2) return 3;
  if (score < 0.7) return 2;
  return null;
}

/**
 * Derive the qualitative learning level from a mastery score.
 *
 * @param masteryPct Mastery percentage (0 – 100).
 * @returns One of the four BioSpark learning levels.
 */
export function deriveLearningLevel(
  masteryPct: number,
): "developing" | "progressing" | "proficient" | "advanced" {
  if (masteryPct >= 90) return "advanced";
  if (masteryPct >= 75) return "proficient";
  if (masteryPct >= 60) return "progressing";
  return "developing";
}
