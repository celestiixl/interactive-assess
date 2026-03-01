"use client";

import { useState } from "react";
import type { ItemCER, CerResponse } from "@/types/item";

export default function CERReview({
  item,
  response,
  onScoreSaved,
}: {
  item: ItemCER;
  response: CerResponse;
  onScoreSaved?: (score: any) => void;
}) {
  const [claimScore, setClaimScore] = useState(
    response.teacherScore?.claim ?? 0,
  );
  const [evidenceScore, setEvidenceScore] = useState(
    response.teacherScore?.evidence ?? 0,
  );
  const [reasoningScore, setReasoningScore] = useState(
    response.teacherScore?.reasoning ?? 0,
  );
  const [comments, setComments] = useState(
    response.teacherScore?.comments ?? "",
  );

  const maxClaimPoints = item.rubric?.claimPoints ?? 2;
  const maxEvidencePoints = item.rubric?.evidencePoints ?? 2;
  const maxReasoningPoints = item.rubric?.reasoningPoints ?? 4;

  // Quick feedback buttons
  const quickComments = [
    "Needs Evidence",
    "Reasoning unclear",
    "Strong CER",
    "Good use of evidence",
    "Claim needs support",
  ];

  function addQuickComment(text: string) {
    setComments((prev) => (prev ? `${prev}\n${text}` : text));
  }

  function saveScore() {
    const totalScore = claimScore + evidenceScore + reasoningScore;
    const totalMax = maxClaimPoints + maxEvidencePoints + maxReasoningPoints;

    const score = {
      claim: item.mode === "open" ? claimScore : undefined,
      evidence: evidenceScore,
      reasoning: reasoningScore,
      total: totalScore,
      comments,
    };

    onScoreSaved?.(score);
  }

  const selectedEvidenceDetails = response.selectedEvidenceIds.map((id) =>
    item.evidenceBank.find((e) => e.id === id),
  );

  return (
    <div className="space-y-4 rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold">Review Student CER Response</div>

      {/* Display mode info */}
      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
        Mode: <span className="font-semibold">{item.mode}</span>
      </div>

      {/* CLAIM SECTION */}
      {item.mode === "open" && response.claimText && (
        <div className="border-t pt-3">
          <div className="font-semibold text-sm mb-2">Claim</div>
          <div className="p-3 rounded-lg bg-slate-100 text-sm text-slate-900 mb-3">
            {response.claimText}
          </div>
          <div className="grid grid-cols-2 gap-2 items-center">
            <label className="text-xs font-medium">Score</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max={maxClaimPoints}
                value={claimScore}
                onChange={(e) =>
                  setClaimScore(Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-16 border rounded px-2 py-1 text-sm"
              />
              <span className="text-xs text-slate-600">/ {maxClaimPoints}</span>
            </div>
          </div>
        </div>
      )}

      {/* CLAIM EVALUATION SECTION (for claim-evaluate mode) */}
      {item.mode === "claim-evaluate" && response.claimEvaluation && (
        <div className="border-t pt-3">
          <div className="font-semibold text-sm mb-2">Claim Evaluation</div>
          <div className="p-3 rounded-lg bg-slate-100 text-sm text-slate-900 mb-3">
            {response.claimEvaluation === "supported"
              ? "Supported"
              : "Not Supported"}
          </div>
        </div>
      )}

      {/* EVIDENCE SECTION */}
      <div className="border-t pt-3">
        <div className="font-semibold text-sm mb-2">
          Evidence Selected ({response.selectedEvidenceIds.length})
        </div>
        <div className="space-y-2 mb-3">
          {selectedEvidenceDetails.map(
            (evidence, i) =>
              evidence && (
                <div
                  key={evidence.id}
                  className="p-3 rounded-lg bg-blue-50 border border-blue-200"
                >
                  {evidence.sourceLabel && (
                    <div className="font-semibold text-xs text-blue-700 mb-1">
                      {evidence.sourceLabel}
                      {evidence.tag && (
                        <span className="ml-2 inline-block px-2 py-0.5 bg-blue-200 rounded text-xs">
                          {evidence.tag}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-blue-900">{evidence.text}</p>
                </div>
              ),
          )}
        </div>

        {response.autoScore?.feedback?.length ? (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 mb-3">
            <div className="text-xs font-semibold text-yellow-900 mb-1">
              Auto-Feedback
            </div>
            <ul className="space-y-1">
              {response.autoScore.feedback.map((fb, i) => (
                <li key={i} className="text-xs text-yellow-800">
                  • {fb}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 items-center">
          <label className="text-xs font-medium">Score</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max={maxEvidencePoints}
              value={evidenceScore}
              onChange={(e) =>
                setEvidenceScore(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-16 border rounded px-2 py-1 text-sm"
            />
            <span className="text-xs text-slate-600">
              / {maxEvidencePoints}
            </span>
          </div>
        </div>
      </div>

      {/* REASONING SECTION */}
      <div className="border-t pt-3">
        <div className="font-semibold text-sm mb-2">Reasoning</div>
        <div className="p-3 rounded-lg bg-slate-100 text-sm text-slate-900 mb-3 whitespace-pre-wrap">
          {response.reasoningText}
        </div>
        <div className="grid grid-cols-2 gap-2 items-center mb-3">
          <label className="text-xs font-medium">Score</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max={maxReasoningPoints}
              value={reasoningScore}
              onChange={(e) =>
                setReasoningScore(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-16 border rounded px-2 py-1 text-sm"
            />
            <span className="text-xs text-slate-600">
              / {maxReasoningPoints}
            </span>
          </div>
        </div>
      </div>

      {/* TEACHER COMMENTS */}
      <div className="border-t pt-3">
        <div className="font-semibold text-sm mb-2">Comments</div>

        {/* Quick comment buttons */}
        <div className="flex flex-wrap gap-2 mb-2">
          {quickComments.map((comment) => (
            <button
              key={comment}
              onClick={() => addQuickComment(comment)}
              className="px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 rounded font-medium transition"
            >
              + {comment}
            </button>
          ))}
        </div>

        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add feedback for this student..."
          className="w-full border rounded-lg p-2 min-h-[100px] text-sm"
        />
      </div>

      {/* TOTALS */}
      <div className="border-t pt-3 bg-slate-50 p-3 rounded-lg">
        <div className="text-xs font-semibold text-slate-900 mb-2">
          Total Score
        </div>
        <div className="grid grid-cols-2 gap-2">
          {item.mode === "open" && (
            <div className="text-xs">
              <span className="text-slate-600">Claim: </span>
              <span className="font-semibold">
                {claimScore}/{maxClaimPoints}
              </span>
            </div>
          )}
          <div className="text-xs">
            <span className="text-slate-600">Evidence: </span>
            <span className="font-semibold">
              {evidenceScore}/{maxEvidencePoints}
            </span>
          </div>
          <div className="text-xs">
            <span className="text-slate-600">Reasoning: </span>
            <span className="font-semibold">
              {reasoningScore}/{maxReasoningPoints}
            </span>
          </div>
          <div className="text-xs font-bold text-blue-700">
            <span className="text-slate-600">Total: </span>
            <span className="font-bold text-blue-700">
              {claimScore + evidenceScore + reasoningScore}/
              {maxClaimPoints + maxEvidencePoints + maxReasoningPoints}
            </span>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={saveScore}
        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
      >
        Save Score
      </button>
    </div>
  );
}
