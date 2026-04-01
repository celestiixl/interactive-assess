"use client";

import { useState, useMemo } from "react";
import {
  computeDihybridGrid,
  computeMonohybridGrid,
} from "@/lib/punnetScoring";
import type {
  DihybridCrossQuestion,
  MonohybridCrossQuestion,
} from "@/lib/punnetScoring";

export interface PunnettQuestionProps {
  question: MonohybridCrossQuestion | DihybridCrossQuestion;
  onSubmit?: (response: unknown) => void;
  onChecked?: (r: { score: number; max: number }) => void;
}

function getHeaders(
  question: MonohybridCrossQuestion | DihybridCrossQuestion,
): { rowHeaders: string[]; colHeaders: string[] } {
  if (question.type === "monohybrid-cross") {
    const p1 = question.parent1Genotype;
    const p2 = question.parent2Genotype;
    if (p1.length < 2 || p2.length < 2) {
      return { rowHeaders: ["?", "?"], colHeaders: ["?", "?"] };
    }
    return {
      rowHeaders: [p1[0] ?? "", p1[1] ?? ""],
      colHeaders: [p2[0] ?? "", p2[1] ?? ""],
    };
  }
  const p1 = question.parent1Genotype;
  const p2 = question.parent2Genotype;
  if (p1.length < 4 || p2.length < 4) {
    return {
      rowHeaders: ["?", "?", "?", "?"],
      colHeaders: ["?", "?", "?", "?"],
    };
  }
  return {
    rowHeaders: [
      (p1[0] ?? "") + (p1[2] ?? ""),
      (p1[0] ?? "") + (p1[3] ?? ""),
      (p1[1] ?? "") + (p1[2] ?? ""),
      (p1[1] ?? "") + (p1[3] ?? ""),
    ],
    colHeaders: [
      (p2[0] ?? "") + (p2[2] ?? ""),
      (p2[0] ?? "") + (p2[3] ?? ""),
      (p2[1] ?? "") + (p2[2] ?? ""),
      (p2[1] ?? "") + (p2[3] ?? ""),
    ],
  };
}

