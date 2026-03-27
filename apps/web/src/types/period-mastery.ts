/**
 * Period-level mastery snapshot types.
 *
 * These types power the teacher dashboard's per-period TEKS mastery view,
 * aggregating individual student scores into period-level analytics.
 */

/** One student's mastery contribution to a period aggregate */
export interface StudentMasteryEntry {
  studentId: string;
  periodId: string; // e.g. "period-1"
  teks: string; // "B.5A" format — never lowercase or no-dot
  score: number; // 0–1
  attemptCount: number;
  lastUpdated: number; // timestamp
}

/** Aggregated mastery for one TEKS across all students in a period */
export interface PeriodTEKSAggregate {
  teks: string;
  averageScore: number; // mean of all student scores for this TEKS
  studentCount: number; // how many students have data for this TEKS
  tier1Count: number; // students with score >= 0.85 (strong mastery)
  tier2Count: number; // students with score < 0.7
  tier3Count: number; // students with score < 0.5 or attemptCount >= 2
  weakestStudentIds: string[]; // up to 5 student IDs with lowest scores
}

/** Full snapshot for one class period */
export interface PeriodMasterySnapshot {
  periodId: string; // e.g. "period-1", "period-2"
  periodLabel: string; // e.g. "Period 1 — 8:00 AM"
  studentCount: number;
  teksAggregates: PeriodTEKSAggregate[];
  computedAt: number; // Date.now() timestamp
}
