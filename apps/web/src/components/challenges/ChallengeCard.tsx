"use client";

import { useEffect, useMemo, useState } from "react";
import type { Challenge, ChallengeMode } from "@/types/challenge";

type Props = {
  challenge: Challenge;
  mode: ChallengeMode;
  whyMatters: string;
  onResult: (correct: boolean, xpGained: number) => void;
  onNext: () => void;
};

type Feedback = {
  correct: boolean;
  message: string;
};

type DragDropData = {
  prompt: string;
  labels: string[];
  targets: string[];
  correctMap: Record<string, string>;
};

type ClickableData = {
  prompt: string;
  hotspots: Array<{ id: string; label: string }>;
  correctId: string;
};

function getChoiceSubset(challenge: Challenge): Array<{ index: number; label: string }> {
  const all = challenge.modes.text.choices.map((label, index) => ({ index, label }));
  if (challenge.difficulty === 3 || all.length <= 2) return all;

  const correct = all.find((choice) => choice.index === challenge.modes.text.correctIndex);
  const incorrect = all.filter((choice) => choice.index !== challenge.modes.text.correctIndex);
  if (!correct) return all;

  if (challenge.difficulty === 1) return [correct, ...incorrect.slice(0, 1)];
  return [correct, ...incorrect.slice(0, 2)];
}

function parseDragDropData(data: unknown): DragDropData | null {
  if (!data || typeof data !== "object") return null;
  const candidate = data as Partial<DragDropData>;
  if (!Array.isArray(candidate.labels) || !Array.isArray(candidate.targets) || !candidate.correctMap) {
    return null;
  }
  return {
    prompt: candidate.prompt ?? "Match the labels.",
    labels: candidate.labels,
    targets: candidate.targets,
    correctMap: candidate.correctMap,
  };
}

function parseClickableData(data: unknown): ClickableData | null {
  if (!data || typeof data !== "object") return null;
  const candidate = data as Partial<ClickableData>;
  if (!Array.isArray(candidate.hotspots) || !candidate.correctId) return null;
  return {
    prompt: candidate.prompt ?? "Pick the best option.",
    hotspots: candidate.hotspots,
    correctId: candidate.correctId,
  };
}

