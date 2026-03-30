"use client";

import { useState } from "react";
import { getMotivationalMessage } from "@/lib/motivationalMessages";

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
  const [motivationalMessage, setMotivationalMessage] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);

  const attemptsLeft = unlimited
    ? Infinity
    : (effectiveMax as number) - attempts;

  const canCheck = unlimited || attemptsLeft > 0;

  const handleCheck = () => {
    if (!canCheck) return;

    const isCorrect = onCheck();
    setCorrect(isCorrect);
    if (isCorrect) setMotivationalMessage(getMotivationalMessage());
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
          <span className="text-sm text-bs-text-sub">
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
          className="text-sm text-bs-text-sub underline"
          onClick={() => setShowExplanation(true)}
        >
          Show explanation
        </button>
      )}

      {correct !== null && (
        <div className="text-sm">{correct ? (motivationalMessage || "Correct") : "Not yet"}</div>
      )}
    </div>
  );
}
