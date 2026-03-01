"use client";

import BilingualText from "@/components/student/BilingualText";
import { useState } from "react";
import { useLang } from "@/lib/useLang";
import type { ItemShort } from "@/types/item";

export default function ShortResponse({
  item,
  onChecked,
}: {
  item: ItemShort;
  onChecked: (r: { score: number; max: number }) => void;
}) {
  const [text, setText] = useState("");
  const [resp, setResp] = useState<{
    score: number;
    max: number;
    reasons?: string[];
  } | null>(null);

  async function check() {
    const r = await fetch("/api/score/short", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId: item.id, text, rubric: item.rubric }),
    })
      .then((r) => r.json())
      .catch(() => ({
        score: 0,
        max: item.rubric.points,
        reasons: ["Network error"],
      }));
    setResp(r);
    onChecked({ score: r.score, max: r.max });
  }

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">{<BilingualText text={item.stem} showSupport={lang === "es"} />}</div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border rounded p-2 min-h-[120px]"
        placeholder="Type your answer..."
      />
      <button onClick={check} className="btn-primary">
        Check
      </button>
      {resp && (
        <div className="mt-2 p-2 border rounded bg-neutral-50 text-sm">
          <div>
            Score: {resp.score} / {resp.max}
          </div>
          {resp.reasons?.length ? (
            <ul className="list-disc pl-5 mt-1">
              {resp.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
      {item.rationale && (
        <div className="text-sm text-neutral-700">{lang === "es" ? "Pista:" : "Hint:"} {item.rationale}</div>
      )}
    </div>
  );
}
