"use client";

export type ItemType =
  | "mcq"
  | "constructed"
  | "card_sort"
  | "drag_drop"
  | "hotspot";

export function WorkHeader({
  type,
  meta,
  onReset,
}: {
  type: ItemType;
  meta?: {
    placed?: number;
    total?: number;
    wordCount?: number;
    maxWords?: number;
  };
  onReset?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium">Your Work</div>
        <div className="text-xs text-muted-foreground">
          {type === "card_sort" ? "Sort the cards into categories" : null}
          {type === "constructed" ? "Write your response" : null}
          {type === "mcq" ? "Choose the best answer" : null}
          {type === "drag_drop" ? "Drag items to the correct targets" : null}
          {type === "hotspot" ? "Select the correct area" : null}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {type === "constructed" ? (
          <span>
            {meta?.wordCount ?? 0}
            {meta?.maxWords ? ` / ${meta.maxWords}` : ""} words
          </span>
        ) : null}

        {type === "card_sort" ? (
          <span>
            Placed {meta?.placed ?? 0}/{meta?.total ?? 0}
          </span>
        ) : null}

        {onReset ? (
          <button
            onClick={onReset}
            className="rounded-xl border px-2 py-1 text-xs hover:bg-muted/30"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function WorkFooter({
  status,
  onSave,
  onSubmit,
}: {
  status?: "saved" | "saving" | "unsaved";
  onSave: () => void;
  onSubmit: () => void;
}) {
  const label =
    status === "saving"
      ? "Saving..."
      : status === "saved"
        ? "Saved"
        : status === "unsaved"
          ? "Unsaved"
          : "";

  return (
    <div className="flex items-center justify-between">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-muted/30"
        >
          Save
        </button>
        <button
          onClick={onSubmit}
          className="rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
