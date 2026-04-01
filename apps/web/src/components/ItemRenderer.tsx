"use client";
import MCQ from "@/components/items/MCQ";
import DragDrop from "@/components/items/DragDrop";
import CardSort from "@/components/items/CardSort";
import Hotspot from "@/components/items/Hotspot";
import ShortResponse from "@/components/items/ShortResponse";
import CER from "@/components/items/CER";
import PunnettQuestion from "@/components/items/PunnettQuestion";
import type { Item } from "@/types/item";
import type {
  DihybridCrossQuestion,
  MonohybridCrossQuestion,
} from "@/lib/punnetScoring";

type PunnettQ = MonohybridCrossQuestion | DihybridCrossQuestion;

export default function ItemRenderer({
  item,
  onChecked,
  checkSignal,
  mcqOptions,
}: {
  item: Item | PunnettQ;
  onChecked: (r: { score: number; max: number }) => void;
  checkSignal?: number;
  mcqOptions?: {
    hideStem?: boolean;
    externalControls?: boolean;
  };
}) {
  // Handle Punnett cross question types (discriminated by "type", not "kind")
  const maybeType = (item as PunnettQ).type;
  if (maybeType === "monohybrid-cross" || maybeType === "dihybrid-cross") {
    return (
      <PunnettQuestion
        question={item as PunnettQ}
        onChecked={onChecked}
      />
    );
  }

  const kindItem = item as Item;

  if (!kindItem) {
    return (
      <div className="rounded-2xl border bg-card p-4">
        <div className="text-sm font-medium">No item loaded</div>

        <div className="mt-1 text-xs text-muted-foreground">
          The practice page tried to render an item, but it was undefined.
        </div>
      </div>
    );
  }

  if (!kindItem.kind) {
    return (
      <div className="rounded-2xl border bg-card p-4">
        <div className="text-sm font-medium">Invalid item</div>

        <div className="mt-1 text-xs text-muted-foreground">
          Missing <code className="rounded bg-muted px-1">kind</code> field.
        </div>

        <pre className="mt-3 overflow-auto rounded-xl bg-muted p-3 text-xs">
          {JSON.stringify(kindItem, null, 2)}
        </pre>
      </div>
    );
  }

  switch (kindItem.kind) {
    case "mcq":
      return (
        <MCQ
          item={kindItem as any}
          onChecked={onChecked}
          checkSignal={checkSignal}
          hideStem={mcqOptions?.hideStem}
          externalControls={mcqOptions?.externalControls}
        />
      );
    case "dragDrop":
      return (
        <DragDrop
          item={kindItem as any}
          onChecked={onChecked}
          checkSignal={checkSignal}
        />
      );
    case "cardSort":
      return (
        <CardSort
          item={kindItem as any}
          onChecked={onChecked}
          checkSignal={checkSignal}
        />
      );
    case "hotspot":
      return (
        <Hotspot
          item={kindItem as any}
          onChecked={onChecked}
          checkSignal={checkSignal}
        />
      );
    case "short":
      return <ShortResponse item={kindItem as any} onChecked={onChecked} />;
    case "cer":
      return <CER item={kindItem as any} onChecked={onChecked} />;
    default:
      return null;
  }
}