export default function ChallengeCard({ challenge, mode, whyMatters, onResult, onNext }: Props) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<string>("");
  const [dragAnswers, setDragAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);

  useEffect(() => {
    setSelectedChoice(null);
    setSelectedHotspot("");
    setDragAnswers({});
    setFeedback(null);
    setSubmitted(false);
    setShowHint(false);
    setSecondsLeft(120);
  }, [challenge.id, mode]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [challenge.id]);

  const availableHint = challenge.difficulty !== 3;
  const choiceSubset = useMemo(() => getChoiceSubset(challenge), [challenge]);

  const interactiveType = challenge.modes.interactive?.type;
  const dragDropData = parseDragDropData(challenge.modes.interactive?.data);
  const clickableData = parseClickableData(challenge.modes.interactive?.data);

  const resolvedMode: ChallengeMode = (() => {
    if (mode === "video" && challenge.modes.video) return "video";
    if (mode === "interactive" && challenge.modes.interactive) return "interactive";
    if (mode === "visual" && challenge.modes.visual) return "visual";
    return "text";
  })();

  function handleSubmit() {
    if (submitted) return;

    let correct = false;

    if (resolvedMode === "interactive" && interactiveType === "clickable" && clickableData) {
      correct = selectedHotspot === clickableData.correctId;
    } else if (resolvedMode === "interactive" && interactiveType === "drag-drop" && dragDropData) {
      correct = dragDropData.targets.every(
        (target) => dragAnswers[target] && dragAnswers[target] === dragDropData.correctMap[target],
      );
    } else {
      correct = selectedChoice === challenge.modes.text.correctIndex;
    }

    const message = correct
      ? `Correct! ${challenge.modes.text.explanation}`
      : `Not quite. ${challenge.modes.text.explanation}`;

    setFeedback({ correct, message });
    setSubmitted(true);
    onResult(correct, correct ? challenge.xpReward : 0);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {challenge.topic} • Difficulty {challenge.difficulty} • {challenge.realWorldTag}
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          ⏱ {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
        </div>
      </div>

      <div className="mt-2 text-lg font-bold text-slate-900">Micro Mission</div>

      {resolvedMode === "video" && challenge.modes.video && (
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
          <iframe
            src={challenge.modes.video.url}
            title="Mission video"
            className="ia-mission-media h-44 w-full sm:h-52"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            {challenge.modes.video.caption}
          </div>
        </div>
      )}

      {resolvedMode === "visual" && challenge.modes.visual && (
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
          <img
            src={challenge.modes.visual.imageUrl}
            alt={challenge.modes.visual.altText}
            className="ia-mission-media h-44 w-full object-cover sm:h-52"
          />
        </div>
      )}

      {resolvedMode === "interactive" && interactiveType === "clickable" && clickableData && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <div className="text-sm font-semibold text-slate-800">{clickableData.prompt}</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {clickableData.hotspots.map((spot) => (
              <button
                key={spot.id}
                type="button"
                disabled={submitted}
                onClick={() => setSelectedHotspot(spot.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                  selectedHotspot === spot.id
                    ? "border-violet-400 bg-violet-100 text-violet-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {spot.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {resolvedMode === "interactive" && interactiveType === "drag-drop" && dragDropData && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <div className="text-sm font-semibold text-slate-800">{dragDropData.prompt}</div>
          <div className="mt-2 grid gap-2">
            {dragDropData.targets.map((target) => (
              <label key={target} className="grid gap-1 text-sm text-slate-700 sm:grid-cols-[1fr_220px] sm:items-center">
                <span>{target}</span>
                <select
                  value={dragAnswers[target] ?? ""}
                  disabled={submitted}
                  onChange={(e) =>
                    setDragAnswers((prev) => ({
                      ...prev,
                      [target]: e.target.value,
                    }))
                  }
                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                >
                  <option value="">Select label</option>
                  {dragDropData.labels.map((label) => (
                    <option key={label} value={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      )}

      {(resolvedMode === "text" || resolvedMode === "video" || resolvedMode === "visual") && (
        <div className="mt-3">
          <h4 className="text-base font-semibold text-slate-900">{challenge.modes.text.question}</h4>
          <div className="mt-2 grid gap-2">
            {choiceSubset.map((choice) => (
              <button
                key={choice.index}
                type="button"
                disabled={submitted}
                onClick={() => setSelectedChoice(choice.index)}
                className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                  selectedChoice === choice.index
                    ? "border-violet-400 bg-violet-100 text-violet-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {availableHint && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            className="text-xs font-semibold text-violet-700 hover:text-violet-900"
          >
            {showHint ? "Hide hint" : "Show hint"}
          </button>
          {showHint && (
            <p className="mt-1 text-xs text-slate-600">
              Hint: Focus on the key process words in the prompt before selecting an answer.
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitted}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Check answer
        </button>
        {submitted && (
          <button
            type="button"
            onClick={onNext}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Next mission
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`mt-3 rounded-xl border p-2.5 text-sm transition-all duration-300 ${
            feedback.correct
              ? "ia-feedback-pop border-emerald-200 bg-emerald-50 text-emerald-900"
              : "ia-feedback-pop border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <div className="font-semibold">{feedback.correct ? "✅ Correct" : "❌ Incorrect"}</div>
          <p className="mt-1">{feedback.message}</p>
          <div className="mt-2 rounded-lg bg-white/80 px-3 py-2 text-xs text-slate-700">
            <span className="font-semibold">Why this matters:</span> {whyMatters}
          </div>
        </div>
      )}
    </section>
  );
}
