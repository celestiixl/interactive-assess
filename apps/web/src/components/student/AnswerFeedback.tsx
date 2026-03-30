"use client";

type Props = {
  show: boolean;
  correct: boolean | null;
  item?: any;
};

export default function AnswerFeedback({ show, correct, item }: Props) {
  if (!show) return null;

  const explanation =
    item?.explanation || item?.rationale || item?.feedback || null;

  return (
    <div
      className={`mt-4 rounded-2xl border p-4 ${correct ? "bg-[rgba(74,222,128,0.06)]" : "bg-[rgba(245,166,35,0.06)]"}`}
    >
      <div className="text-sm font-semibold text-bs-text">
        {correct === null ? "Feedback" : correct ? "Correct ✅" : "Not yet"}
      </div>
      <div className="mt-2 text-sm text-bs-text-sub">
        {explanation ? (
          explanation
        ) : (
          <>
            <div className="font-semibold text-bs-text">
              Why this matters:
            </div>
            <div className="mt-1">
              The goal is to connect the answer to the biology concept (vocab +
              cause/effect). If you missed it, re-read the question and look for
              keywords like <span className="font-semibold">energy flow</span>,
              <span className="font-semibold"> interactions</span>, or{" "}
              <span className="font-semibold">evidence</span>.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
