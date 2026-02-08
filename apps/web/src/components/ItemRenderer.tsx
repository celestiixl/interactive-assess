"use client";
import MCQ from "@/components/items/MCQ";
import DragDrop from "@/components/items/DragDrop";
import CardSort from "@/components/items/CardSort";
import Hotspot from "@/components/items/Hotspot";
import ShortResponse from "@/components/items/ShortResponse";
import type { Item } from "@/types/item";

export default function ItemRenderer({
  item,
  onChecked,
  checkSignal,}: {
  item: Item;
  onChecked: (r: { score: number; max: number }) => void;
  checkSignal?: number;
}) {
  if (!item) {

    return (

      <div className="rounded-2xl border bg-card p-4">

        <div className="text-sm font-medium">No item loaded</div>

        <div className="mt-1 text-xs text-muted-foreground">

          The practice page tried to render an item, but it was undefined.

        </div>

      </div>

    );

  }


  if (!item.kind) {

    return (

      <div className="rounded-2xl border bg-card p-4">

        <div className="text-sm font-medium">Invalid item</div>

        <div className="mt-1 text-xs text-muted-foreground">

          Missing <code className="rounded bg-muted px-1">kind</code> field.

        </div>

        <pre className="mt-3 overflow-auto rounded-xl bg-muted p-3 text-xs">

          {JSON.stringify(item, null, 2)}

        </pre>

      </div>

    );

  }


  switch (item.kind) {
    case "mcq":
      return (
        <MCQ
          item={item as any}
          onAfterCheck={() => onChecked({ score: 1, max: 1 })}
        />
      );
    case "dragDrop":
      return <DragDrop item={item as any} onChecked={onChecked} checkSignal={checkSignal} />;
    case "cardSort":
     return <CardSort item={item as any} onChecked={onChecked} checkSignal={checkSignal} />;
      return <Hotspot item={item as any} onChecked={onChecked} checkSignal={checkSignal} />;
      return <ShortResponse item={item as any} onChecked={onChecked} />;
    default:
      return null;
  }
}
