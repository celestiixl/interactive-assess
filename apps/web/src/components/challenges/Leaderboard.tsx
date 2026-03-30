"use client";

import { useMemo, useState } from "react";
import type { Challenge } from "@/types/challenge";

export type LeaderRow = {
  name: string;
  avatar: string;
  xp: number;
  classCode: string;
  team: "A" | "B";
};

type Props = {
  rows: LeaderRow[];
  weeklyChallenge: Challenge;
  fitHeight?: boolean;
};

export default function Leaderboard({ rows, weeklyChallenge, fitHeight = false }: Props) {
  const [mode, setMode] = useState<"class" | "team">("class");

  const top10 = useMemo(() => [...rows].sort((a, b) => b.xp - a.xp).slice(0, 10), [rows]);

  const classTotals = useMemo(() => {
    const totals = new Map<string, number>();
    rows.forEach((row) => {
      totals.set(row.classCode, (totals.get(row.classCode) ?? 0) + row.xp);
    });
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const teamTotals = useMemo(() => {
    const a = rows.filter((r) => r.team === "A").reduce((acc, row) => acc + row.xp, 0);
    const b = rows.filter((r) => r.team === "B").reduce((acc, row) => acc + row.xp, 0);
    return { a, b };
  }, [rows]);

  return (
    <section className={`grid gap-4 lg:grid-cols-[1.1fr_1fr] ${fitHeight ? "h-full min-h-0" : ""}`}>
      <div className={`rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 ${fitHeight ? "flex min-h-0 flex-col" : ""}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-bs-text-sub">Quest Leagues</h3>
          <div className="flex rounded-lg border border-[var(--bs-border)] bg-[var(--bs-raised)] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("class")}
              className={`rounded-md px-2 py-1 ${mode === "class" ? "bg-bs-surface text-bs-text" : "text-bs-text-sub"}`}
            >
              Class vs Class
            </button>
            <button
              type="button"
              onClick={() => setMode("team")}
              className={`rounded-md px-2 py-1 ${mode === "team" ? "bg-bs-surface text-bs-text" : "text-bs-text-sub"}`}
            >
              Team A/B
            </button>
          </div>
        </div>

        {mode === "class" ? (
          <div className={`space-y-2 ${fitHeight ? "min-h-0 overflow-y-auto pr-1" : ""}`}>
            {classTotals.map(([classCode, xp], index) => (
              <div key={classCode} className="flex items-center justify-between rounded-lg border border-[var(--bs-border)] px-3 py-2 text-sm">
                <span className="font-semibold text-bs-text">#{index + 1} {classCode}</span>
                <span className="font-bold text-violet-700">{xp} XP</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid gap-2 sm:grid-cols-2 ${fitHeight ? "min-h-0 overflow-y-auto pr-1" : ""}`}>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="text-sm font-bold text-blue-900">Team A</div>
              <div className="text-xl font-extrabold text-blue-700">{teamTotals.a} XP</div>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
              <div className="text-sm font-bold text-rose-900">Team B</div>
              <div className="text-xl font-extrabold text-rose-700">{teamTotals.b} XP</div>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">Boss Challenge • High XP</div>
          <div className="mt-1 text-sm font-semibold text-bs-text">{weeklyChallenge.modes.text.question}</div>
          <div className="mt-1 text-xs text-bs-text-sub">Reward: {weeklyChallenge.xpReward * 2} XP • {weeklyChallenge.realWorldTag}</div>
        </div>
      </div>

      <div className={`rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 ${fitHeight ? "flex min-h-0 flex-col" : ""}`}>
        <h3 className="text-sm font-bold uppercase tracking-wide text-bs-text-sub">Top 10 Hall of Fame</h3>
        <div className={`mt-3 space-y-2 ${fitHeight ? "min-h-0 overflow-y-auto pr-1" : ""}`}>
          {top10.map((row, index) => (
            <div key={`${row.name}-${index}`} className="flex items-center justify-between rounded-lg border border-[var(--bs-border)] px-3 py-2">
              <div className="text-sm text-bs-text">
                <span className="mr-2 text-base">{row.avatar}</span>
                <span className="font-semibold">#{index + 1} {row.name}</span>
                <span className="ml-2 text-xs text-bs-text-sub">({row.classCode})</span>
              </div>
              <span className="text-sm font-bold text-violet-700">{row.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
