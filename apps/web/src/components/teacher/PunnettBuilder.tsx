"use client";

import { useMemo, useState } from "react";
import {
  computeDihybridGrid,
  computeMonohybridGrid,
} from "@/lib/punnetScoring";
import type {
  DihybridCrossQuestion,
  FollowUpQuestion,
  MonohybridCrossQuestion,
} from "@/lib/punnetScoring";
import { addToItemBank } from "@/lib/itemBank";

export interface PunnettBuilderProps {
  onSave?: (question: MonohybridCrossQuestion | DihybridCrossQuestion) => void;
}

type CrossType = "monohybrid" | "dihybrid";
type LearningLevel = "developing" | "progressing" | "proficient" | "advanced";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold text-bs-text-sub">{children}</div>
  );
}

export default function PunnettBuilder({ onSave }: PunnettBuilderProps) {
  const [crossType, setCrossType] = useState<CrossType>("monohybrid");
  const [parent1, setParent1] = useState("Aa");
  const [parent2, setParent2] = useState("Aa");

  // Monohybrid trait fields
  const [traitName, setTraitName] = useState("seed color");
  const [dominantPhenotype, setDominantPhenotype] = useState("yellow");
  const [recessivePhenotype, setRecessivePhenotype] = useState("green");

  // Dihybrid trait fields
  const [trait1Name, setTrait1Name] = useState("seed shape");
  const [trait1Dominant, setTrait1Dominant] = useState("round");
  const [trait1Recessive, setTrait1Recessive] = useState("wrinkled");
  const [trait2Name, setTrait2Name] = useState("seed color");
  const [trait2Dominant, setTrait2Dominant] = useState("yellow");
  const [trait2Recessive, setTrait2Recessive] = useState("green");

  // Common metadata
  const [teks, setTeks] = useState("B.7A");
  const [learningLevel, setLearningLevel] = useState<LearningLevel>("proficient");
  const [misconceptionTarget, setMisconceptionTarget] = useState(false);
  const [points, setPoints] = useState(4);

  // Follow-up questions
  const [followUps, setFollowUps] = useState<FollowUpQuestion[]>([]);
  const [newFollowUpPrompt, setNewFollowUpPrompt] = useState("");
  const [newFollowUpAnswer, setNewFollowUpAnswer] = useState("");
  const [newFollowUpPoints, setNewFollowUpPoints] = useState(1);

  // UI state
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isMonohybrid = crossType === "monohybrid";
  const expectedLen = isMonohybrid ? 2 : 4;

  const validParents =
    parent1.length === expectedLen && parent2.length === expectedLen;

  const previewGrid = useMemo(() => {
    if (!validParents) return null;
    try {
      return isMonohybrid
        ? computeMonohybridGrid(parent1, parent2)
        : computeDihybridGrid(parent1, parent2);
    } catch {
      return null;
    }
  }, [isMonohybrid, parent1, parent2, validParents]);

  const gridHeaders = useMemo(() => {
    if (!validParents) return null;
    if (isMonohybrid) {
      return {
        row: [parent1[0] ?? "", parent1[1] ?? ""],
        col: [parent2[0] ?? "", parent2[1] ?? ""],
      };
    }
    if (parent1.length < 4 || parent2.length < 4) return null;
    const p1 = parent1.split("");
    const p2 = parent2.split("");
    return {
      row: [
        (p1[0] ?? "") + (p1[2] ?? ""),
        (p1[0] ?? "") + (p1[3] ?? ""),
        (p1[1] ?? "") + (p1[2] ?? ""),
        (p1[1] ?? "") + (p1[3] ?? ""),
      ],
      col: [
        (p2[0] ?? "") + (p2[2] ?? ""),
        (p2[0] ?? "") + (p2[3] ?? ""),
        (p2[1] ?? "") + (p2[2] ?? ""),
        (p2[1] ?? "") + (p2[3] ?? ""),
      ],
    };
  }, [isMonohybrid, parent1, parent2, validParents]);

  function buildQuestion(): MonohybridCrossQuestion | DihybridCrossQuestion {
    const base = {
      id: uid("punnett"),
      teks: [teks],
      learningLevel,
      misconceptionTarget,
      points,
      followUpQuestions: followUps,
    };

    if (isMonohybrid) {
      return {
        ...base,
        type: "monohybrid-cross" as const,
        parent1Genotype: parent1,
        parent2Genotype: parent2,
        traitName,
        dominantPhenotype,
        recessivePhenotype,
      };
    }

    return {
      ...base,
      type: "dihybrid-cross" as const,
      parent1Genotype: parent1,
      parent2Genotype: parent2,
      trait1Name,
      trait1DominantPhenotype: trait1Dominant,
      trait1RecessivePhenotype: trait1Recessive,
      trait2Name,
      trait2DominantPhenotype: trait2Dominant,
      trait2RecessivePhenotype: trait2Recessive,
    };
  }

  function handleSave() {
    if (!validParents) {
      setSaveError(
        `Parent genotypes must each be ${expectedLen} characters for a ${crossType} cross.`,
      );
      return;
    }
    try {
      const question = buildQuestion();
      addToItemBank(question);
      onSave?.(question);
      setSaved(true);
      setSaveError(null);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    }
  }

  function addFollowUp() {
    if (!newFollowUpPrompt.trim() || !newFollowUpAnswer.trim()) return;
    setFollowUps((prev) => [
      ...prev,
      {
        id: uid("fq"),
        prompt: newFollowUpPrompt.trim(),
        correctAnswer: newFollowUpAnswer.trim(),
        points: newFollowUpPoints,
      },
    ]);
    setNewFollowUpPrompt("");
    setNewFollowUpAnswer("");
    setNewFollowUpPoints(1);
  }

  function removeFollowUp(id: string) {
    setFollowUps((prev) => prev.filter((fq) => fq.id !== id));
  }

  return (
    <div className="space-y-6">
      {/* Cross type selector */}
      <div>
        <SectionLabel>Cross type</SectionLabel>
        <div
          role="radiogroup"
          aria-label="Cross type"
          className="mt-2 flex gap-6"
        >
          {(["monohybrid", "dihybrid"] as const).map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center gap-2 text-sm text-bs-text"
            >
              <input
                type="radio"
                name="crossType"
                value={t}
                checked={crossType === t}
                onChange={() => {
                  setCrossType(t);
                  setParent1(t === "monohybrid" ? "Aa" : "AaBb");
                  setParent2(t === "monohybrid" ? "Aa" : "AaBb");
                  setPoints(t === "monohybrid" ? 4 : 16);
                }}
                aria-label={`Cross type: ${t}`}
              />
              <span className="capitalize">{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Parent genotypes */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <SectionLabel>
            Parent 1 genotype ({expectedLen} characters, e.g.{" "}
            {isMonohybrid ? '"Aa"' : '"AaBb"'})
          </SectionLabel>
          <input
            className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
            value={parent1}
            onChange={(e) => setParent1(e.target.value)}
            aria-label="Parent 1 genotype"
            placeholder={isMonohybrid ? "e.g. Aa" : "e.g. AaBb"}
            maxLength={isMonohybrid ? 2 : 4}
          />
        </div>
        <div>
          <SectionLabel>
            Parent 2 genotype ({expectedLen} characters, e.g.{" "}
            {isMonohybrid ? '"Aa"' : '"AaBb"'})
          </SectionLabel>
          <input
            className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
            value={parent2}
            onChange={(e) => setParent2(e.target.value)}
            aria-label="Parent 2 genotype"
            placeholder={isMonohybrid ? "e.g. Aa" : "e.g. AaBb"}
            maxLength={isMonohybrid ? 2 : 4}
          />
        </div>
      </div>

      {/* Trait fields */}
      {isMonohybrid ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <SectionLabel>Trait name</SectionLabel>
            <input
              className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
              value={traitName}
              onChange={(e) => setTraitName(e.target.value)}
              aria-label="Trait name"
              placeholder="e.g. seed color"
            />
          </div>
          <div>
            <SectionLabel>Dominant phenotype</SectionLabel>
            <input
              className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
              value={dominantPhenotype}
              onChange={(e) => setDominantPhenotype(e.target.value)}
              aria-label="Dominant phenotype"
              placeholder="e.g. yellow"
            />
          </div>
          <div>
            <SectionLabel>Recessive phenotype</SectionLabel>
            <input
              className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
              value={recessivePhenotype}
              onChange={(e) => setRecessivePhenotype(e.target.value)}
              aria-label="Recessive phenotype"
              placeholder="e.g. green"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <SectionLabel>Trait 1 name</SectionLabel>
              <input
                className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
                value={trait1Name}
                onChange={(e) => setTrait1Name(e.target.value)}
                aria-label="Trait 1 name"
                placeholder="e.g. seed shape"
              />
            </div>
            <div>
              <SectionLabel>Trait 1 dominant</SectionLabel>
              <input
                className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
                value={trait1Dominant}
                onChange={(e) => setTrait1Dominant(e.target.value)}
                aria-label="Trait 1 dominant phenotype"
                placeholder="e.g. round"
              />
            </div>
            <div>
              <SectionLabel>Trait 1 recessive</SectionLabel>
              <input
                className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
                value={trait1Recessive}
                onChange={(e) => setTrait1Recessive(e.target.value)}
                aria-label="Trait 1 recessive phenotype"
                placeholder="e.g. wrinkled"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <SectionLabel>Trait 2 name</SectionLabel>
              <input
                className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
                value={trait2Name}
                onChange={(e) => setTrait2Name(e.target.value)}
                aria-label="Trait 2 name"
                placeholder="e.g. seed color"
              />
            </div>
            <div>
              <SectionLabel>Trait 2 dominant</SectionLabel>
              <input
                className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
                value={trait2Dominant}
                onChange={(e) => setTrait2Dominant(e.target.value)}
                aria-label="Trait 2 dominant phenotype"
                placeholder="e.g. yellow"
              />
            </div>
            <div>
              <SectionLabel>Trait 2 recessive</SectionLabel>
              <input
                className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
                value={trait2Recessive}
                onChange={(e) => setTrait2Recessive(e.target.value)}
                aria-label="Trait 2 recessive phenotype"
                placeholder="e.g. green"
              />
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <SectionLabel>TEKS code</SectionLabel>
          <input
            className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            aria-label="TEKS code"
            placeholder="e.g. B.7A"
          />
        </div>
        <div>
          <SectionLabel>Learning level</SectionLabel>
          <select
            className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
            value={learningLevel}
            onChange={(e) => setLearningLevel(e.target.value as LearningLevel)}
            aria-label="Learning level"
          >
            <option value="developing">Developing</option>
            <option value="progressing">Progressing</option>
            <option value="proficient">Proficient</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <SectionLabel>Points (grid)</SectionLabel>
          <input
            type="number"
            min={1}
            className="mt-1 w-full border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value) || 1)}
            aria-label="Points for grid"
          />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-bs-text">
            <input
              type="checkbox"
              checked={misconceptionTarget}
              onChange={(e) => setMisconceptionTarget(e.target.checked)}
              aria-label="Misconception target"
            />
            Misconception target
          </label>
        </div>
      </div>

      {/* Follow-up questions */}
      <div className="space-y-3">
        <SectionLabel>Follow-up questions (optional)</SectionLabel>
        {followUps.length > 0 && (
          <div className="space-y-2">
            {followUps.map((fq) => (
              <div
                key={fq.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-[var(--bs-border)] p-3 text-sm"
              >
                <div className="flex-1 space-y-0.5">
                  <div className="text-bs-text">{fq.prompt}</div>
                  <div className="text-xs text-bs-text-sub">
                    Answer: {fq.correctAnswer} ({fq.points} pt
                    {fq.points !== 1 ? "s" : ""})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFollowUp(fq.id)}
                  aria-label={`Remove follow-up: ${fq.prompt}`}
                  className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-2 sm:grid-cols-[1fr,1fr,80px,auto]">
          <input
            className="border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
            value={newFollowUpPrompt}
            onChange={(e) => setNewFollowUpPrompt(e.target.value)}
            aria-label="Follow-up question prompt"
            placeholder="Question prompt"
          />
          <input
            className="border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
            value={newFollowUpAnswer}
            onChange={(e) => setNewFollowUpAnswer(e.target.value)}
            aria-label="Follow-up correct answer"
            placeholder="Correct answer"
          />
          <input
            type="number"
            min={1}
            className="border border-[var(--bs-border)] p-2 text-sm ia-card-soft"
            value={newFollowUpPoints}
            onChange={(e) => setNewFollowUpPoints(Number(e.target.value) || 1)}
            aria-label="Follow-up points"
          />
          <button
            type="button"
            onClick={addFollowUp}
            disabled={
              !newFollowUpPrompt.trim() || !newFollowUpAnswer.trim()
            }
            aria-label="Add follow-up question"
            className="rounded-xl bg-bs-raised px-3 py-2 text-xs font-semibold text-bs-text hover:bg-bs-surface disabled:opacity-40"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Punnett grid preview */}
      <div>
        <SectionLabel>Grid preview</SectionLabel>
        {!validParents && (
          <div className="mt-2 text-xs text-bs-text-sub">
            Enter valid {expectedLen}-character genotypes above to preview the
            grid.
          </div>
        )}
        {previewGrid && gridHeaders && (
          <div className="mt-2 overflow-x-auto">
            <table className="border-collapse text-sm">
              <thead>
                <tr>
                  <th className="h-9 w-12 border border-[var(--bs-border)] bg-[#00d4aa] p-2 text-center text-xs font-bold text-white" />
                  {gridHeaders.col.map((h, ci) => (
                    <th
                      key={ci}
                      className="h-9 w-20 border border-[var(--bs-border)] bg-[#00d4aa] p-2 text-center text-xs font-bold text-white"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewGrid.map((row, ri) => (
                  <tr key={ri}>
                    <th className="h-12 w-12 border border-[var(--bs-border)] bg-[#00d4aa] p-2 text-center text-xs font-bold text-white">
                      {gridHeaders.row[ri]}
                    </th>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="h-12 w-20 border border-[var(--bs-border)] bg-bs-surface p-2 text-center text-xs text-bs-text"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save feedback */}
      {saveError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
        >
          {saveError}
        </div>
      )}
      {saved && (
        <div
          role="status"
          className="rounded-xl border border-[#00d4aa]/40 bg-[#00d4aa]/10 p-3 text-xs font-semibold text-[#00d4aa]"
        >
          Question saved to item bank.
        </div>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!validParents}
        aria-label="Save Punnett question to item bank"
        className="rounded-xl bg-[#00d4aa] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00b896] disabled:opacity-50"
      >
        Save to Item Bank
      </button>
    </div>
  );
}
