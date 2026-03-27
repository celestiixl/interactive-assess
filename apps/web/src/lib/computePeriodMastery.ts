/**
 * computePeriodMastery
 *
 * Pure computation function — no I/O, no side effects, fully testable.
 *
 * Aggregates a flat list of student mastery entries for a single class period
 * into a {@link PeriodMasterySnapshot}, computing per-TEKS averages and
 * intervention tier counts.
 *
 * Tier thresholds (aligned with BioSpark curriculum policy):
 *   - Tier 2: score < 0.7  (student is approaching mastery, needs support)
 *   - Tier 3: score < 0.5 OR attemptCount >= 2  (student needs intensive support)
 */

import type {
  StudentMasteryEntry,
  PeriodTEKSAggregate,
  PeriodMasterySnapshot,
} from "@/types/period-mastery";

/**
 * Compute a full mastery snapshot for one class period.
 *
 * @param entries    Flat list of all StudentMasteryEntry records (may include
 *                   entries from other periods — only those matching
 *                   `periodId` are included in the computation).
 * @param periodId   The period identifier to aggregate, e.g. `"period-1"`.
 * @param periodLabel Human-readable label, e.g. `"Period 1 — 8:00 AM"`.
 * @returns A {@link PeriodMasterySnapshot} with per-TEKS aggregates sorted
 *          alphabetically by TEKS code.
 *
 * Tier thresholds:
 *   - **Tier 2**: `score < 0.7` — student is approaching mastery and needs
 *     targeted support (graphic organizers, concept maps, model building).
 *   - **Tier 3**: `score < 0.5` OR `attemptCount >= 2` — student needs
 *     intensive support (scaffolded materials, sentence starters, simplified
 *     content, one-on-one tutoring scaffolds).
 */
export function computePeriodMastery(
  entries: StudentMasteryEntry[],
  periodId: string,
  periodLabel: string,
): PeriodMasterySnapshot {
  // Filter to only entries belonging to the requested period
  const periodEntries = entries.filter((e) => e.periodId === periodId);

  // Collect unique student IDs for this period
  const studentIds = new Set(periodEntries.map((e) => e.studentId));

  // Group entries by TEKS
  const byTeks = new Map<string, StudentMasteryEntry[]>();
  for (const entry of periodEntries) {
    if (!byTeks.has(entry.teks)) {
      byTeks.set(entry.teks, []);
    }
    byTeks.get(entry.teks)!.push(entry);
  }

  // Build an aggregate for each TEKS that has at least one student score
  const teksAggregates: PeriodTEKSAggregate[] = [];

  for (const [teks, teksEntries] of byTeks) {
    const studentCount = teksEntries.length;

    // Average score across all students for this TEKS
    const averageScore =
      studentCount > 0
        ? teksEntries.reduce((sum, e) => sum + e.score, 0) / studentCount
        : 0;

    // Tier 2: score < 0.7
    const tier2Count = teksEntries.filter((e) => e.score < 0.7).length;

    // Tier 3: score < 0.5 OR attemptCount >= 2
    const tier3Count = teksEntries.filter(
      (e) => e.score < 0.5 || e.attemptCount >= 2,
    ).length;

    // Tier 1: score >= 0.85 (strong mastery — shown as band3 in the heatmap)
    const tier1Count = teksEntries.filter((e) => e.score >= 0.85).length;

    // weakestStudentIds: sort ascending by score, take first 5
    const weakestStudentIds = [...teksEntries]
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map((e) => e.studentId);

    teksAggregates.push({
      teks,
      averageScore,
      studentCount,
      tier1Count,
      tier2Count,
      tier3Count,
      weakestStudentIds,
    });
  }

  // Sort aggregates alphabetically by TEKS code for stable output
  teksAggregates.sort((a, b) => a.teks.localeCompare(b.teks));

  return {
    periodId,
    periodLabel,
    studentCount: studentIds.size,
    teksAggregates,
    computedAt: Date.now(),
  };
}
