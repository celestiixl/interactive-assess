import * as React from "react";
import { cn } from "@/lib/cn";

export function Ring({
  pct,
  label,
  color = "var(--bs-teal)",
  className,
}: {
  pct: number;
  label?: string;
  color?: string;
  className?: string;
}) {
  const safePct = Math.max(0, Math.min(100, Math.round(pct)));
  const radius = 30;
  const strokeWidth = 7;
  const c = 2 * Math.PI * radius;
  const offset = c - (safePct / 100) * c;

  return (
    <div
      className={cn(
        "relative inline-grid h-24 w-24 place-items-center",
        className,
      )}
    >
      <svg
        className="h-24 w-24 -rotate-90"
        viewBox="0 0 80 80"
        aria-label={label ?? "Progress ring"}
      >
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-sm font-bold text-bs-text">
          {safePct}%
        </div>
        {label ? (
          <div className="text-[10px] text-bs-text-sub">{label}</div>
        ) : null}
      </div>
    </div>
  );
}
