"use client";

import { useState } from "react";

type Mode = "learn" | "test";

export function QuestionShell({
  mode,
  maxAttempts, // number | "unlimited"
  explanation,
  onCheck,
  children,
}: {
  mode: Mode;
  maxAttempts: number | "unlimited";
  explanation?: string;
  onCheck: () => boolean; // returns correct or not
  children: React.ReactNode;
}) {
  const effectiveMax = mode === "test" ? 1 : maxAttempts;

  const unlimited = mode === "learn" && maxAttempts === "unlimited";

  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const attemptsLeft = unlimited
    ? Infinity
    : (effectiveMax as number) - attempts;

  const canCheck = unlimited || attemptsLeft > 0;

  const handleCheck = () => {
    if (!canCheck) return;

    const isCorrect = onCheck();
    setCorrect(isCorrect);
    setAttempts((a) => a + 1);

    if (!unlimited && attempts + 1 >= (effectiveMax as number)) {
      setShowExplanation(true);
    }
  };

  const canShowExplanation = unlimited || showExplanation;

  return (
    <div className="space-y-4">
      {children}

      <div className="flex items-center gap-3">
        <button
          onClick={handleCheck}
          disabled={!canCheck}
          className="ia-btn-primary"
        >
          Check
        </button>

        {!unlimited && (
          <span className="text-sm text-slate-500">
            Attempts left: {attemptsLeft}
          </span>
        )}
      </div>

      {canShowExplanation && explanation && (
        <div className="mt-3 rounded-lg border  p-3 text-sm">
          {explanation}
        </div>
      )}

      {unlimited && explanation && !showExplanation && (
        <button
          className="text-sm text-slate-600 underline"
          onClick={() => setShowExplanation(true)}
        >
          Show explanation
        </button>
      )}

      {correct !== null && (
        <div className="text-sm">{correct ? "Correct" : "Not yet"}</div>
      )}
    </div>
  );
}