export default function PunnettQuestion({
  question,
  onSubmit,
  onChecked,
}: PunnettQuestionProps) {
  const isMonohybrid = question.type === "monohybrid-cross";
  const size = isMonohybrid ? 2 : 4;

  const [grid, setGrid] = useState<string[][]>(() =>
    Array.from({ length: size }, () => Array<string>(size).fill("")),
  );
  const [followUpAnswers, setFollowUpAnswers] = useState<
    Record<string, string>
  >({});
  const [result, setResult] = useState<{
    score: number;
    max: number;
    correct: boolean;
    interventionTier: 2 | 3 | null;
    feedback: {
      grid: { cellCorrect: boolean[][] };
      followUp: {
        byQuestion: Record<
          string,
          { correct: boolean; earned: number; max: number }
        >;
      };
    };
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { rowHeaders, colHeaders } = useMemo(
    () => getHeaders(question),
    [question],
  );

  const correctGrid = useMemo(() => {
    try {
      return isMonohybrid
        ? computeMonohybridGrid(
            question.parent1Genotype,
            question.parent2Genotype,
          )
        : computeDihybridGrid(
            question.parent1Genotype,
            question.parent2Genotype,
          );
    } catch {
      return null;
    }
  }, [isMonohybrid, question]);

  function setCellValue(row: number, col: number, value: string) {
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      const targetRow = next[row];
      if (targetRow && col < targetRow.length) targetRow[col] = value;
      return next;
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const studentId =
      typeof window !== "undefined"
        ? (window.localStorage.getItem("biospark:studentId") ?? "anon")
        : "anon";

    const body = {
      type: question.type,
      question,
      grid,
      followUpAnswers,
    };

    try {
      const res = await fetch("/api/score/punnett", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-student-id": studentId,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error ?? "Scoring failed");
      }

      const data = (await res.json()) as typeof result;
      setResult(data);
      setSubmitted(true);
      onSubmit?.(body);
      if (data) {
        onChecked?.({ score: data.score, max: data.max });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scoring failed");
    } finally {
      setLoading(false);
    }
  }

  const crossLabel = isMonohybrid
    ? `${question.parent1Genotype} x ${question.parent2Genotype} - ${(question as MonohybridCrossQuestion).traitName}`
    : `${question.parent1Genotype} x ${question.parent2Genotype}`;

  return (
    <div className="space-y-5">
      {/* Cross description */}
      <div>
        <div className="text-sm font-semibold text-bs-text">
          Punnett Square Cross
        </div>
        <div className="mt-1 text-xs text-bs-text-sub">{crossLabel}</div>
        {!isMonohybrid && (
          <div className="mt-1 text-xs text-bs-text-sub">
            Trait 1: {(question as DihybridCrossQuestion).trait1Name} (
            {(question as DihybridCrossQuestion).trait1DominantPhenotype} /{" "}
            {(question as DihybridCrossQuestion).trait1RecessivePhenotype}) -
            Trait 2: {(question as DihybridCrossQuestion).trait2Name} (
            {(question as DihybridCrossQuestion).trait2DominantPhenotype} /{" "}
            {(question as DihybridCrossQuestion).trait2RecessivePhenotype})
          </div>
        )}
      </div>

      {/* Instruction */}
      <div className="text-xs text-bs-text-sub">
        Fill in each offspring genotype cell. Use standard notation (e.g.{" "}
        {isMonohybrid ? "Bb, BB, bb" : "AaBb, AABB, aabb"}).
      </div>

      {/* Punnett grid */}
      <div
        role="grid"
        aria-label={`Punnett square grid for ${crossLabel}`}
        className="overflow-x-auto"
      >
        <table className="border-collapse text-sm">
          <thead>
            <tr role="row">
              <th
                scope="col"
                className="h-10 w-12 border border-[var(--bs-border)] bg-[var(--bs-teal)] p-2"
                aria-label="Cross header"
              />
              {colHeaders.map((h, ci) => (
                <th
                  key={ci}
                  scope="col"
                  className="h-10 w-20 border border-[var(--bs-border)] bg-[var(--bs-teal)] p-2 text-center text-xs font-bold text-white"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, ri) => (
              <tr key={ri} role="row">
                <th
                  scope="row"
                  className="h-12 w-12 border border-[var(--bs-border)] bg-[var(--bs-teal)] p-2 text-center text-xs font-bold text-white"
                >
                  {rowHeaders[ri] ?? ""}
                </th>
                {row.map((cell, ci) => {
                  const cellCorrect =
                    result?.feedback?.grid?.cellCorrect?.[ri]?.[ci];
                  const isRight = submitted && cellCorrect === true;
                  const isWrong = submitted && cellCorrect === false;
                  const correctVal =
                    submitted && isWrong ? correctGrid?.[ri]?.[ci] : undefined;

                  return (
                    <td
                      key={ci}
                      role="gridcell"
                      className="border border-[var(--bs-border)] p-1"
                      style={{
                        backgroundColor: isRight
                          ? "var(--bs-teal-dim)"
                          : isWrong
                            ? "var(--bs-coral-dim)"
                            : undefined,
                      }}
                    >
                      <div className="relative">
                        <input
                          type="text"
                          value={cell}
                          disabled={submitted}
                          onChange={(e) =>
                            setCellValue(ri, ci, e.target.value)
                          }
                          aria-label={`Offspring genotype row ${ri + 1} column ${ci + 1}`}
                          className="h-10 w-20 rounded bg-bs-surface px-1 text-center text-xs text-bs-text focus:outline-none focus:ring-1 focus:ring-[var(--bs-teal)] disabled:opacity-70"
                        />
                        {submitted && correctVal && (
                          <div className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-bs-coral">
                            {correctVal}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Follow-up questions */}
      {question.followUpQuestions.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="text-xs font-semibold text-bs-text-sub">
            Follow-up questions
          </div>
          {question.followUpQuestions.map((fq) => {
            const fqResult = result?.feedback?.followUp?.byQuestion?.[fq.id];
            return (
              <div key={fq.id} className="space-y-1">
                <label
                  htmlFor={`fq-${fq.id}`}
                  className="text-xs font-medium text-bs-text"
                >
                  {fq.prompt}
                </label>
                <input
                  id={`fq-${fq.id}`}
                  type="text"
                  value={followUpAnswers[fq.id] ?? ""}
                  disabled={submitted}
                  onChange={(e) =>
                    setFollowUpAnswers((prev) => ({
                      ...prev,
                      [fq.id]: e.target.value,
                    }))
                  }
                  aria-label={fq.prompt}
                  className="w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft disabled:opacity-70"
                />
                {submitted && fqResult && (
                  <div
                    className={`text-xs font-medium ${fqResult.correct ? "text-bs-teal" : "text-bs-coral"}`}
                  >
                    {fqResult.correct
                      ? "Correct!"
                      : `Incorrect - correct answer: ${fq.correctAnswer}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="text-xs text-bs-coral">
          {error}
        </div>
      )}

      {/* Score summary */}
      {submitted && result && (
        <div
          role="status"
          className="rounded-xl border border-[var(--bs-border)] bg-bs-raised p-4 text-sm"
        >
          <div className="font-semibold text-bs-text">
            Score: {result.score} / {result.max}
          </div>
          {result.interventionTier !== null && (
            <div className="mt-1 text-xs text-bs-text-sub">
              Tier {result.interventionTier} intervention recommended
            </div>
          )}
        </div>
      )}

      {/* Submit button */}
      {!submitted && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          aria-label="Submit Punnett square response"
          className="rounded-xl bg-bs-teal px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Scoring..." : "Submit"}
        </button>
      )}
    </div>
  );
}
