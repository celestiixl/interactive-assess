"use client";

import { useMemo, useState } from "react";
import type { ItemCER, Evidence, CerMode } from "@/types/item";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function CERBuilder({
  item,
  onPatch,
}: {
  item: any;
  onPatch: (patch: any) => void;
}) {
  const [editingMode, setEditingMode] = useState<CerMode>(item?.mode ?? "open");

  // Evidence bank state
  const [evidenceBank, setEvidenceBank] = useState<Evidence[]>(
    item?.evidenceBank ?? [],
  );

  // Claim (only when mode != "open")
  const [claimText, setClaimText] = useState(item?.claim?.text ?? "");

  // Constraints
  const [minEvidence, setMinEvidence] = useState(
    item?.constraints?.minEvidence ?? 1,
  );
  const [maxEvidence, setMaxEvidence] = useState(
    item?.constraints?.maxEvidence ?? 3,
  );
  const [reasoningMinChars, setReasoningMinChars] = useState(
    item?.constraints?.reasoningMinChars ?? 60,
  );
  const [allowCustomNote, setAllowCustomNote] = useState(
    item?.constraints?.allowCustomEvidenceNote ?? false,
  );

  // Context (scenario)
  const [context, setContext] = useState(item?.context ?? "");

  // Rubric points
  const [claimPoints, setClaimPoints] = useState(
    item?.rubric?.claimPoints ?? 2,
  );
  const [evidencePoints, setEvidencePoints] = useState(
    item?.rubric?.evidencePoints ?? 2,
  );
  const [reasoningPoints, setReasoningPoints] = useState(
    item?.rubric?.reasoningPoints ?? 4,
  );

  // Scaffolds
  const [stemEnClaim, setStemEnClaim] = useState<string[]>(
    item?.scaffolds?.sentenceStems?.en?.claim ?? [],
  );
  const [stemEnEvidence, setStemEnEvidence] = useState<string[]>(
    item?.scaffolds?.sentenceStems?.en?.evidence ?? [],
  );
  const [stemEnReasoning, setStemEnReasoning] = useState<string[]>(
    item?.scaffolds?.sentenceStems?.en?.reasoning ?? [],
  );

  const [stemEsClaim, setStemEsClaim] = useState<string[]>(
    item?.scaffolds?.sentenceStems?.es?.claim ?? [],
  );
  const [stemEsEvidence, setStemEsEvidence] = useState<string[]>(
    item?.scaffolds?.sentenceStems?.es?.evidence ?? [],
  );
  const [stemEsReasoning, setStemEsReasoning] = useState<string[]>(
    item?.scaffolds?.sentenceStems?.es?.reasoning ?? [],
  );

  // Word banks
  const [wordBankEn, setWordBankEn] = useState<string[]>(
    item?.scaffolds?.wordBank?.en ?? [],
  );
  const [wordBankEs, setWordBankEs] = useState<string[]>(
    item?.scaffolds?.wordBank?.es ?? [],
  );

  // Correct evidence IDs (for auto-scoring)
  const [correctEvidenceIds, setCorrectEvidenceIds] = useState<string[]>(
    item?.correctEvidenceIds ?? [],
  );

  // Save to parent
  const handlePatch = () => {
    const patch: any = {
      kind: "cer",
      mode: editingMode,
      evidenceBank,
      context: context || undefined,
      constraints: {
        minEvidence,
        maxEvidence,
        reasoningMinChars,
        allowCustomEvidenceNote: allowCustomNote,
      },
      rubric: {
        claimPoints: editingMode === "open" ? claimPoints : undefined,
        evidencePoints,
        reasoningPoints,
      },
      scaffolds: {
        sentenceStems: {
          en: {
            claim: stemEnClaim?.length ? stemEnClaim : undefined,
            evidence: stemEnEvidence?.length ? stemEnEvidence : undefined,
            reasoning: stemEnReasoning?.length ? stemEnReasoning : undefined,
          },
          es: {
            claim: stemEsClaim?.length ? stemEsClaim : undefined,
            evidence: stemEsEvidence?.length ? stemEsEvidence : undefined,
            reasoning: stemEsReasoning?.length ? stemEsReasoning : undefined,
          },
        },
        wordBank: {
          en: wordBankEn?.length ? wordBankEn : undefined,
          es: wordBankEs?.length ? wordBankEs : undefined,
        },
      },
      correctEvidenceIds: correctEvidenceIds?.length
        ? correctEvidenceIds
        : undefined,
    };

    if (editingMode !== "open") {
      patch.claim = {
        text: claimText,
        locked: true,
      };
    }

    onPatch(patch);
  };

  // Auto-patch on changes
  useMemo(() => {
    handlePatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editingMode,
    evidenceBank,
    claimText,
    minEvidence,
    maxEvidence,
    reasoningMinChars,
    allowCustomNote,
    context,
    claimPoints,
    evidencePoints,
    reasoningPoints,
    stemEnClaim,
    stemEnEvidence,
    stemEnReasoning,
    stemEsClaim,
    stemEsEvidence,
    stemEsReasoning,
    wordBankEn,
    wordBankEs,
    correctEvidenceIds,
  ]);

  // Evidence helpers
  const addEvidence = () => {
    const newEvidence: Evidence = {
      id: uid("ev"),
      text: "",
    };
    setEvidenceBank((prev) => [...prev, newEvidence]);
  };

  const updateEvidence = (id: string, field: keyof Evidence, value: any) => {
    setEvidenceBank((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const removeEvidence = (id: string) => {
    setEvidenceBank((prev) => prev.filter((e) => e.id !== id));
    setCorrectEvidenceIds((prev) => prev.filter((x) => x !== id));
  };

  // Stem helpers
  const addStem = (
    list: string[],
    setter: (val: string[]) => void,
    placeholder: string,
  ) => {
    setter([...list, placeholder]);
  };

  const updateStem = (
    list: string[],
    setter: (val: string[]) => void,
    index: number,
    value: string,
  ) => {
    const next = [...list];
    next[index] = value;
    setter(next);
  };

  const removeStem = (
    list: string[],
    setter: (val: string[]) => void,
    index: number,
  ) => {
    setter(list.filter((_, i) => i !== index));
  };

  // Word bank helpers
  const addWordBank = (list: string[], setter: (val: string[]) => void) => {
    setter([...list, ""]);
  };

  const updateWordBank = (
    list: string[],
    setter: (val: string[]) => void,
    index: number,
    value: string,
  ) => {
    const next = [...list];
    next[index] = value;
    setter(next);
  };

  const removeWordBank = (
    list: string[],
    setter: (val: string[]) => void,
    index: number,
  ) => {
    setter(list.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="rounded-2xl border bg-background p-4 space-y-3">
        <div className="text-sm font-medium">CER Mode</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {(["open", "claim-given", "claim-evaluate"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setEditingMode(mode)}
              className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition ${
                editingMode === mode
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="font-semibold">
                {mode === "open"
                  ? "Open"
                  : mode === "claim-given"
                    ? "Claim Given"
                    : "Claim Evaluate"}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {mode === "open"
                  ? "Students write claim, select evidence, write reasoning"
                  : mode === "claim-given"
                    ? "Claim provided; students select evidence & write reasoning"
                    : "Claim provided; students evaluate & explain with evidence"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Context */}
      <div className="rounded-2xl border bg-background p-4 space-y-2">
        <label className="text-sm font-medium">
          Context / Scenario (optional)
        </label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Short scenario or phenomenon description..."
          className="w-full border rounded-lg p-2 min-h-[80px] text-sm"
        />
      </div>

      {/* Claim (if not open mode) */}
      {editingMode !== "open" && (
        <div className="rounded-2xl border bg-background p-4 space-y-2">
          <label className="text-sm font-medium">
            Claim (locked for students)
          </label>
          <textarea
            value={claimText}
            onChange={(e) => setClaimText(e.target.value)}
            placeholder="The claim students will see..."
            className="w-full border rounded-lg p-2 min-h-15 text-sm"
          />
        </div>
      )}

      {/* Evidence Bank */}
      <div className="rounded-2xl border bg-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Evidence Bank</div>
          <button
            type="button"
            onClick={addEvidence}
            className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium"
          >
            + Add Evidence
          </button>
        </div>

        <div className="space-y-3">
          {evidenceBank.map((evidence, idx) => (
            <div
              key={evidence.id}
              className="p-3 border rounded-lg space-y-2 bg-slate-50"
            >
              <div className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Evidence text"
                  value={evidence.text}
                  onChange={(e) =>
                    updateEvidence(evidence.id, "text", e.target.value)
                  }
                  className="col-span-8 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Source (e.g., Graph)"
                  value={evidence.sourceLabel ?? ""}
                  onChange={(e) =>
                    updateEvidence(evidence.id, "sourceLabel", e.target.value)
                  }
                  className="col-span-3 px-2 py-1 border rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeEvidence(evidence.id)}
                  className="col-span-1 px-2 py-1 text-xs rounded border hover:bg-red-50"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={evidence.tag ?? ""}
                  onChange={(e) =>
                    updateEvidence(
                      evidence.id,
                      "tag",
                      e.target.value || undefined,
                    )
                  }
                  className="px-2 py-1 border rounded text-xs"
                >
                  <option value="">No tag</option>
                  <option value="supports">Supports</option>
                  <option value="contradicts">Contradicts</option>
                  <option value="neutral">Neutral</option>
                </select>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={correctEvidenceIds.includes(evidence.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCorrectEvidenceIds((prev) => [...prev, evidence.id]);
                      } else {
                        setCorrectEvidenceIds((prev) =>
                          prev.filter((x) => x !== evidence.id),
                        );
                      }
                    }}
                  />
                  <span className="text-xs">Mark as correct</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="rounded-2xl border bg-background p-4 space-y-3">
        <div className="text-sm font-medium">Constraints</div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Min Evidence</label>
            <input
              type="number"
              min="1"
              max="10"
              value={minEvidence}
              onChange={(e) => setMinEvidence(parseInt(e.target.value) || 1)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Max Evidence</label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxEvidence}
              onChange={(e) => setMaxEvidence(parseInt(e.target.value) || 3)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium">
            Min Reasoning Characters
          </label>
          <input
            type="number"
            min="0"
            value={reasoningMinChars}
            onChange={(e) =>
              setReasoningMinChars(parseInt(e.target.value) || 0)
            }
            className="w-full border rounded-lg p-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allowCustomNote}
            onChange={(e) => setAllowCustomNote(e.target.checked)}
          />
          <span className="text-sm">Allow custom evidence note</span>
        </label>
      </div>

      {/* Rubric Points */}
      <div className="rounded-2xl border bg-background p-4 space-y-3">
        <div className="text-sm font-medium">Rubric Points</div>

        <div className="grid grid-cols-3 gap-3">
          {editingMode === "open" && (
            <div className="space-y-1">
              <label className="text-xs font-medium">Claim Points</label>
              <input
                type="number"
                min="0"
                value={claimPoints}
                onChange={(e) => setClaimPoints(parseInt(e.target.value) || 0)}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-medium">Evidence Points</label>
            <input
              type="number"
              min="0"
              value={evidencePoints}
              onChange={(e) => setEvidencePoints(parseInt(e.target.value) || 0)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Reasoning Points</label>
            <input
              type="number"
              min="0"
              value={reasoningPoints}
              onChange={(e) =>
                setReasoningPoints(parseInt(e.target.value) || 0)
              }
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sentence Stems - English */}
      <div className="rounded-2xl border bg-background p-4 space-y-3">
        <div className="text-sm font-medium">English Sentence Stems</div>

        {/* Claim stems */}
        <div className="space-y-2">
          <div className="text-xs font-medium flex items-center justify-between">
            <span>Claim Starters</span>
            <button
              type="button"
              onClick={() =>
                addStem(stemEnClaim, setStemEnClaim, "New stem...")
              }
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1">
            {stemEnClaim.map((stem, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={stem}
                  onChange={(e) =>
                    updateStem(stemEnClaim, setStemEnClaim, i, e.target.value)
                  }
                  placeholder='e.g., "The evidence suggests..."'
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeStem(stemEnClaim, setStemEnClaim, i)}
                  className="px-2 py-1 text-xs border rounded hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence stems */}
        <div className="space-y-2">
          <div className="text-xs font-medium flex items-center justify-between">
            <span>Evidence Starters</span>
            <button
              type="button"
              onClick={() =>
                addStem(stemEnEvidence, setStemEnEvidence, "New stem...")
              }
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1">
            {stemEnEvidence.map((stem, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={stem}
                  onChange={(e) =>
                    updateStem(
                      stemEnEvidence,
                      setStemEnEvidence,
                      i,
                      e.target.value,
                    )
                  }
                  placeholder='e.g., "According to the data..."'
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    removeStem(stemEnEvidence, setStemEnEvidence, i)
                  }
                  className="px-2 py-1 text-xs border rounded hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reasoning stems */}
        <div className="space-y-2">
          <div className="text-xs font-medium flex items-center justify-between">
            <span>Reasoning Starters</span>
            <button
              type="button"
              onClick={() =>
                addStem(stemEnReasoning, setStemEnReasoning, "New stem...")
              }
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1">
            {stemEnReasoning.map((stem, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={stem}
                  onChange={(e) =>
                    updateStem(
                      stemEnReasoning,
                      setStemEnReasoning,
                      i,
                      e.target.value,
                    )
                  }
                  placeholder='e.g., "This shows that..."'
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    removeStem(stemEnReasoning, setStemEnReasoning, i)
                  }
                  className="px-2 py-1 text-xs border rounded hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sentence Stems - Spanish */}
      <div className="rounded-2xl border bg-background p-4 space-y-3">
        <div className="text-sm font-medium">Spanish Sentence Stems</div>

        {/* Claim stems */}
        <div className="space-y-2">
          <div className="text-xs font-medium flex items-center justify-between">
            <span>Claim Starters</span>
            <button
              type="button"
              onClick={() =>
                addStem(stemEsClaim, setStemEsClaim, "New stem...")
              }
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1">
            {stemEsClaim.map((stem, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={stem}
                  onChange={(e) =>
                    updateStem(stemEsClaim, setStemEsClaim, i, e.target.value)
                  }
                  placeholder='e.g., "Los datos sugieren..."'
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeStem(stemEsClaim, setStemEsClaim, i)}
                  className="px-2 py-1 text-xs border rounded hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence stems */}
        <div className="space-y-2">
          <div className="text-xs font-medium flex items-center justify-between">
            <span>Evidence Starters</span>
            <button
              type="button"
              onClick={() =>
                addStem(stemEsEvidence, setStemEsEvidence, "New stem...")
              }
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1">
            {stemEsEvidence.map((stem, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={stem}
                  onChange={(e) =>
                    updateStem(
                      stemEsEvidence,
                      setStemEsEvidence,
                      i,
                      e.target.value,
                    )
                  }
                  placeholder='e.g., "Según los datos..."'
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    removeStem(stemEsEvidence, setStemEsEvidence, i)
                  }
                  className="px-2 py-1 text-xs border rounded hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reasoning stems */}
        <div className="space-y-2">
          <div className="text-xs font-medium flex items-center justify-between">
            <span>Reasoning Starters</span>
            <button
              type="button"
              onClick={() =>
                addStem(stemEsReasoning, setStemEsReasoning, "New stem...")
              }
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
            >
              + Add
            </button>
          </div>
          <div className="space-y-1">
            {stemEsReasoning.map((stem, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={stem}
                  onChange={(e) =>
                    updateStem(
                      stemEsReasoning,
                      setStemEsReasoning,
                      i,
                      e.target.value,
                    )
                  }
                  placeholder='e.g., "Esto muestra que..."'
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    removeStem(stemEsReasoning, setStemEsReasoning, i)
                  }
                  className="px-2 py-1 text-xs border rounded hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Word Banks */}
      <div className="rounded-2xl border bg-background p-4 space-y-4">
        <div className="text-sm font-medium">Word Banks</div>

        {/* English word bank */}
        <div className="space-y-2">
          <div className="text-xs font-medium flex items-center justify-between">
            <span>English</span>
            <button
              type="button"
              onClick={() => addWordBank(wordBankEn, setWordBankEn)}
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
            >
              + Add word
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {wordBankEn.map((word, i) => (
              <div key={i} className="flex gap-1">
                <input
                  type="text"
                  value={word}
                  onChange={(e) =>
                    updateWordBank(wordBankEn, setWordBankEn, i, e.target.value)
                  }
                  placeholder="Word"
                  className="px-2 py-1 border rounded text-xs w-24"
                />
                <button
                  type="button"
                  onClick={() => removeWordBank(wordBankEn, setWordBankEn, i)}
                  className="px-1 py-1 text-xs border rounded hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Spanish word bank */}
        <div className="space-y-2">
          <div className="text-xs font-medium flex items-center justify-between">
            <span>Spanish</span>
            <button
              type="button"
              onClick={() => addWordBank(wordBankEs, setWordBankEs)}
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded"
            >
              + Add word
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {wordBankEs.map((word, i) => (
              <div key={i} className="flex gap-1">
                <input
                  type="text"
                  value={word}
                  onChange={(e) =>
                    updateWordBank(wordBankEs, setWordBankEs, i, e.target.value)
                  }
                  placeholder="Palabra"
                  className="px-2 py-1 border rounded text-xs w-24"
                />
                <button
                  type="button"
                  onClick={() => removeWordBank(wordBankEs, setWordBankEs, i)}
                  className="px-2 py-1 text-xs border rounded hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
