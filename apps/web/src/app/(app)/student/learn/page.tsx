"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ThemeToggle from "@/components/ia/ThemeToggle";
import type { Challenge, StudentProfile } from "@/types/challenge";
import {
  BADGE_MILESTONES,
  CHALLENGES,
  CHALLENGE_WHY_MATTERS,
  getTodaysHook,
  levelFromXP,
  levelTitle,
} from "@/lib/challengeData";
import { useAdaptiveEngine } from "@/components/challenges/AdaptiveEngine";
import AdaptiveEngine from "@/components/challenges/AdaptiveEnginePanel";
import Dashboard from "@/components/challenges/Dashboard";
import ModeSelector from "@/components/challenges/ModeSelector";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import BadgeShelf from "@/components/challenges/BadgeShelf";
import StreakTracker from "@/components/challenges/StreakTracker";
import RankingsPreview from "@/components/challenges/RankingsPreview";
import { QUEST_LEADER_ROWS } from "@/lib/questRankings";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import {
  DEFAULT_PROFILE,
  LAST_LOGIN_KEY,
  loadStudentProfile,
  saveStudentProfile,
} from "@/lib/studentProfile";

function ensureDailyStreak(profile: StudentProfile): StudentProfile {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const last = window.localStorage.getItem(LAST_LOGIN_KEY);
    if (last === today) return profile;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const streak = last === yesterday ? profile.streak + 1 : 1;
    window.localStorage.setItem(LAST_LOGIN_KEY, today);
    return { ...profile, streak };
  } catch {
    return profile;
  }
}

