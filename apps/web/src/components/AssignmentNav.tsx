"use client";
type Status = "unseen" | "correct" | "wrong";
export default function AssignmentNav({
  total,
  current,
  statusByIndex,
  onSelect,
}: {
  total: number;
  current: number;
  statusByIndex: Record<number, Status>;
  onSelect: (i: number) => void;
}) {
  const items = Array.from({ length: total }, (_, i) => i);
  return (
    <div className="pt-1">
      <div className="flex flex-wrap gap-2">
        {items.map((i) => {
          const status = statusByIndex[i] ?? "unseen";
          const base =
            "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition";
          const palette =
            status === "correct"
              ? "bg-[rgba(74,222,128,0.06)] text-[#4ade80] border-emerald-300"
              : status === "wrong"
                ? "bg-rose-50 text-rose-700 border-rose-300"
                : "bg-bs-surface text-neutral-800 border-neutral-300 hover:bg-neutral-50";
          const ring =
            i === current ? "ring-2 ring-emerald-400 ring-offset-2" : "";
          return (
            <button
              key={i}
              title={`Question ${i + 1}`}
              className={`${base} ${palette} ${ring}`}
              onClick={() => onSelect(i)}
              aria-current={i === current}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
