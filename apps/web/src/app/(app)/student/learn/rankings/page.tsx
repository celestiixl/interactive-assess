"use client";

import ThemeToggle from "@/components/ia/ThemeToggle";
import Leaderboard from "@/components/challenges/Leaderboard";
import { CHALLENGES } from "@/lib/challengeData";
import { QUEST_LEADER_ROWS } from "@/lib/questRankings";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import { BackLink } from "@/components/nav/BackLink";

export default function QuestRankingsPage() {
  const dayIndex = Math.floor(Date.now() / 86400000) % CHALLENGES.length;
  const weeklyChallenge = CHALLENGES.find((c) => c.difficulty === 3) ?? CHALLENGES[dayIndex];

  return (
    <main className="ia-vh-page relative h-dvh overflow-hidden px-3 py-3 text-bs-text sm:px-4 sm:py-4">
      <BackLink href="/student/learn" label="Back to missions" />
      <div className="ia-vh-grid grid h-full min-h-0 grid-rows-[auto_1fr] gap-3">
        <section className="ia-vh-tight rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4">
          <div>
            <h1 className="text-xl font-extrabold text-bs-text">BioSpark Quest Rankings</h1>
            <p className="mt-1 text-sm text-bs-text-sub">
              Full rankings view with Quest Leagues and Hall of Fame.
            </p>
          </div>
        </section>

        <div className="min-h-0">
          <Leaderboard rows={QUEST_LEADER_ROWS} weeklyChallenge={weeklyChallenge} fitHeight />
        </div>
      </div>

        <StudentFloatingDock />
      <ThemeToggle />
    </main>
  );
}
