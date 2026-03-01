"use client";


import * as React from "react";
import { pickDailyQuestion } from "@/lib/hotqDaily";
import TeksTooltip from "@/components/common/TeksTooltip";
import { HOT_QUESTIONS } from "@/lib/hotQuestions";
import { getCounts, resetCounts, getTodayKeyForUI } from "@/lib/hotqStorage";
import { formatUSDate } from "@/lib/dateFormat";

function pickRandomDifferent(currentId?: string) {
  if (HOT_QUESTIONS.length === 0) return null;
  if (HOT_QUESTIONS.length === 1) return HOT_QUESTIONS[0];
  let q = HOT_QUESTIONS[Math.floor(Math.random() * HOT_QUESTIONS.length)];
  while (currentId && q.id === currentId)
    q = HOT_QUESTIONS[Math.floor(Math.random() * HOT_QUESTIONS.length)];
  return q;
}

export default function HotQuestionTeacherInsights() {
  
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  React.useEffect(() => {
    setQ(pickDailyQuestion());
  }, []);
const [q, setQ] = React.useState<any>(null);
  const [showCorrect, setShowCorrect] = React.useState(false);
  const [, forceTick] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => forceTick((t) => t + 1), 1500);
    return () => window.clearInterval(id);
  }, []);

  if (!q) return null;

  const stats = getCounts(q.id, q.choices.length);
  const dateLabel = getTodayKeyForUI();
  const answerLetter = String.fromCharCode(65 + q.answerIndex);

  const pct = (count: number) => {
    if (stats.total === 0) return 0;
    return Math.round((count / stats.total) * 100);
  };

  return (
    <div className="rounded-3xl border bg-white/0 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">
            Hot Question Insights{" "}
            <span className="ml-2 text-xs font-normal text-slate-500">(<span suppressHydrationWarning>{mounted ? formatUSDate(dateLabel) : ""}</span>)</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Responses (local demo): {stats.total}
            {q.teks ? (
              <span>
                {" \u2022 "}
                TEKS: {mounted && q ? <TeksTooltip code={q.teks} /> : ""}
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-sm text-slate-900">{mounted && q ? q.prompt : ""}</div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            className="rounded-xl border px-3 py-1 text-xs"
            onClick={() => {
              setQ((prev: any) => pickRandomDifferent(prev?.id));
              setShowCorrect(false);
            }}
            type="button"
            title="Optional: preview other questions"
          >
            Switch
          </button>
          <button
            className="rounded-xl border px-3 py-1 text-xs"
            onClick={() => {
              resetCounts(q.id, q.choices.length);
              forceTick((t) => t + 1);
            }}
            type="button"
          >
            Reset
          </button>
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="font-medium">Waiting for student responses</span>
          <span className="text-amber-700/70">
            Live results will appear automatically
          </span>
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        {q.choices.map((c: string, i: number) => {
          const count = stats.counts[i] ?? 0;
          const p = pct(count);

          return (
            <div key={i} className="rounded-2xl border px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-sm text-slate-900 truncate">
                  <span className="mr-2 font-semibold">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {c}
                </div>
                <div className="text-xs text-slate-600 shrink-0 tabular-nums">
                  {stats.total === 0 ? "—" : `${p}% (${count})`}
                </div>
              </div>

              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-slate-900"
                  style={{ width: `${p}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white"
          onClick={() => setShowCorrect((v) => !v)}
        >
          {showCorrect ? "Hide correct" : "Show correct"}
        </button>

        {showCorrect ? (
          <div className="text-xs text-slate-700">
            <span className="font-semibold">Correct:</span> {answerLetter}
            {q.explanation ? (
              <span className="text-slate-500"> — {q.explanation}</span>
            ) : null}
          </div>
        ) : (
          <div className="text-xs text-slate-400">Correct hidden</div>
        )}
      </div>
    </div>
  );
}
