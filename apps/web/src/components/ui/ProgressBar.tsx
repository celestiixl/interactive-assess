"use client";
function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function ProgressBar({
  percent,
  label,
  durationMs = 600,
}: {
  percent: number;
  label?: string;
  durationMs?: number;
}) {
  const p = clamp(percent);
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-sm text-bs-text-sub">
        <span>{label ?? "Progress"}</span>
        <span className="font-mono text-bs-text">{p}%</span>
      </div>
      <div className="h-[5px] w-full overflow-hidden rounded-full bg-bs-raised">
        <div
          className="h-full rounded-full"
          style={{
            background: "var(--bs-teal)",
            boxShadow: "0 0 8px #00d4aa88",
            width: `${p}%`,
            transition: `width ${durationMs}ms cubic-bezier(.2,.8,.2,1)`,
          }}
          role="progressbar"
          aria-valuenow={p}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
