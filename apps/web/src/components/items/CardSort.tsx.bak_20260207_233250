"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import type { ItemCardSort } from "@/types/item";

/**
 * CardSort with:
 * - Word Bank (drag -> columns and back)
 * - Confetti when fully correct
 * - Next button (enabled when correct)
 *
 * Notes:
 * - Uses native HTML5 drag/drop (no extra DnD lib assumptions)
 * - Scoring is defensive: tries multiple possible "correct column" fields per card
 */
export default function CardSort({
  item,
  onChecked,
  checkSignal,
  onNext,
}: {
  item: ItemCardSort;
  onChecked: (r: { score: number; max: number }) => void;
  checkSignal?: number;
  onNext?: () => void;
}) {
  type ColId = "transcription" | "translation" | "bank";

  const [dragId, setDragId] = useState<string | null>(null);

  // Keep "bank" as a list of ids, and columns as id arrays.
  const [bank, setBank] = useState<string[]>(() => item.cards.map((c: any) => c.id));
  const [cols, setCols] = useState<Record<Exclude<ColId, "bank">, string[]>>({
    transcription: [],
    translation: [],
  });

  const [lastScore, setLastScore] = useState<number>(0);
  const [lastMax, setLastMax] = useState<number>(item.cards.length);
  const [checkedOnce, setCheckedOnce] = useState<boolean>(false);

  const didConfettiRef = useRef(false);

  const cardsById = useMemo(() => {
    const m = new Map<string, any>();
    for (const c of item.cards as any[]) m.set(c.id, c);
    return m;
  }, [item.cards]);

  const getCardLabel = (c: any) =>
    c.label ?? c.text ?? c.term ?? c.prompt ?? c.title ?? c.value ?? c.content ?? c.id;

  const normalize = (v: any): "transcription" | "translation" | null => {
    if (v == null) return null;
    const s = String(v).toLowerCase().trim();
    if (s.includes("transcrip")) return "transcription";
    if (s.includes("translat")) return "translation";
    // allow shorthand
    if (s === "t" || s === "tx") return "transcription";
    if (s === "tl" || s === "tr") return "translation";
    return null;
  };

  const getCorrectCol = (c: any): "transcription" | "translation" | null => {
    // Try common field names
    return (
      normalize(c.correctCol) ??
      normalize(c.correctColumn) ??
      normalize(c.correct) ??
      normalize(c.answer) ??
      normalize(c.category) ??
      normalize(c.group) ??
      normalize(c.bucket) ??
      normalize(c.target)
    );
  };

  const findCurrentCol = (id: string): ColId => {
    if (cols.transcription.includes(id)) return "transcription";
    if (cols.translation.includes(id)) return "translation";
    return "bank";
  };

  const removeFromAll = (id: string) => {
    setBank((prev) => prev.filter((x) => x !== id));
    setCols((prev) => ({
      transcription: prev.transcription.filter((x) => x !== id),
      translation: prev.translation.filter((x) => x !== id),
    }));
  };

  const moveTo = (id: string, destination: ColId) => {
    // no-op if already there
    const cur = findCurrentCol(id);
    if (cur === destination) return;

    // Remove everywhere first (in one tick)
    setBank((prev) => prev.filter((x) => x !== id));
    setCols((prev) => ({
      transcription: prev.transcription.filter((x) => x !== id),
      translation: prev.translation.filter((x) => x !== id),
    }));

    // Then add to destination
    if (destination === "bank") {
      setBank((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      setCols((prev) => ({
        ...prev,
        [destination]: prev[destination].includes(id) ? prev[destination] : [...prev[destination], id],
      }));
    }
  };

  const checkNow = () => {
    const max = item.cards.length;
    let score = 0;

    for (const c of item.cards as any[]) {
      const correct = getCorrectCol(c);
      if (!correct) continue; // if item format doesn't include correct mapping, don't count it
      const placed = findCurrentCol(c.id);
      if (placed === correct) score += 1;
    }

    setLastScore(score);
    setLastMax(max);
    setCheckedOnce(true);
    onChecked({ score, max });

    const isPerfect = score === max && max > 0;

    if (isPerfect && !didConfettiRef.current) {
      didConfettiRef.current = true;
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.65 },
      });
    }

    if (!isPerfect) {
      didConfettiRef.current = false;
    }
  };

  // If parent triggers a check via signal, honor it
  useEffect(() => {
    if (checkSignal == null) return;
    checkNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSignal]);

  const isPerfect = checkedOnce && lastMax > 0 && lastScore === lastMax;

  const onDragStart = (id: string) => {
    setDragId(id);
  };

  const onDropTo = (col: ColId) => {
    if (!dragId) return;
    moveTo(dragId, col);
    setDragId(null);
  };

  const Zone = ({
    title,
    id,
    children,
  }: {
    title: string;
    id: ColId;
    children: React.ReactNode;
  }) => {
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => onDropTo(id)}
        style={{
          border: "1px solid rgba(0,0,0,0.15)",
          borderRadius: 12,
          padding: 12,
          background: "white",
          minHeight: 120,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 10 }}>{title}</div>
        {children}
      </div>
    );
  };

  const Card = ({ id }: { id: string }) => {
    const c = cardsById.get(id);
    if (!c) return null;

    return (
      <div
        draggable
        onDragStart={() => onDragStart(id)}
        style={{
          border: "1px solid rgba(0,0,0,0.18)",
          borderRadius: 10,
          padding: "10px 12px",
          background: "rgba(255,255,255,0.98)",
          cursor: "grab",
          userSelect: "none",
        }}
      >
        {getCardLabel(c)}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: 22, fontWeight: 650 }}>Sort each step into Transcription vs Translation.</div>

      {/* Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Zone title="Transcription" id="transcription">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cols.transcription.map((id) => (
              <Card key={id} id={id} />
            ))}
            {cols.transcription.length === 0 ? (
              <div style={{ opacity: 0.55, fontSize: 13 }}>Drop cards here</div>
            ) : null}
          </div>
        </Zone>

        <Zone title="Translation" id="translation">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cols.translation.map((id) => (
              <Card key={id} id={id} />
            ))}
            {cols.translation.length === 0 ? (
              <div style={{ opacity: 0.55, fontSize: 13 }}>Drop cards here</div>
            ) : null}
          </div>
        </Zone>
      </div>

      {/* Word Bank */}
      <Zone title="Word Bank" id="bank">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, minHeight: 56 }}>
          {bank.map((id) => (
            <div key={id} style={{ flex: "0 1 auto" }}>
              <Card id={id} />
            </div>
          ))}
          {bank.length === 0 ? (
            <div style={{ opacity: 0.55, fontSize: 13 }}>All cards placed</div>
          ) : null}
        </div>
      </Zone>

      {/* Results / actions row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 14,
          padding: "12px 14px",
          background: "rgba(255,255,255,0.9)",
        }}
      >
        <div style={{ opacity: 0.75 }}>
          Score: <span style={{ fontWeight: 650 }}>{checkedOnce ? `${lastScore} / ${lastMax}` : `0 / ${item.cards.length}`}</span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={checkNow}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.25)",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Check
          </button>

          <button
            type="button"
            onClick={() => onNext?.()}
            disabled={!isPerfect}
            title={!isPerfect ? "Get all correct to continue" : "Next"}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.25)",
              background: isPerfect ? "white" : "rgba(0,0,0,0.06)",
              cursor: isPerfect ? "pointer" : "not-allowed",
              fontWeight: 650,
              opacity: isPerfect ? 1 : 0.6,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
