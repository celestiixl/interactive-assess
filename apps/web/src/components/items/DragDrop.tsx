"use client";

import BilingualText from "@/components/student/BilingualText";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/lib/useLang";

type Card = { id: string; text: string };
type Zone = { id: string; label: string };

export type DragDropItem = {
  id: string;
  type?: string;
  stem?: string;
  teks?: string[];
  cards: Card[];
  zones: (Zone & { accepts?: string[] })[];
  correct?: Record<string, string>;
  rationale?: string;
};
type Placement = Record<string, string[]>;

type Normalized = {
  id: string;
  prompt: string;
  cards: Card[];
  zones: Zone[];
  correct?: Record<string, string>; // cardId -> zoneId
  rationale?: string;
};

export default function DragDrop({
  item,
  onChecked,
  checkSignal,
}: {
  item: any;
  onChecked?: (r: { score: number; max: number }) => void;
  checkSignal?: number;
}) {
  const safe: Normalized | null = useMemo(() => {
    if (!item) return null;

    // Shape A (your new interactives): stem/tokens/buckets/correct
    if (Array.isArray(item.tokens) && Array.isArray(item.buckets)) {
      const cards = item.tokens.map((t: any) => ({
        id: String(t.id),
        text: String(t.text ?? ""),
      }));
      const zones = item.buckets.map((b: any) => ({
        id: String(b.id),
        label: String(b.label ?? ""),
      }));
      return {
        id: String(item.id ?? "unknown"),
        prompt: String(item.stem ?? ""),
        cards,
        zones,
        correct:
          item.correct && typeof item.correct === "object"
            ? item.correct
            : undefined,
        rationale: item.rationale ? String(item.rationale) : undefined,
      };
    }

    // Shape B (older): prompt/cards/zones
    if (Array.isArray(item.cards) && Array.isArray(item.zones)) {
      const cards = item.cards.map((c: any) => ({
        id: String(c.id),
        text: String(c.text ?? ""),
      }));
      const zones = item.zones.map((z: any) => ({
        id: String(z.id),
        label: String(z.label ?? ""),
      }));
      return {
        id: String(item.id ?? "unknown"),
        prompt: String(item.prompt ?? ""),
        cards,
        zones,
        correct:
          item.correct && typeof item.correct === "object"
            ? item.correct
            : undefined,
        rationale: item.rationale ? String(item.rationale) : undefined,
      };
    }

    return null;
  }, [item]);

  const [bank, setBank] = useState<string[]>([]);
  const [placement, setPlacement] = useState<Placement>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const { lang } = useLang();

  // Reset whenever item changes
  useEffect(() => {
    if (!safe) return;
    setBank(safe.cards.map((c) => c.id));
    const p: Placement = {};
    safe.zones.forEach((z) => (p[z.id] = []));
    setPlacement(p);
    setDragId(null);
  }, [safe?.id]);

  function dropToZone(zoneId: string, cardId: string) {
    setBank((prev) => prev.filter((id) => id !== cardId));
    setPlacement((prev) => {
      const next: Placement = {};
      for (const k of Object.keys(prev))
        next[k] = (prev[k] ?? []).filter((id) => id !== cardId);
      next[zoneId] = [...(next[zoneId] ?? []), cardId];
      return next;
    });
    setDragId(null);
  }

  function dropToWordBank(cardId: string) {
    setPlacement((prev) => {
      const next: Placement = {};
      for (const k of Object.keys(prev))
        next[k] = (prev[k] ?? []).filter((id) => id !== cardId);
      return next;
    });
    setBank((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));
    setDragId(null);
  }

  function cardById(id: string) {
    return safe?.cards.find((c) => c.id === id) ?? null;
  }

  function scoreNow() {
    if (!safe) return;
    const total = safe.cards.length;

    // If we don't have an answer key, we still "check" but can't grade.
    if (!safe.correct) {
      onChecked?.({ score: 0, max: total });
      return;
    }

    let correctCount = 0;
    for (const [zoneId, ids] of Object.entries(placement)) {
      for (const cid of ids) {
        if (safe.correct[cid] === zoneId) correctCount++;
      }
    }
    onChecked?.({ score: correctCount, max: total });
  }

  // When parent triggers "Check", auto-score.
  if (!safe) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <div className="font-semibold">Drag & Drop item is missing data</div>
        <div className="mt-1 text-sm">
          Expected either{" "}
          <code className="rounded bg-white/0/60 px-1">tokens/buckets</code> or{" "}
          <code className="rounded bg-white/0/60 px-1">cards/zones</code>.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold">{safe.prompt}</div>

      {/* Word Bank */}
      <div
        className="/0 overflow-hidden sticky top-2 z-10 sm:static ia-card-soft "
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          if (id) dropToWordBank(id);
        }}
      >
        <div className="flex items-center justify-between bg-slate-100 px-3 py-2 border-b">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
            <div className="text-sm font-semibold text-slate-800">
              Word Bank
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Drag cards into a category
          </div>
        </div>

        <div className="p-3">
          {bank.length === 0 ? (
            <div className="text-sm text-slate-500">All cards placed.</div>
          ) : (
            <div className="space-y-2">
              {bank.map((id) => {
                const c = cardById(id);
                if (!c) return null;
                return (
                  <div
                    key={id}
                    draggable
                    onDragStart={(e) => {
                      setDragId(id);
                      e.dataTransfer.setData("text/plain", id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className={[
                      "cursor-grab select-none w-full rounded-xl border bg-white/0 px-3 py-2 text-sm shadow-sm",
                      "hover:bg-slate-50 active:cursor-grabbing",
                      dragId === id ? "ring-2 ring-emerald-300" : "",
                    ].join(" ")}
                  >
                    {
                      <BilingualText
                        text={c.text}
                        showSupport={lang === "es"}
                      />
                    }
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="text-xs font-semibold text-slate-700 mb-2">
          Categories
        </div>

        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {safe.zones.map((z) => (
            <div
              key={z.id}
              className="overflow-hidden min-h-47.5 ia-card-soft"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                if (id) dropToZone(z.id, id);
              }}
            >
              <div className="flex items-center justify-between bg-slate-100 px-3 py-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
                  <div className="text-sm font-semibold text-slate-800">
                    {z.label}
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  {(placement[z.id] ?? []).length} card
                  {(placement[z.id] ?? []).length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="p-3">
                <div className="min-h-30 rounded-xl border border-dashed border-slate-300 p-3">
                  {(placement[z.id] ?? []).length === 0 ? (
                    <div className="text-sm text-slate-500">
                      Drop cards here.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(placement[z.id] ?? []).map((id) => {
                        const c = cardById(id);
                        if (!c) return null;
                        return (
                          <div
                            key={id}
                            draggable
                            onDragStart={(e) => {
                              setDragId(id);
                              e.dataTransfer.setData("text/plain", id);
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            className={[
                              "cursor-grab select-none w-full rounded-xl border bg-white/0 px-3 py-2 text-sm shadow-sm",
                              "hover:bg-slate-50 active:cursor-grabbing",
                              dragId === id ? "ring-2 ring-emerald-300" : "",
                            ].join(" ")}
                          >
                            {
                              <BilingualText
                                text={c.text}
                                showSupport={lang === "es"}
                              />
                            }
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Check */}
      <div className="flex items-center gap-3">
        <button data-check-button="true" onClick={scoreNow} className="hidden">
          Check
        </button>
        {safe.rationale ? (
          <div className="text-sm text-neutral-700">
            {lang === "es" ? "Pista:" : "Hint:"} {safe.rationale}
          </div>
        ) : null}
      </div>
    </div>
  );
}