function masteryPercent(correct: number, total: number): number {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function getBadgeUpdates(profile: StudentProfile): string[] {
  const badgeSet = new Set(profile.badges);
  const hasAnyCorrect = Object.values(profile.topicAccuracy).some((row) => row.correct > 0);
  const cell = profile.topicAccuracy["Cell Biology"];
  const cellPct = cell ? masteryPercent(cell.correct, cell.total) : 0;

  if (hasAnyCorrect) badgeSet.add("first-correct");
  if (profile.streak >= 5) badgeSet.add("streak-5");
  if (profile.xp >= 100) badgeSet.add("xp-100");
  if (profile.xp >= 300) badgeSet.add("xp-300");
  if (cellPct >= 80 && (cell?.total ?? 0) >= 3) badgeSet.add("mastery-cell");

  return [...badgeSet];
}

function pickNextChallenge(
  allChallenges: Challenge[],
  topic: string,
  difficulty: 1 | 2 | 3,
  excludeId?: string,
): Challenge {
  const sameTopic = allChallenges.filter((c) => c.topic === topic && c.id !== excludeId);
  const exact = sameTopic.filter((c) => c.difficulty === difficulty);
  if (exact.length) return exact[Math.floor(Math.random() * exact.length)];

  const close = sameTopic.filter((c) => Math.abs(c.difficulty - difficulty) <= 1);
  if (close.length) return close[Math.floor(Math.random() * close.length)];

  const fallback = allChallenges.filter((c) => c.id !== excludeId);
  return fallback[Math.floor(Math.random() * fallback.length)];
}

export default function StudentLearningHubPage() {
  const challengeRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);
  const [showLevelBurst, setShowLevelBurst] = useState(false);

  useEffect(() => {
    try {
      const withStreak = ensureDailyStreak(loadStudentProfile());
      setProfile(withStreak);
      saveStudentProfile(withStreak);
    } catch {
      setProfile(ensureDailyStreak(DEFAULT_PROFILE));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveStudentProfile(profile);
  }, [profile, ready]);

  const { getDifficultyForTopic, registerAttempt, topicSummaries } = useAdaptiveEngine(profile);

  const topics = useMemo(() => Array.from(new Set(CHALLENGES.map((c) => c.topic))), []);
  const [topicIndex, setTopicIndex] = useState(0);
  const activeTopic = topics[topicIndex % topics.length] ?? "Cell Biology";

  const [challenge, setChallenge] = useState<Challenge>(() => {
    return pickNextChallenge(CHALLENGES, "Cell Biology", 1);
  });

  useEffect(() => {
    const difficulty = getDifficultyForTopic(activeTopic);
    setChallenge((prev) => pickNextChallenge(CHALLENGES, activeTopic, difficulty, prev.id));
  }, [activeTopic]);

  const masteryRows = useMemo(() => {
    return topics.map((topic) => {
      const row = profile.topicAccuracy[topic] ?? { correct: 0, total: 0 };
      return { topic, percent: masteryPercent(row.correct, row.total) };
    });
  }, [profile.topicAccuracy, topics]);

  const levelProgress = profile.xp % 100;
  const availableModes = {
    video: Boolean(challenge.modes.video),
    interactive: Boolean(challenge.modes.interactive),
    visual: Boolean(challenge.modes.visual),
    text: true,
  };

  function handleModeSelect(nextMode: StudentProfile["preferredMode"]) {
    setProfile((prev) => ({ ...prev, preferredMode: nextMode }));
  }

  function handleResult(correct: boolean, xpGained: number) {
    setProfile((prev) => {
      const topicStats = prev.topicAccuracy[challenge.topic] ?? { correct: 0, total: 0 };
      const nextTopicStats = {
        correct: topicStats.correct + (correct ? 1 : 0),
        total: topicStats.total + 1,
      };

      const nextXP = prev.xp + xpGained;
      const nextLevel = levelFromXP(nextXP);

      const updated: StudentProfile = {
        ...prev,
        xp: nextXP,
        level: nextLevel,
        topicAccuracy: {
          ...prev.topicAccuracy,
          [challenge.topic]: nextTopicStats,
        },
      };

      updated.badges = getBadgeUpdates(updated);
      registerAttempt(challenge.topic, updated);

      if (nextLevel > prev.level) {
        setShowLevelBurst(true);
        window.setTimeout(() => setShowLevelBurst(false), 1500);
      }

      return updated;
    });
  }

  function nextChallenge() {
    setTopicIndex((prev) => prev + 1);
    const nextTopic = topics[(topicIndex + 1) % topics.length] ?? activeTopic;
    const difficulty = getDifficultyForTopic(nextTopic);
    setChallenge((prev) => pickNextChallenge(CHALLENGES, nextTopic, difficulty, prev.id));
  }

  function quickStart() {
    challengeRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!ready) {
    return <main className="p-6 text-slate-900">Loading BioSpark Quest...</main>;
  }

  return (
    <main className="ia-vh-page relative h-dvh overflow-hidden px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <div className="ia-vh-grid grid h-full min-h-0 grid-rows-[auto_1fr] gap-3">
        <Dashboard
          profile={profile}
          levelTitle={levelTitle(profile.level)}
          xpInLevel={levelProgress}
          xpToNextLevel={100}
          dailyHook={getTodaysHook()}
          topicMastery={masteryRows}
          onQuickStart={quickStart}
        />

        <div className="ia-vh-grid grid min-h-0 gap-3 lg:grid-cols-[1.25fr_1fr]">
          <div className="ia-vh-grid grid min-h-0 grid-rows-[auto_1fr_auto] gap-3">
            <ModeSelector
              selectedMode={profile.preferredMode}
              availableModes={availableModes}
              onSelect={handleModeSelect}
            />

            <div ref={challengeRef} className="ia-vh-scroll min-h-0 overflow-y-auto pr-1">
              <ChallengeCard
                challenge={challenge}
                mode={profile.preferredMode}
                whyMatters={CHALLENGE_WHY_MATTERS[challenge.id] ?? "Biology connects directly to your health and community decisions."}
                onResult={handleResult}
                onNext={nextChallenge}
              />
            </div>

            <AdaptiveEngine topicSummaries={topicSummaries} />
          </div>

          <div className="ia-vh-grid grid min-h-0 grid-rows-[auto_1fr_auto] gap-3">
            <StreakTracker streak={profile.streak} />

            <div className="ia-vh-scroll min-h-0 space-y-3 overflow-y-auto pr-1">
              <BadgeShelf earnedBadges={profile.badges} />
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
                <div className="font-semibold text-slate-900">Quest Titles</div>
                <div className="mt-1">Cell Apprentice → DNA Decoder → Ecosystem Ranger → Genome Guardian → Apex Predator</div>
                <div className="mt-3 font-semibold text-slate-900">Unlock Milestones</div>
                <div className="mt-1">{BADGE_MILESTONES.map((b) => b.label).join(" • ")}</div>
              </div>
            </div>

            <RankingsPreview rows={QUEST_LEADER_ROWS} />
          </div>
        </div>
      </div>

      {showLevelBurst && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="ia-level-burst text-center">
            <div className="text-3xl font-extrabold text-emerald-600">Level Up!</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{levelTitle(profile.level)}</div>
          </div>
        </div>
      )}

      <StudentFloatingDock />
      <ThemeToggle />
    </main>
  );
}
