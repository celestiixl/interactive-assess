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
      <div className="mb-1 flex justify-between text-sm text-neutral-700">
        <span>{label ?? "Progress"}</span>
        <span>{p}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200/70">
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, var(--brand) 0%, #34d399 100%)",
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
