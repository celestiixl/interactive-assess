#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO"

mkdir -p apps/web/src/lib
mkdir -p apps/web/src/components/student

# --- XP utils ---
cat > apps/web/src/lib/xp.ts <<'TS'
"use client";

const XP_KEY = "practice_xp_v1";
const STREAK_KEY = "practice_streak_v1";

export function getXP(): number {
  try { return Number(localStorage.getItem(XP_KEY) || "0") || 0; } catch { return 0; }
}

export function setXP(xp: number) {
  try { localStorage.setItem(XP_KEY, String(Math.max(0, Math.floor(xp)))); } catch {}
}

export function getStreak(): number {
  try { return Number(localStorage.getItem(STREAK_KEY) || "0") || 0; } catch { return 0; }
}

export function setStreak(n: number) {
  try { localStorage.setItem(STREAK_KEY, String(Math.max(0, Math.floor(n)))); } catch {}
}

export function addXPForResult(correct: boolean): { xp: number; streak: number; gained: number; leveledUp: boolean } {
  const prevXP = getXP();
  const prevStreak = getStreak();

  let streak = correct ? prevStreak + 1 : 0;

  let gained = correct ? 5 : 0;
  // streak bonus at 3 in a row
  if (correct && streak === 3) gained += 20;

  const xp = prevXP + gained;

  // simple level curve: every 100 XP
  const prevLevel = Math.floor(prevXP / 100);
  const newLevel = Math.floor(xp / 100);

  setXP(xp);
  setStreak(streak);

  return { xp, streak, gained, leveledUp: newLevel > prevLevel };
}

export function levelFromXP(xp: number) {
  const level = Math.floor(xp / 100) + 1;
  const into = xp % 100;
  return { level, into, next: 100 };
}

export function resetXP() {
  try {
    localStorage.removeItem(XP_KEY);
    localStorage.removeItem(STREAK_KEY);
  } catch {}
}
TS

# --- Practice XP Header (listens to events) ---
cat > apps/web/src/components/student/PracticeXPHeader.tsx <<'TSX'
"use client";

import { useEffect, useMemo, useState } from "react";
import { addXPForResult, getXP, getStreak, levelFromXP, resetXP } from "@/lib/xp";

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
    <div className="mb-4 rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Practice Progress</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            Level {meta.level}
            <span className="ml-2 text-sm font-semibold text-slate-600">({xp} XP)</span>
          </div>
          <div className="mt-1 text-sm text-slate-600">Streak: {streak}</div>
        </div>

        <div className="flex items-center gap-3">
          {toast ? (
            <div className="rounded-full border bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
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
            className="rounded-full border bg-white px-3 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Reset XP
          </button>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, (meta.into / meta.next) * 100))}` + "%" }}
        />
      </div>
      <div className="mt-2 text-xs text-slate-500">{meta.into}/{meta.next} XP to next level</div>
    </div>
  );
}
TSX

# --- Explanation panel (expects you pass item + correctness if you have it, otherwise still useful) ---
cat > apps/web/src/components/student/AnswerFeedback.tsx <<'TSX'
"use client";

type Props = {
  show: boolean;
  correct: boolean | null;
  item?: any;
};

export default function AnswerFeedback({ show, correct, item }: Props) {
  if (!show) return null;

  const explanation =
    item?.explanation ||
    item?.rationale ||
    item?.feedback ||
    null;

  return (
    <div className={`mt-4 rounded-2xl border p-4 ${correct ? "bg-emerald-50" : "bg-amber-50"}`}>
      <div className="text-sm font-semibold text-slate-900">
        {correct === null ? "Feedback" : correct ? "Correct ✅" : "Not yet"}
      </div>
      <div className="mt-2 text-sm text-slate-700">
        {explanation ? explanation : (
          <>
            <div className="font-semibold text-slate-800">Why this matters:</div>
            <div className="mt-1">
              The goal is to connect the answer to the biology concept (vocab + cause/effect).
              If you missed it, re-read the question and look for keywords like <span className="font-semibold">energy flow</span>,
              <span className="font-semibold"> interactions</span>, or <span className="font-semibold">evidence</span>.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
TSX

echo "✅ Added XP + feedback components."
echo "Next: patch Practice page to show XP header and emit practice-result events."
