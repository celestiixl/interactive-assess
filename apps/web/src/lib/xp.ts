"use client";

const XP_KEY = "practice_xp_v1";
const STREAK_KEY = "practice_streak_v1";

export function getXP(): number {
  try {
    return Number(localStorage.getItem(XP_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

export function setXP(xp: number) {
  try {
    localStorage.setItem(XP_KEY, String(Math.max(0, Math.floor(xp))));
  } catch {}
}

export function getStreak(): number {
  try {
    return Number(localStorage.getItem(STREAK_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

export function setStreak(n: number) {
  try {
    localStorage.setItem(STREAK_KEY, String(Math.max(0, Math.floor(n))));
  } catch {}
}

export function addXPForResult(correct: boolean): {
  xp: number;
  streak: number;
  gained: number;
  leveledUp: boolean;
} {
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
