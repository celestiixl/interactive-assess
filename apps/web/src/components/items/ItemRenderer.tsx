"use client";

import React from "react";
import MCQ from "@/components/items/MCQ";
import ShortResponse from "@/components/items/ShortResponse";
import DragDrop from "@/components/items/DragDrop";

type Supports = {
  accommodations?: boolean;
  scaffolding?: "off" | "light" | "full";
  translation?: string; // e.g., 'en' | 'es'
  contentClarifiers?: boolean;
};

type Props = {
  item: any;
  onAfterCheck?: () => void;
  supports?: Supports;
};

function getItemType(item: any): string {
  return (item?.type || item?.kind || item?.itemType || "")
    .toString()
    .toLowerCase();
}

export default function ItemRenderer({ item, onAfterCheck, supports }: Props) {
  const t = getItemType(item);

  // ✅ Guard: if item is missing entirely
  if (!item) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
        <div className="font-semibold">Item missing</div>
        <div className="text-sm opacity-80">
          No item was provided to ItemRenderer.
        </div>
      </div>
    );
  }

  // ✅ MCQ
  if (t === "mcq" || t === "multiple_choice" || t === "multiplechoice") {
    return (
      <MCQ item={item} onAfterCheck={onAfterCheck} supports={supports as any} />
    );
  }

  // ✅ Short Response
  if (
    t === "short_response" ||
    t === "shortresponse" ||
    t === "constructed_response" ||
    t === "crq"
  ) {
    return (
      <ShortResponse
        item={item}
        onAfterCheck={onAfterCheck}
        supports={supports as any}
      />
    );
  }

  // ✅ Drag & Drop (only render if data shape is valid)
  if (t === "drag_drop" || t === "dragdrop" || t === "dnd") {
    const hasCards = Array.isArray(item.cards);
    const hasZones = Array.isArray(item.zones);

    if (!hasCards || !hasZones) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="font-semibold">
            Drag &amp; Drop item is missing data
          </div>
          <div className="mt-1 text-sm opacity-80">
            Expected <code className="font-mono">item.cards</code> and{" "}
            <code className="font-mono">item.zones</code> arrays.
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold">
              Debug item payload
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-white/0/70 p-3 text-xs">
              {JSON.stringify(
                {
                  type: t,
                  id: item.id,
                  hasCards,
                  hasZones,
                  keys: Object.keys(item || {}),
                },
                null,
                2,
              )}
            </pre>
          </details>
        </div>
      );
    }

    return (
      <DragDrop
        item={item}
        onAfterCheck={onAfterCheck}
        supports={supports as any}
      />
    );
  }

  // ✅ Fallback (unknown item type)
  return (
    <div className="rounded-xl border border-neutral-200 bg-white/0 p-4 text-neutral-900">
      <div className="font-semibold">Unknown item type</div>
      <div className="mt-1 text-sm text-neutral-600">
        I don’t know how to render:{" "}
        <code className="font-mono">{t || "(empty)"}</code>
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold">
          Debug item payload
        </summary>
        <pre className="mt-2 overflow-auto rounded-lg bg-neutral-50 p-3 text-xs">
          {JSON.stringify(
            { type: t, id: item?.id, keys: Object.keys(item || {}) },
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  );
}
