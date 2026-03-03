"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ia/ThemeToggle";
import Leaderboard from "@/components/challenges/Leaderboard";
import { CHALLENGES } from "@/lib/challengeData";
import { QUEST_LEADER_ROWS } from "@/lib/questRankings";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";

export default function QuestRankingsPage() {
  const dayIndex = Math.floor(Date.now() / 86400000) % CHALLENGES.length;
  const weeklyChallenge = CHALLENGES.find((c) => c.difficulty === 3) ?? CHALLENGES[dayIndex];

  return (
    <main className="ia-vh-page relative h-dvh overflow-hidden px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <div className="ia-vh-grid grid h-full min-h-0 grid-rows-[auto_1fr] gap-3">
        <section className="ia-vh-tight rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">BioSpark Quest Rankings</h1>
              <p className="mt-1 text-sm text-slate-600">
                Full rankings view with Quest Leagues and Hall of Fame.
              </p>
            </div>
            <Link
              href="/student/learn"
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Missions
            </Link>
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
