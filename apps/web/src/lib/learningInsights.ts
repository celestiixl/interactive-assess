import { LEARNING_UNITS, type LearningUnit } from "@/lib/learningHubContent";
import {
  interventionStrategyForTier,
  interventionTierFromCheck,
  isPriorityTeks,
  type InterventionTier,
} from "@/lib/curriculumPolicy";
import type { LearningProgressMap } from "@/lib/learningProgress";
import {
  getStudentAssignmentById,
  isAssignmentComplete,
  type StudentAssignment,
} from "@/lib/studentAssignments";

export type TeksHeatmapRow = {
  teks: string;
  lessons: number;
  avgCheck: number;
  completionPct: number;
  proficiency: "mastered" | "developing" | "needs-support";
};

function proficiencyFromScore(score: number): TeksHeatmapRow["proficiency"] {
  if (score >= 80) return "mastered";
  if (score >= 60) return "developing";
  return "needs-support";
}

export function buildTeksHeatmap(
  progress: LearningProgressMap,
): TeksHeatmapRow[] {
  return LEARNING_UNITS.map((unit) => {
    const lessonRows = unit.lessons.map((lesson) => progress[lesson.id]);
    const lessonCount = unit.lessons.length;
    const completionCount = lessonRows.filter((row) => row?.completed).length;
    const checks = lessonRows
      .map((row) => row?.checkScore)
      .filter((score): score is number => typeof score === "number");

    const avgCheck = checks.length
      ? Math.round(checks.reduce((a, b) => a + b, 0) / checks.length)
      : 0;

    return unit.teks.map((teks) => ({
      teks,
      lessons: lessonCount,
      avgCheck,
      completionPct: Math.round((completionCount / lessonCount) * 100),
      proficiency: proficiencyFromScore(avgCheck),
    }));
  })
    .flat()
    .sort((a, b) => a.teks.localeCompare(b.teks));
}

export function getWeakestTeks(
  progress: LearningProgressMap,
  take = 3,
): TeksHeatmapRow[] {
  return buildTeksHeatmap(progress)
    .sort(
      (a, b) => a.avgCheck - b.avgCheck || a.completionPct - b.completionPct,
    )
    .slice(0, take);
}

export type InterventionItem = {
  lessonId: string;
  lessonTitle: string;
  unitTitle: string;
  tier: Exclude<InterventionTier, null>;
  reason: string;
  recommendation: string;
  href: string;
};

export function buildInterventionQueue(
  progress: LearningProgressMap,
): InterventionItem[] {
  const queue: InterventionItem[] = [];
  for (const unit of LEARNING_UNITS) {
    for (const lesson of unit.lessons) {
      const row = progress[lesson.id];
      if (!row) continue;

      const tier = interventionTierFromCheck(
        row.checkScore,
        row.failedCheckAttempts ?? row.checkAttempts,
      );
      const stalled = !row.completed && (row.percent ?? 0) >= 60;

      if (tier || stalled) {
        const resolvedTier: Exclude<InterventionTier, null> = tier ?? 2;
        const reason =
          tier === 3
            ? (row.checkScore ?? 100) < 50
              ? "Quick-check score below 50%"
              : "Two or more failed quick-check attempts"
            : tier === 2
              ? "Quick-check score below 70%"
              : "Progress stalled before completion";

        queue.push({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          unitTitle: unit.title,
          tier: resolvedTier,
          reason,
          recommendation: interventionStrategyForTier(resolvedTier),
          href: `/student/learn/${unit.id}/${lesson.slug}`,
        });
      }
    }
  }
  return queue;
}

export type LearningFunnel = {
  totalLessons: number;
  started: number;
  checked: number;
  completed: number;
};

export function buildLearningFunnel(
  progress: LearningProgressMap,
): LearningFunnel {
  const lessons = LEARNING_UNITS.flatMap((u) => u.lessons);
  const rows = lessons.map((lesson) => progress[lesson.id]);
  return {
    totalLessons: lessons.length,
    started: rows.filter((row) => (row?.percent ?? 0) > 0).length,
    checked: rows.filter((row) => typeof row?.checkScore === "number").length,
    completed: rows.filter((row) => row?.completed).length,
  };
}

export type StuckPoint = {
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  avgScore: number;
  attempts: number;
  href: string;
};

export function buildStuckPoints(
  progress: LearningProgressMap,
  take = 5,
): StuckPoint[] {
  return LEARNING_UNITS.flatMap((unit) =>
    unit.lessons.map((lesson) => {
      const row = progress[lesson.id];
      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonSlug: lesson.slug,
        avgScore: row?.checkScore ?? 0,
        attempts: row?.checkAttempts ?? 0,
        href: `/student/learn/${unit.id}/${lesson.slug}`,
      };
    }),
  )
    .filter((row) => row.attempts > 0)
    .sort((a, b) => a.avgScore - b.avgScore || b.attempts - a.attempts)
    .slice(0, take);
}

export type WeeklyGuardianSnapshot = {
  lessonsCompleted: number;
  avgCheck: number;
  timeSpentMin: number;
  upcomingAssignments: StudentAssignment[];
  missingAssignments: StudentAssignment[];
};

export function buildGuardianSnapshot(
  progress: LearningProgressMap,
): WeeklyGuardianSnapshot {
  const rows = Object.values(progress);
  const completed = rows.filter((row) => row.completed).length;
  const checks = rows
    .map((row) => row.checkScore)
    .filter((score): score is number => typeof score === "number");
  const avgCheck = checks.length
    ? Math.round(checks.reduce((a, b) => a + b, 0) / checks.length)
    : 0;

  const timeSpentSec = rows.reduce(
    (sum, row) => sum + (row.timeSpentSec ?? 0),
    0,
  );

  const linked = LEARNING_UNITS.map((unit) =>
    getStudentAssignmentById(unit.linkedAssignmentId),
  ).filter((a): a is StudentAssignment => Boolean(a));

  const upcomingAssignments = linked.filter(
    (assignment) => !isAssignmentComplete(assignment) && !!assignment.dueDate,
  );

  const missingAssignments = linked.filter(
    (assignment) =>
      !isAssignmentComplete(assignment) && assignment.status === "not_started",
  );

  return {
    lessonsCompleted: completed,
    avgCheck,
    timeSpentMin: Math.round(timeSpentSec / 60),
    upcomingAssignments,
    missingAssignments,
  };
}

export function isLessonUnlocked(
  unit: LearningUnit,
  lessonIndex: number,
  progress: LearningProgressMap,
): boolean {
  if (lessonIndex === 0) return true;

  const prev = unit.lessons[lessonIndex - 1];
  const currentLesson = unit.lessons[lessonIndex];
  const prevProgress = progress[prev.id];
  const prevMastered =
    Boolean(prevProgress?.completed) && (prevProgress?.checkScore ?? 0) >= 70;

  const currentHasPriority = (currentLesson?.teks ?? []).some((teks) =>
    isPriorityTeks(teks),
  );

  // Priority TEKS lessons are mastery-gated and cannot bypass via assignment state.
  if (currentHasPriority) {
    return prevMastered;
  }

  if (prevMastered) return true;

  const linkedAssignment = getStudentAssignmentById(unit.linkedAssignmentId);
  return (
    isAssignmentComplete(linkedAssignment) ||
    linkedAssignment?.status === "in_progress"
  );
}
