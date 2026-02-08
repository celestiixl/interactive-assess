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
    <div className="pt-2 overflow-visible">
<div className="flex flex-wrap gap-2 pt-1 overflow-visible pt-2 overflow-visible pt-2 overflow-visible pt-2">
      {items.map((i) => {
        const status = statusByIndex[i] ?? "unseen";
        const base =
          "w-9 h-9 flex items-center justify-center rounded-full border text-sm font-medium transition";
        const palette =
          status === "correct"
            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
            : status === "wrong"
              ? "bg-rose-50 text-rose-700 border-rose-300"
              : "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50";
        const ring =
          i === current
            ? "shadow-[0_0_0_3px_rgba(255,255,255,1),0_0_0_6px_rgba(16,185,129,.9)]"
            : "";
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
