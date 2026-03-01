"use client";

import BilingualText from "@/components/student/BilingualText";
import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/useLang";

export type MCQItem = {
  id: string;
  stem: string;
  choices: { id: string; text: string }[];
  correctIds: string[];
  retryLimit?: number;
  rationale?: string;
  tags?: string[];
};

export default function MCQ({
  item,
  onAfterCheck,
}: {
  item: MCQItem;
  onAfterCheck?: () => void;
}) {
  const maxScore = 1;
  const retryLimit = item.retryLimit ?? 2;

  const [selected, setSelected] = useState<string[]>([]);
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const key = "ia-user-id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = "u_" + Math.random().toString(36).slice(2);
      localStorage.setItem(key, id);
    }
    setUserId(id);
  }, []);

  const { lang } = useLang();

  const isMulti = useMemo(() => item.correctIds.length > 1, [item.correctIds]);

  function toggle(id: string) {
    if (done) return;
    setSelected((prev) =>
      isMulti
        ? prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id]
        : [id],
    );
  }

  async function persist(score: number, triesUsed: number) {
    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          itemId: item.id,
          type: "mcq",
          payload: { choiceIds: selected },
          score,
          maxScore,
          tries: triesUsed,
        }),
      });
    } catch {}
    // notify page listeners
    localStorage.setItem("ia-ping", String(Date.now()));
    onAfterCheck?.();
  }

  async function grade() {
    const correct = setsEqual(new Set(selected), new Set(item.correctIds));
    const score = correct ? 1 : 0;
    const nextTries = tries + 1;
    setTries(nextTries);

    if (correct) {
      setDone(true);
      setFeedback("✅ Correct!");
      await persist(score, nextTries);
      return;
    }
    if (nextTries >= retryLimit) {
      setDone(true);
      setFeedback(
        `❌ Not quite. Correct answer${item.correctIds.length > 1 ? "s are" : " is"}: ${answerText(item)}${
          item.rationale ? `\n💡 Why: ${item.rationale}` : ""
        }`,
      );
      await persist(score, nextTries);
    } else {
      setFeedback("↻ Try again!");
      await persist(score, nextTries);
    }
  }

  function resetForRetry() {
    setSelected([]);
    setFeedback(null);
  }

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">
        {<BilingualText text={item.stem} showSupport={lang === "es"} />}
      </div>

      <fieldset className="space-y-2">
        <legend className="sr-only">Answer choices</legend>
        {item.choices.map((c) => {
          const checked = selected.includes(c.id);
          const showCorrectness = done;
          const isCorrect = item.correctIds.includes(c.id);

          const base =
            "group flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-all duration-150 ease-out";
          const idle = checked
            ? "border-neutral-900 bg-white/0"
            : "border-neutral-300 bg-white/0 hover:bg-neutral-100 hover:border-neutral-900 hover:shadow-sm hover:-translate-y-0.5";
          const focus =
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900";
          const result = showCorrectness
            ? isCorrect
              ? "border-green-600 bg-green-50"
              : checked
                ? "border-red-600 bg-red-50"
                : "border-neutral-300 bg-white/0 opacity-90"
            : idle;

          return (
            <label
              key={c.id}
              className={`${base} ${result} ${focus} ${done ? "opacity-90" : ""}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggle(c.id);
                }
              }}
            >
              <input
                type={isMulti ? "checkbox" : "radio"}
                name={`mcq-${item.id}`}
                value={c.id}
                checked={checked}
                onChange={() => toggle(c.id)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:outline-none"
                disabled={done}
              />
              <span className="leading-6">
                {<BilingualText text={c.text} showSupport={lang === "es"} />}
              </span>
              {!done && (
                <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-60">
                  →
                </span>
              )}
            </label>
          );
        })}
      </fieldset>

      <div className="flex items-center gap-3">
        {!done ? (
          <>
            <button
              onClick={grade}
              className="px-4 py-2 rounded-md bg-neutral-900 text-white disabled:opacity-40"
              disabled={selected.length === 0}
            >
              Check
            </button>
            {feedback && tries < retryLimit && (
              <button
                onClick={resetForRetry}
                className="px-4 py-2 rounded-md border"
              >
                Try again
              </button>
            )}
            <span className="text-sm text-neutral-600">
              Attempts: {tries}/{retryLimit}
            </span>
          </>
        ) : (
          <span className="text-sm text-neutral-600">Attempts: {tries}</span>
        )}
      </div>

      {feedback && (
        <div
          className={
            "rounded-md px-3 py-2 text-sm " +
            (feedback.startsWith("✅")
              ? "bg-green-50 text-green-800 border border-green-200"
              : feedback.startsWith("❌")
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-neutral-100 text-neutral-800 border border-neutral-200")
          }
        >
          <pre className="whitespace-pre-wrap font-mono">{feedback}</pre>
        </div>
      )}
    </div>
  );
}

function setsEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}
function answerText(item: MCQItem) {
  const map = new Map(item.choices.map((c) => [c.id, c.text]));
  return item.correctIds.map((id) => map.get(id)).join(", ");
}
