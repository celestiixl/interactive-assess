export type LessonProgress = {
  completed: boolean;
  percent: number;
  lastVisitedAt: string;
  checkScore?: number;
  checkAttempts?: number;
  failedCheckAttempts?: number;
  timeSpentSec?: number;
};

export type LearningProgressMap = Record<string, LessonProgress>;

const PROGRESS_KEY = "biospark.learning.progress.v1";

function readRaw(): LearningProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      window.localStorage.getItem(PROGRESS_KEY) ?? "{}",
    ) as LearningProgressMap;
  } catch {
    return {};
  }
}

function writeRaw(map: LearningProgressMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
}

export function loadLearningProgress(): LearningProgressMap {
  return readRaw();
}

export function getLessonProgress(
  lessonId: string,
): LessonProgress | undefined {
  const map = readRaw();
  return map[lessonId];
}

export function updateLessonProgress(
  lessonId: string,
  patch: Partial<LessonProgress>,
): LearningProgressMap {
  const map = readRaw();
  const current = map[lessonId] ?? {
    completed: false,
    percent: 0,
    lastVisitedAt: new Date().toISOString(),
    checkAttempts: 0,
    failedCheckAttempts: 0,
    timeSpentSec: 0,
  };
  map[lessonId] = {
    ...current,
    ...patch,
    lastVisitedAt: new Date().toISOString(),
  };
  writeRaw(map);
  return map;
}

export function addLessonTime(
  lessonId: string,
  seconds: number,
): LearningProgressMap {
  const map = readRaw();
  const current = map[lessonId] ?? {
    completed: false,
    percent: 0,
    lastVisitedAt: new Date().toISOString(),
    checkAttempts: 0,
    failedCheckAttempts: 0,
    timeSpentSec: 0,
  };
  map[lessonId] = {
    ...current,
    timeSpentSec: Math.max(0, (current.timeSpentSec ?? 0) + seconds),
    lastVisitedAt: new Date().toISOString(),
  };
  writeRaw(map);
  return map;
}

export function getMostRecentLessonId(map: LearningProgressMap): string | null {
  const rows = Object.entries(map).filter(([, row]) => row.lastVisitedAt);
  if (!rows.length) return null;
  rows.sort((a, b) => (a[1].lastVisitedAt < b[1].lastVisitedAt ? 1 : -1));
  return rows[0][0] ?? null;
}
