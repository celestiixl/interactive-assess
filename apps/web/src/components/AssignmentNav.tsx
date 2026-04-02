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
            "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-mono transition";
          const palette =
            status === "correct"
              ? "bg-[#00d4aa]/20 border-[#00d4aa] text-[#00d4aa]"
              : status === "wrong"
                ? "bg-[#ff6b6b]/20 border-[#ff6b6b] text-[#ff6b6b]"
                : "border-[#5a8070] text-[#9abcb0] hover:bg-[#1a3148]";
          const ring =
            i === current
              ? "border-2 border-[#00d4aa] text-[#00d4aa] bg-[#00d4aa]/10"
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
