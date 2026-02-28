"use client";

import { useEffect, useMemo, useState } from "react";

export type DragDropCard = {
  id: string;
  text: string;
};

export type DragDropZone = {
  id: string;
  label: string;
};

export type DragDropItem = {
  id: string;
  type?: "dragdrop";
  prompt: string;
  cards: DragDropCard[];
  zones: DragDropZone[];
};

type Placement = Record<string, string[]>;

export default function DragDrop({
  item,
  onAfterCheck,
}: {
  item: any; // keep loose so we can guard at runtime
  onAfterCheck?: () => void;
}) {
  const safe: DragDropItem | null = useMemo(() => {
    if (!item) return null;

    const cards = Array.isArray(item.cards) ? item.cards : null;
    const zones = Array.isArray(item.zones) ? item.zones : null;
    if (!cards || !zones) return null;

    return {
      id: String(item.id ?? "unknown"),
      type: "dragdrop",
      prompt: String(item.prompt ?? ""),
      cards: cards.map((c: any) => ({
        id: String(c.id),
        text: String(c.text ?? ""),
      })),
      zones: zones.map((z: any) => ({
        id: String(z.id),
        label: String(z.label ?? ""),
      })),
    };
  }, [item]);

  // If the wrong item shape is passed in, show a helpful box instead of crashing.
  if (!safe) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <div className="font-semibold">Drag & Drop item is missing data</div>
        <div className="mt-1 text-sm">
          Expected <code className="rounded bg-white/60 px-1">item.cards</code>{" "}
          and <code className="rounded bg-white/60 px-1">item.zones</code>{" "}
          arrays.
        </div>
      </div>
    );
  }

  const [bank, setBank] = useState<string[]>([]);
  const [placement, setPlacement] = useState<Placement>({});
  const [dragId, setDragId] = useState<string | null>(null);

  // Reset whenever the item changes
  useEffect(() => {
    setBank(safe.cards.map((c) => c.id));
    const p: Placement = {};
    safe.zones.forEach((z) => (p[z.id] = []));
    setPlacement(p);
    setDragId(null);
  }, [safe.id, safe.cards, safe.zones]);

  function dropToZone(zoneId: string, cardId: string) {
    // Move card into a category:
    // 1) remove from word bank
    setBank((prev) => prev.filter((id) => id !== cardId));

    // 2) remove from all zones, then add to target zone
    setPlacement((prev) => {
      const next: Placement = {};
      for (const k of Object.keys(prev)) {
        next[k] = (prev[k] ?? []).filter((id) => id !== cardId);
      }
      next[zoneId] = [...(next[zoneId] ?? []), cardId];
      return next;
    });

    setDragId(null);
    onAfterCheck?.();
  }

  function dropToWordBank(cardId: string) {
    // Remove from all zones
    setPlacement((prev) => {
      const next: Placement = {};
      for (const k of Object.keys(prev)) {
        next[k] = (prev[k] ?? []).filter((id) => id !== cardId);
      }
      return next;
    });

    // Add back to bank if not already there
    setBank((prev) => (prev.includes(cardId) ? prev : [...prev, cardId]));

    setDragId(null);
    onAfterCheck?.();
  }

  function cardById(id: string) {
    return safe.cards.find((c) => c.id === id) ?? null;
  }

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold">{safe.prompt}</div>

      {/* Word Bank (top) */}
      <div
        className="rounded-2xl border bg-white overflow-hidden shadow-sm sticky top-2 z-10 sm:static"
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
                      "cursor-grab select-none w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm",
                      "hover:bg-slate-50 active:cursor-grabbing",
                      dragId === id ? "ring-2 ring-emerald-300" : "",
                    ].join(" ")}
                  >
                    {c.text}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Categories (bottom) */}
      <div>
        <div className="text-xs font-semibold text-slate-700 mb-2">
          Categories
        </div>

        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {safe.zones.map((z) => (
            <div
              key={z.id}
              className="rounded-2xl border bg-white overflow-hidden shadow-sm min-h-[190px]"
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
                <div className="min-h-[120px] rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
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
                              "cursor-grab select-none w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm",
                              "hover:bg-slate-50 active:cursor-grabbing",
                              dragId === id ? "ring-2 ring-emerald-300" : "",
                            ].join(" ")}
                          >
                            {c.text}
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
    </div>
  );
}
