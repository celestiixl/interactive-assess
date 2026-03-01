"use client";

import { BilingualText } from "@/components/student/BilingualText";
import { useState } from "react";
import { useLang } from "@/lib/useLang";
import type { ItemCER, CerResponse } from "@/types/item";

type Step = "claim" | "evidence" | "reasoning";

export default function CER({
  item,
  onChecked,
}: {
  item: ItemCER;
  onChecked: (r: { score: number; max: number }) => void;
}) {
  const { lang } = useLang();

  // Form state
  const [step, setStep] = useState<Step>("claim");
  const [claimText, setClaimText] = useState("");
  const [claimEval, setClaimEval] = useState<
    "supported" | "not_supported" | null
  >(null);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [customEvidenceNote, setCustomEvidenceNote] = useState("");
  const [reasoningText, setReasoningText] = useState("");
  const [response, setResponse] = useState<CerResponse | null>(null);

  // Constraints
  const minEvidence = item.constraints?.minEvidence ?? 1;
  const maxEvidence = item.constraints?.maxEvidence ?? 3;
  const reasoningMinChars = item.constraints?.reasoningMinChars ?? 60;
  const allowCustomNote = item.constraints?.allowCustomEvidenceNote ?? false;

  // Get appropriate sentence stems
  const getStemOptions = (
    type: "claim" | "evidence" | "reasoning",
  ): string[] => {
    const stems =
      lang === "es"
        ? item.scaffolds?.sentenceStems?.es?.[type]
        : item.scaffolds?.sentenceStems?.en?.[type];
    return stems ?? [];
  };

  // Get word bank
  const getWordBank = (): string[] => {
    const bank =
      lang === "es"
        ? item.scaffolds?.wordBank?.es
        : item.scaffolds?.wordBank?.en;
    return bank ?? [];
  };

  // Validation
  const isClaimStepValid = (): boolean => {
    if (item.mode === "open") {
      return claimText.trim().length > 0;
    }
    return true; // claim is pre-filled or not needed
  };

  const isEvidenceStepValid = (): boolean => {
    return (
      selectedEvidenceIds.length >= minEvidence &&
      selectedEvidenceIds.length <= maxEvidence
    );
  };

  const isReasoningStepValid = (): boolean => {
    const modeRequiresEval = item.mode === "claim-evaluate";
    const evalValid = !modeRequiresEval || claimEval !== null;
    return reasoningText.trim().length >= reasoningMinChars && evalValid;
  };

  const toggleEvidence = (id: string) => {
    setSelectedEvidenceIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        if (prev.length < maxEvidence) {
          return [...prev, id];
        }
        return prev;
      }
    });
  };

  async function handleSubmit() {
    // Validate all steps
    if (
      !isClaimStepValid() ||
      !isEvidenceStepValid() ||
      !isReasoningStepValid()
    ) {
      return;
    }

    const cerResponse: CerResponse = {
      itemId: item.id,
      claimText: item.mode === "open" ? claimText : undefined,
      claimEvaluation:
        item.mode === "claim-evaluate" ? (claimEval ?? undefined) : undefined,
      selectedEvidenceIds,
      customEvidenceNote: customEvidenceNote || undefined,
      reasoningText,
      submittedAt: new Date().toISOString(),
    };

    // Auto-score evidence selection if correctEvidenceIds is defined
    let autoScore = undefined;
    if (item.correctEvidenceIds) {
      const correctCount = selectedEvidenceIds.filter((id) =>
        item.correctEvidenceIds!.includes(id),
      ).length;
      const evidencePoints = item.rubric?.evidencePoints ?? 2;
      const feedback: string[] = [];

      const supportingCount = selectedEvidenceIds.filter((id) => {
        const ev = item.evidenceBank.find((e) => e.id === id);
        return ev?.tag === "supports";
      }).length;

      if (supportingCount === 0 && selectedEvidenceIds.length > 0) {
        feedback.push(
          lang === "es"
            ? "Considera seleccionar evidencia que apoye el reclamo."
            : "Consider selecting evidence that supports your claim.",
        );
      }

      autoScore = {
        evidence: correctCount,
        totalAuto: evidencePoints,
        feedback: feedback.length ? feedback : undefined,
      };
    }

    if (autoScore) {
      cerResponse.autoScore = autoScore;
    }

    setResponse(cerResponse);
    onChecked({
      score: cerResponse.autoScore?.evidence ?? 0,
      max: item.rubric?.evidencePoints ?? 2,
    });
  }

  // If submitted, show summary
  if (response) {
    return (
      <div className="space-y-4 rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 p-3 rounded-xl">
          <span>✓</span>
          <span>
            {lang === "es" ? "Tu CER fue enviado" : "Your CER was submitted"}
          </span>
        </div>

        {/* Summary of response */}
        <div className="space-y-3 text-sm">
          {/* Claim */}
          {item.mode === "open" && response.claimText && (
            <div className="p-3 rounded-xl bg-slate-50">
              <div className="font-semibold text-xs text-slate-700 mb-1">
                {lang === "es" ? "Reclamo" : "Claim"}
              </div>
              <div className="text-slate-900">{response.claimText}</div>
            </div>
          )}

          {/* Claim Evaluation */}
          {item.mode === "claim-evaluate" && response.claimEvaluation && (
            <div className="p-3 rounded-xl bg-slate-50">
              <div className="font-semibold text-xs text-slate-700 mb-1">
                {lang === "es" ? "Evaluación del reclamo" : "Claim Evaluation"}
              </div>
              <div className="text-slate-900">
                {response.claimEvaluation === "supported"
                  ? lang === "es"
                    ? "Apoyado"
                    : "Supported"
                  : lang === "es"
                    ? "No apoyado"
                    : "Not supported"}
              </div>
            </div>
          )}

          {/* Evidence */}
          <div className="p-3 rounded-xl bg-slate-50">
            <div className="font-semibold text-xs text-slate-700 mb-2">
              {lang === "es" ? "Evidencia seleccionada" : "Selected Evidence"} (
              {response.selectedEvidenceIds.length})
            </div>
            <div className="space-y-2">
              {response.selectedEvidenceIds.map((id) => {
                const ev = item.evidenceBank.find((e) => e.id === id);
                return (
                  <div
                    key={id}
                    className="text-xs text-slate-800 p-2 bg-white rounded border border-slate-200"
                  >
                    {ev?.sourceLabel && (
                      <div className="font-semibold text-slate-600 mb-1">
                        {ev.sourceLabel}
                      </div>
                    )}
                    {ev?.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reasoning */}
          <div className="p-3 rounded-xl bg-slate-50">
            <div className="font-semibold text-xs text-slate-700 mb-1">
              {lang === "es" ? "Razonamiento" : "Reasoning"}
            </div>
            <div className="text-slate-900 whitespace-pre-wrap">
              {response.reasoningText}
            </div>
          </div>

          {/* Auto-feedback */}
          {response.autoScore?.feedback?.length ? (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <div className="font-semibold text-xs text-blue-900 mb-2">
                {lang === "es"
                  ? "Retroalimentación automática"
                  : "Auto-feedback"}
              </div>
              <ul className="space-y-1">
                {response.autoScore.feedback.map((fb, i) => (
                  <li key={i} className="text-xs text-blue-800 flex gap-2">
                    <span>•</span>
                    <span>{fb}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // Main form: 3-step wizard
  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex gap-2 justify-between">
        {(["claim", "evidence", "reasoning"] as const).map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition ${
              step === s
                ? "bg-blue-600"
                : ["claim", "evidence", "reasoning"].indexOf(step) > i
                  ? "bg-green-600"
                  : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-2xl border bg-card p-4 space-y-3">
        {/* STEP 1: CLAIM */}
        {step === "claim" && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">
                {lang === "es" ? "Paso 1: Reclamo" : "Step 1: Claim"}
              </h3>
              {item.context && (
                <p className="text-sm text-slate-600 mt-1">{item.context}</p>
              )}
            </div>

            {item.mode === "open" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {lang === "es" ? "Escribe tu reclamo" : "Write your claim"}
                </label>
                <textarea
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder={
                    lang === "es" ? "Tu reclamo..." : "Your claim..."
                  }
                  className="w-full border rounded-lg p-2 min-h-20 text-sm"
                />
                {getStemOptions("claim").length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">
                      {lang === "es" ? "Frases útiles" : "Sentence starters"}
                    </label>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) setClaimText(val + " ");
                      }}
                      className="w-full border rounded-lg p-2 text-sm"
                    >
                      <option value="">
                        {lang === "es" ? "Seleccionar..." : "Choose..."}
                      </option>
                      {getStemOptions("claim").map((stem) => (
                        <option key={stem} value={stem}>
                          {stem}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : item.claim ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {lang === "es" ? "Reclamo (dado)" : "Given Claim"}
                </label>
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-300 text-sm">
                  {item.claim.text}
                </div>
              </div>
            ) : null}

            <button
              onClick={() => setStep("evidence")}
              disabled={!isClaimStepValid()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              {lang === "es" ? "Siguiente" : "Next"}
            </button>
          </div>
        )}

        {/* STEP 2: EVIDENCE */}
        {step === "evidence" && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">
                {lang === "es" ? "Paso 2: Evidencia" : "Step 2: Evidence"}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {lang === "es"
                  ? `Selecciona entre ${minEvidence} y ${maxEvidence} evidencia`
                  : `Select ${minEvidence}-${maxEvidence} pieces of evidence`}
              </p>
            </div>

            <div className="space-y-2">
              {item.evidenceBank.map((evidence) => (
                <button
                  key={evidence.id}
                  onClick={() => toggleEvidence(evidence.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition ${
                    selectedEvidenceIds.includes(evidence.id)
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      <div
                        className={`w-5 h-5 rounded border-2 transition ${
                          selectedEvidenceIds.includes(evidence.id)
                            ? "bg-blue-600 border-blue-600"
                            : "border-slate-300"
                        }`}
                      >
                        {selectedEvidenceIds.includes(evidence.id) && (
                          <span className="block text-white text-xs font-bold text-center leading-5">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      {evidence.sourceLabel && (
                        <div className="text-xs font-semibold text-slate-600">
                          {evidence.sourceLabel}
                          {evidence.tag && (
                            <span className="ml-2 inline-block px-2 py-1 text-xs bg-slate-200 rounded">
                              {evidence.tag}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-slate-900 mt-1">
                        {evidence.text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-600 font-medium">
              {lang === "es"
                ? `Seleccionados: ${selectedEvidenceIds.length}/${maxEvidence}`
                : `Selected: ${selectedEvidenceIds.length}/${maxEvidence}`}
            </div>

            {allowCustomNote && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {lang === "es"
                    ? "Nota adicional (opcional)"
                    : "Custom evidence note (optional)"}
                </label>
                <textarea
                  value={customEvidenceNote}
                  onChange={(e) => setCustomEvidenceNote(e.target.value)}
                  placeholder={lang === "es" ? "Nota..." : "Note..."}
                  className="w-full border rounded-lg p-2 min-h-[60px] text-sm"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep("claim")}
                className="flex-1 border border-slate-300 text-slate-900 py-2 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                {lang === "es" ? "Atrás" : "Back"}
              </button>
              <button
                onClick={() => setStep("reasoning")}
                disabled={!isEvidenceStepValid()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
              >
                {lang === "es" ? "Siguiente" : "Next"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REASONING */}
        {step === "reasoning" && (
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg">
                {lang === "es" ? "Paso 3: Razonamiento" : "Step 3: Reasoning"}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {lang === "es"
                  ? `Mínimo ${reasoningMinChars} caracteres`
                  : `Minimum ${reasoningMinChars} characters`}
              </p>
            </div>

            {item.mode === "claim-evaluate" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {lang === "es"
                    ? "¿Es el reclamo apoyado?"
                    : "Is the claim supported?"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["supported", "not_supported"] as const).map((val) => (
                    <button
                      key={val}
                      onClick={() => setClaimEval(val)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                        claimEval === val
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      {val === "supported"
                        ? lang === "es"
                          ? "Apoyado"
                          : "Supported"
                        : lang === "es"
                          ? "No apoyado"
                          : "Not Supported"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {lang === "es"
                  ? "Explica tu razonamiento"
                  : "Explain your reasoning"}
              </label>
              <textarea
                value={reasoningText}
                onChange={(e) => setReasoningText(e.target.value)}
                placeholder={
                  lang === "es" ? "Tu razonamiento..." : "Your reasoning..."
                }
                className="w-full border rounded-lg p-2 min-h-30 text-sm"
              />
              <div className="text-xs text-slate-600">
                {lang === "es"
                  ? `${reasoningText.length}/${reasoningMinChars} caracteres`
                  : `${reasoningText.length}/${reasoningMinChars} characters`}
              </div>
            </div>

            {getStemOptions("reasoning").length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  {lang === "es" ? "Frases útiles" : "Sentence starters"}
                </label>
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setReasoningText((prev) => prev + " " + val);
                  }}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  <option value="">
                    {lang === "es" ? "Seleccionar..." : "Choose..."}
                  </option>
                  {getStemOptions("reasoning").map((stem) => (
                    <option key={stem} value={stem}>
                      {stem}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {getWordBank().length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600">
                  {lang === "es" ? "Banco de palabras" : "Word bank"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {getWordBank().map((word) => (
                    <button
                      key={word}
                      onClick={() =>
                        setReasoningText((prev) => prev + " " + word)
                      }
                      className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium transition"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep("evidence")}
                className="flex-1 border border-slate-300 text-slate-900 py-2 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                {lang === "es" ? "Atrás" : "Back"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isReasoningStepValid()}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition"
              >
                {lang === "es" ? "Enviar" : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
