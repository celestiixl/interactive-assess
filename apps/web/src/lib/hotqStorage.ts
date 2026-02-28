export type HotQCounts = {
  total: number;
  counts: number[];
};

function countsKey(questionId: string) {
  return `hotq::${questionId}::counts`;
}
function answeredKey(questionId: string) {
  return `hotq::${questionId}::answered`;
}

export function getCounts(questionId: string, choicesLen: number): HotQCounts {
  if (typeof window === "undefined")
    return { total: 0, counts: Array(choicesLen).fill(0) };

  try {
    const raw = window.localStorage.getItem(countsKey(questionId));
    if (!raw) return { total: 0, counts: Array(choicesLen).fill(0) };
    const parsed = JSON.parse(raw) as HotQCounts;

    const counts = Array(choicesLen).fill(0);
    for (let i = 0; i < choicesLen; i++)
      counts[i] = Number(parsed.counts?.[i] ?? 0);

    const total = counts.reduce((a, b) => a + b, 0);
    return { total, counts };
  } catch {
    return { total: 0, counts: Array(choicesLen).fill(0) };
  }
}

export function recordResponse(
  questionId: string,
  choicesLen: number,
  choiceIndex: number,
): HotQCounts {
  const current = getCounts(questionId, choicesLen);
  const next = {
    total: current.total + 1,
    counts: current.counts.map((v, i) => (i === choiceIndex ? v + 1 : v)),
  };
  try {
    window.localStorage.setItem(countsKey(questionId), JSON.stringify(next));
  } catch {}
  return next;
}

export function resetCounts(questionId: string, choicesLen: number) {
  const empty = { total: 0, counts: Array(choicesLen).fill(0) };
  try {
    window.localStorage.setItem(countsKey(questionId), JSON.stringify(empty));
  } catch {}
}

/**
 * Locking:
 * We store an "answered marker" for the day: `${YYYY-MM-DD}|${choiceIndex}`
 */
function todayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getAnsweredToday(questionId: string): {
  answered: boolean;
  choiceIndex: number | null;
} {
  if (typeof window === "undefined")
    return { answered: false, choiceIndex: null };
  try {
    const raw = window.localStorage.getItem(answeredKey(questionId));
    if (!raw) return { answered: false, choiceIndex: null };
    const [dateStr, idxStr] = raw.split("|");
    if (dateStr !== todayKey()) return { answered: false, choiceIndex: null };
    const idx = Number(idxStr);
    return { answered: true, choiceIndex: Number.isFinite(idx) ? idx : null };
  } catch {
    return { answered: false, choiceIndex: null };
  }
}

export function setAnsweredToday(questionId: string, choiceIndex: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      answeredKey(questionId),
      `${todayKey()}|${choiceIndex}`,
    );
  } catch {}
}

export function clearAnswered(questionId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(answeredKey(questionId));
  } catch {}
}

export function getTodayKeyForUI() {
  return todayKey();
}
