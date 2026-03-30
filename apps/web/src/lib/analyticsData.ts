/**
 * Analytics data types and mock builder for the teacher learning-analytics page.
 *
 * Data is derived deterministically from LEARNING_UNITS so it always reflects
 * the real curriculum structure.  When a real API is wired, swap
 * buildAnalyticsSummary() for a fetch call that returns the same shape.
 */

import { LEARNING_UNITS } from "@/lib/learningHubContent";
import { TEKS_CATALOG } from "@/lib/teks/catalog";
import { PRIORITY_TEKS, interventionTierFromCheck } from "@/lib/curriculumPolicy";

// ── Shared design-token colours (match bs-teal / bs-amber / bs-coral) ─────────
// These mirror the hex values used throughout the BioSpark dark theme and are
// imported by the analytics tab components to keep values consistent.

export const ANALYTICS_COLORS = {
  teal:  "#00d4aa",
  amber: "#f5a623",
  coral: "#ff6b6b",
  muted: "#9abcb0",
  dim:   "#5a8070",
} as const;

// ── Public shape definitions ──────────────────────────────────────────────────

export type LessonRow = {
  slug: string;
  title: string;
  completedCount: number;  // students who finished this lesson
  totalStudents: number;   // class size for the selected period
};

export type StudentRow = {
  id: string;
  name: string;
  avgMastery: number;       // 0–100
  stuckLesson: string | null;
  failedAttempts: number;
  tier: 2 | 3;              // only below-threshold students are included
};

export type TeksRow = {
  teks: string;             // "B.5A"
  description: string;
  avgMastery: number;       // 0–100 class average
  tier1Count: number;       // mastered (≥ 85%)
  tier2Count: number;       // caution  (50–69%)
  tier3Count: number;       // at-risk  (< 50% or 2+ failed)
  isPriority: boolean;
};

export type AnalyticsSummary = {
  avgMastery: number;
  lessonsComplete: number;  // lessons where ≥ 70% of students completed
  tier2Count: number;
  tier3Count: number;
  lessons: LessonRow[];
  students: StudentRow[];   // sorted: Tier 3 first, then Tier 2
  teksMap: TeksRow[];
};

// ── Mock student roster ───────────────────────────────────────────────────────

const MOCK_NAMES: string[] = [
  "Aaliyah J.", "Brandon K.", "Camila R.", "Dante W.", "Elena M.",
  "Felix G.", "Grace P.", "Hector L.", "Iris N.", "Jordan T.",
  "Kayla M.", "Luis P.", "Maya C.", "Noah A.", "Olivia S.",
  "Pedro R.", "Quinn L.", "Rosa B.", "Samuel D.", "Tiana F.",
  "Uriel V.", "Vanessa E.", "Will T.", "Xiomara G.", "Yusuf A.",
];

const TOTAL_STUDENTS = MOCK_NAMES.length; // 25

// ── Deterministic pseudo-random helper ───────────────────────────────────────

/**
 * Stable integer in [min, max] (inclusive).
 * Uses a simple LCG-style mix so the same inputs always give the same output.
 */
function rng(seed1: number, seed2: number, min: number, max: number): number {
  const h = (((seed1 * 1009 + seed2 * 31) * 2053 + 1) >>> 0) % (max - min + 1);
  return min + h;
}

// ── Main builder ──────────────────────────────────────────────────────────────

export function buildAnalyticsSummary(
  unitId: string,
  period: string,
): AnalyticsSummary {
  const periodIdx =
    period === "all" ? 0 : (parseInt(period.replace("period-", ""), 10) || 0);

  const units =
    unitId === "all"
      ? LEARNING_UNITS
      : LEARNING_UNITS.filter((u) => u.id === unitId);

  // ── Lesson rows ─────────────────────────────────────────────────────────────
  const lessons: LessonRow[] = units.flatMap((unit, ui) =>
    unit.lessons.map((lesson, li) => {
      const pct = rng(ui * 100 + li, periodIdx, 42, 96);
      return {
        slug: lesson.slug,
        title: lesson.title,
        completedCount: Math.round((pct / 100) * TOTAL_STUDENTS),
        totalStudents: TOTAL_STUDENTS,
      };
    }),
  );

  // ── Student rows ────────────────────────────────────────────────────────────
  const stuckStudents: StudentRow[] = MOCK_NAMES.map((name, si) => {
    const avgMastery = rng(si, periodIdx + 1, 38, 97);
    const failedAttempts = rng(si, periodIdx + 2, 0, 3);
    const tier = interventionTierFromCheck(avgMastery, failedAttempts);

    const stuckLessonIdx =
      lessons.length > 0 ? rng(si, periodIdx + 3, 0, lessons.length - 1) : 0;
    const stuckLesson =
      tier !== null && lessons[stuckLessonIdx]
        ? lessons[stuckLessonIdx].title
        : null;

    return { id: `student-${si}`, name, avgMastery, stuckLesson, failedAttempts, tier };
  })
    .filter((s): s is StudentRow & { tier: 2 | 3 } => s.tier === 2 || s.tier === 3)
    .map((s) => ({ ...s, tier: s.tier as 2 | 3 }))
    .sort((a, b) => {
      // Tier 3 first (higher number = worse), then by avgMastery ascending
      if (a.tier !== b.tier) return b.tier - a.tier;
      return a.avgMastery - b.avgMastery;
    });

  // ── TEKS rows ───────────────────────────────────────────────────────────────
  const prioritySet = new Set<string>([...PRIORITY_TEKS]);
  const allTeks = [...new Set(units.flatMap((u) => u.teks))];

  const teksMap: TeksRow[] = allTeks.map((teks, ti) => {
    const entry = TEKS_CATALOG[teks];
    const avgMastery = rng(ti, periodIdx + 4, 48, 91);
    const raw3 = Math.max(1, Math.round(TOTAL_STUDENTS * rng(ti, periodIdx + 5, 4, 20) / 100));
    const raw2 = raw3 + Math.max(1, Math.round(TOTAL_STUDENTS * rng(ti, periodIdx + 6, 8, 24) / 100));
    const tier3Count = Math.min(raw3, TOTAL_STUDENTS);
    const tier2Count = Math.min(raw2, TOTAL_STUDENTS);
    // tier1Count = students not in Tier 2 or Tier 3 (the counts overlap in the
    // heatmap model: tier2Count includes tier3Count students)
    const tier1Count = Math.max(0, TOTAL_STUDENTS - tier2Count - tier3Count);

    return {
      teks,
      description: entry?.description ?? teks,
      avgMastery,
      tier1Count,
      tier2Count,
      tier3Count,
      isPriority: prioritySet.has(teks),
    };
  });

  // Sort: declared priority-TEKS order first, then alphabetical
  const priorityOrder: string[] = [...PRIORITY_TEKS];
  teksMap.sort((a, b) => {
    const ai = priorityOrder.indexOf(a.teks);
    const bi = priorityOrder.indexOf(b.teks);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.teks.localeCompare(b.teks);
  });

  // ── Summary metrics ─────────────────────────────────────────────────────────
  const avgMastery = teksMap.length
    ? Math.round(teksMap.reduce((s, r) => s + r.avgMastery, 0) / teksMap.length)
    : 0;

  const lessonsComplete = lessons.filter(
    (l) => l.totalStudents > 0 && l.completedCount / l.totalStudents >= 0.7,
  ).length;

  return {
    avgMastery,
    lessonsComplete,
    tier2Count: stuckStudents.filter((s) => s.tier === 2).length,
    tier3Count: stuckStudents.filter((s) => s.tier === 3).length,
    lessons,
    students: stuckStudents,
    teksMap,
  };
}
