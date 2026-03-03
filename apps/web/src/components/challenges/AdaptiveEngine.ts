import { useMemo, useState } from "react";
import type { StudentProfile } from "@/types/challenge";

type DifficultyMap = Record<string, 1 | 2 | 3>;
type StreakMap = Record<string, number>;

export type AdaptiveSnapshot = {
  difficultyByTopic: DifficultyMap;
  highAccuracyStreakByTopic: StreakMap;
  lowAccuracyStreakByTopic: StreakMap;
};

export function buildAdaptiveSnapshot(profile: StudentProfile): AdaptiveSnapshot {
  const difficultyByTopic: DifficultyMap = {};
  const highAccuracyStreakByTopic: StreakMap = {};
  const lowAccuracyStreakByTopic: StreakMap = {};

  for (const topic of Object.keys(profile.topicAccuracy)) {
    difficultyByTopic[topic] = 1;
    highAccuracyStreakByTopic[topic] = 0;
    lowAccuracyStreakByTopic[topic] = 0;
  }

  return {
    difficultyByTopic,
    highAccuracyStreakByTopic,
    lowAccuracyStreakByTopic,
  };
}

export function useAdaptiveEngine(initialProfile: StudentProfile) {
  const [snapshot, setSnapshot] = useState<AdaptiveSnapshot>(() =>
    buildAdaptiveSnapshot(initialProfile),
  );

  const getDifficultyForTopic = (topic: string): 1 | 2 | 3 =>
    snapshot.difficultyByTopic[topic] ?? 1;

  const registerAttempt = (topic: string, profile: StudentProfile): 1 | 2 | 3 => {
    const accuracy = profile.topicAccuracy[topic] ?? { correct: 0, total: 0 };
    const ratio = accuracy.total > 0 ? accuracy.correct / accuracy.total : 0;

    let nextDifficulty = snapshot.difficultyByTopic[topic] ?? 1;
    let highStreak = snapshot.highAccuracyStreakByTopic[topic] ?? 0;
    let lowStreak = snapshot.lowAccuracyStreakByTopic[topic] ?? 0;

    highStreak = ratio > 0.8 ? highStreak + 1 : 0;
    lowStreak = ratio < 0.5 ? lowStreak + 1 : 0;

    if (highStreak >= 3 && nextDifficulty < 3) {
      nextDifficulty = (nextDifficulty + 1) as 1 | 2 | 3;
      highStreak = 0;
      lowStreak = 0;
    }

    if (lowStreak >= 2 && nextDifficulty > 1) {
      nextDifficulty = (nextDifficulty - 1) as 1 | 2 | 3;
      highStreak = 0;
      lowStreak = 0;
    }

    setSnapshot((prev) => ({
      difficultyByTopic: {
        ...prev.difficultyByTopic,
        [topic]: nextDifficulty,
      },
      highAccuracyStreakByTopic: {
        ...prev.highAccuracyStreakByTopic,
        [topic]: highStreak,
      },
      lowAccuracyStreakByTopic: {
        ...prev.lowAccuracyStreakByTopic,
        [topic]: lowStreak,
      },
    }));

    return nextDifficulty;
  };

  const topicSummaries = useMemo(() => {
    return Object.keys(snapshot.difficultyByTopic).map((topic) => ({
      topic,
      difficulty: snapshot.difficultyByTopic[topic],
      highStreak: snapshot.highAccuracyStreakByTopic[topic] ?? 0,
      lowStreak: snapshot.lowAccuracyStreakByTopic[topic] ?? 0,
    }));
  }, [snapshot]);

  return {
    snapshot,
    topicSummaries,
    getDifficultyForTopic,
    registerAttempt,
  };
}
