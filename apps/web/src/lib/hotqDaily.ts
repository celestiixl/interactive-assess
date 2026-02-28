import { HOT_QUESTIONS } from "@/lib/hotQuestions";

export function todayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Deterministic index from date string (YYYY-MM-DD)
 * Simple hash → stable across clients.
 */
function hashDate(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function pickDailyQuestion(dateStr: string = todayKey()) {
  if (HOT_QUESTIONS.length === 0) return null;
  const idx = hashDate(dateStr) % HOT_QUESTIONS.length;
  return HOT_QUESTIONS[idx];
}
