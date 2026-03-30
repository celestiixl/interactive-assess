"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addXPForResult,
  getXP,
  getStreak,
  levelFromXP,
  resetXP,
} from "@/lib/xp";

type PracticeResultDetail = { correct: boolean };

export default function PracticeXPHeader() {
  const [xp, setXp] = useState(0);
  const [streak, setStreakState] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setXp(getXP());
    setStreakState(getStreak());

    const handler = (e: Event) => {
      const ce = e as CustomEvent<PracticeResultDetail>;
      const correct = !!ce.detail?.correct;
      const res = addXPForResult(correct);
      setXp(res.xp);
      setStreakState(res.streak);

      if (res.gained > 0) setToast(`+${res.gained} XP`);
      if (res.leveledUp) setToast(`Level up! 🎉`);
      window.setTimeout(() => setToast(null), 1400);
    };

    window.addEventListener("practice-result", handler as any);
    return () => window.removeEventListener("practice-result", handler as any);
  }, []);

  const meta = useMemo(() => levelFromXP(xp), [xp]);

  return (
    <div className="mb-4 p-4 ia-card-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
            Practice Progress
          </div>
          <div className="mt-1 text-lg font-semibold text-bs-text">
            Level {meta.level}
            <span className="ml-2 text-sm font-semibold text-bs-text-sub">
              ({xp} XP)
            </span>
          </div>
          <div className="mt-1 text-sm text-bs-text-sub">Streak: {streak}</div>
        </div>

        <div className="flex items-center gap-3">
          {toast ? (
            <div className="rounded-full border bg-bs-teal px-3 py-1 text-sm font-semibold text-[#080f12]">
              {toast}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              resetXP();
              setXp(0);
              setStreakState(0);
              setToast("Reset");
              window.setTimeout(() => setToast(null), 900);
            }}
            className="rounded-full border bg-bs-surface px-3 py-1 text-sm font-semibold text-bs-text hover:bg-[var(--bs-raised)]"
          >
            Reset XP
          </button>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--teal-dim)] to-[var(--teal)] transition-all duration-500"
          style={{
            width:
              `${Math.max(0, Math.min(100, (meta.into / meta.next) * 100))}` +
              "%",
          }}
        />
      </div>
      <div className="mt-2 text-xs text-bs-text-sub">
        {meta.into}/{meta.next} XP to next level
      </div>
    </div>
  );
}
