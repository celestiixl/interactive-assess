"use client";

import BilingualText from "@/components/student/BilingualText";
import { ChoiceButton } from "@/components/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/lib/useLang";
import { useAccommodations } from "@/lib/useAccommodations";
import { getMotivationalMessage } from "@/lib/motivationalMessages";
import { speakText, stopSpeaking } from "@/lib/accommodations";
import type { GlossaryEntry } from "@/types/item";

export type MCQItem = {
  id: string;
  stem: string;
  choices: { id: string; text: string }[];
  correctIds: string[];
  retryLimit?: number;
  rationale?: string;
  tags?: string[];
  glossary?: GlossaryEntry[];
};

export default function MCQ({
  item,
  onChecked,
  checkSignal,
  hideStem = false,
  externalControls = false,
}: {
  item: MCQItem;
  onChecked?: (r: { score: number; max: number }) => void;
  checkSignal?: number;
  hideStem?: boolean;
  externalControls?: boolean;
}) {
  const maxScore = 1;
  const retryLimit = item.retryLimit ?? 2;

  const [selected, setSelected] = useState<string[]>([]);
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [speaking, setSpeaking] = useState(false);
  const lastCheckSignal = useRef<number | undefined>(undefined);

  const { acc } = useAccommodations();

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

  const visibleChoices = useMemo(() => {
    // Reduce-choice support is only applied to single-answer MCQ items.
    if (acc.reduceChoices !== 2 || isMulti || item.choices.length <= 2) {
      return item.choices;
    }

    const targetCount = Math.max(2, item.choices.length - 2);
    const correctId = item.correctIds[0];
    const wrong = item.choices.filter((choice) => choice.id !== correctId);
    const keepWrongCount = Math.max(1, targetCount - 1);

    // Deterministic ordering avoids choices changing on rerender.
    const orderedWrong = [...wrong].sort((a, b) =>
      `${item.id}:${a.id}`.localeCompare(`${item.id}:${b.id}`),
    );

    const keepIds = new Set<string>([
      correctId,
      ...orderedWrong.slice(0, keepWrongCount).map((choice) => choice.id),
    ]);

    return item.choices.filter((choice) => keepIds.has(choice.id));
  }, [acc.reduceChoices, isMulti, item.choices, item.correctIds, item.id]);

  useEffect(() => {
    const visibleIds = new Set(visibleChoices.map((choice) => choice.id));
    setSelected((prev) => prev.filter((id) => visibleIds.has(id)));
  }, [visibleChoices]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

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
  }

  async function grade() {
    if (selected.length === 0 || done) return;

    const correct = setsEqual(new Set(selected), new Set(item.correctIds));
    const score = correct ? 1 : 0;
    const nextTries = tries + 1;
    setTries(nextTries);

    if (correct) {
      setDone(true);
      setFeedback(`✅ ${getMotivationalMessage()}`);
      await persist(score, nextTries);
      onChecked?.({ score: 1, max: 1 });
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
      onChecked?.({ score: 0, max: 1 });
    } else {
      setFeedback("↻ Try again!");
      await persist(score, nextTries);
    }
  }

  useEffect(() => {
    if (checkSignal === undefined) return;
    if (lastCheckSignal.current === checkSignal) return;
    lastCheckSignal.current = checkSignal;
    void grade();
    // Intentionally keyed to external check signal updates only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSignal]);

  function resetForRetry() {
    setSelected([]);
    setFeedback(null);
  }

  function toggleReadAloud() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (window.speechSynthesis.speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    const choicesText = visibleChoices
      .map(
        (choice, index) => `${String.fromCharCode(65 + index)}. ${choice.text}`,
      )
      .join(". ");
    const text = `${item.stem}. ${choicesText}`;

    void speakText({
      text,
      language: lang === "es" ? "es" : "en",
      voicePreference: acc.ttsVoice,
      speedPreference: acc.ttsSpeed,
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }

  return (
    <div className="space-y-4">
      {!hideStem ? (
        <div className="text-lg font-semibold">
          {
            <BilingualText
              text={item.stem}
              showSupport={lang === "es"}
              glossary={item.glossary ?? []}
            />
          }
        </div>
      ) : null}

      {acc.tts ? (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleReadAloud}
            className="rounded-md border border-[var(--bs-border)] bg-bs-surface px-3 py-1.5 text-xs font-semibold text-bs-text-sub hover:bg-[var(--bs-raised)]"
          >
            {speaking ? "Stop read aloud" : "Read prompt aloud"}
          </button>
          <span className="text-sm text-bs-text-sub">
            Reads the prompt and visible answer choices.
          </span>
        </div>
      ) : null}

      {acc.reduceChoices === 2 &&
      !isMulti &&
      item.choices.length > visibleChoices.length ? (
        <div className="rounded-lg border border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.06)] px-3 py-2 text-sm text-bs-amber">
          Reduced choices enabled: showing {visibleChoices.length} of{" "}
          {item.choices.length} options.
        </div>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="sr-only">Answer choices</legend>
        <div role={isMulti ? "group" : "radiogroup"} className="space-y-2">
          {visibleChoices.map((c, idx) => {
            const checked = selected.includes(c.id);
            const isCorrect = item.correctIds.includes(c.id);

            const state = done
              ? isCorrect
                ? "correct"
                : checked
                  ? "incorrect"
                  : "idle"
              : checked
                ? "selected"
                : "idle";

            return (
              <ChoiceButton
                key={c.id}
                id={c.id}
                label={String.fromCharCode(65 + idx)}
                checked={checked}
                state={state}
                roleType={isMulti ? "checkbox" : "radio"}
                onSelect={toggle}
                className={done ? "opacity-90" : undefined}
              >
                <span className="text-lg leading-8">
                  <BilingualText
                    text={c.text}
                    showSupport={lang === "es"}
                    glossary={item.glossary ?? []}
                  />
                </span>
              </ChoiceButton>
            );
          })}
        </div>
      </fieldset>

      {!externalControls ? (
        <div className="flex items-center gap-3">
          {!done ? (
            <>
              <button
                type="button"
                data-check-button="true"
                onClick={() => void grade()}
                className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-40"
                disabled={selected.length === 0}
              >
                Check
              </button>
              {feedback && tries < retryLimit && (
                <button
                  type="button"
                  onClick={resetForRetry}
                  className="rounded-md border px-4 py-2"
                >
                  Try again
                </button>
              )}
              <span className="text-base text-neutral-700">
                Attempts: {tries}/{retryLimit}
              </span>
            </>
          ) : (
            <span className="text-base text-neutral-700">
              Attempts: {tries}
            </span>
          )}
        </div>
      ) : (
        <div className="text-base text-neutral-700">Attempts: {tries}</div>
      )}

      {feedback && (
        <div
          className={
            "rounded-md px-3 py-2 text-base " +
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
