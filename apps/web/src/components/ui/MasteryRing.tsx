import * as React from "react";
import MasteryDonut, {
  type DonutSegment,
} from "@/components/student/MasteryDonut";

export function MasteryRing({ segments }: { segments: DonutSegment[] }) {
  const pct =
    segments.length > 0
      ? Math.round(
          (segments.reduce((acc, s) => acc + (Number(s.value) || 0), 0) /
            segments.length) *
            100,
        )
      : 0;
  const radius = 30;
  const strokeWidth = 7;
  const c = 2 * Math.PI * radius;
  const offset = c - (Math.max(0, Math.min(100, pct)) / 100) * c;

  return (
    <div className="relative isolate rounded-2xl border border-bs-border bg-bs-surface p-4">
      <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-bs-raised/70">
        <svg
          className="h-20 w-20 -rotate-90"
          viewBox="0 0 80 80"
          aria-label="Mastery ring"
        >
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="var(--bs-teal)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ filter: "drop-shadow(0 0 8px rgba(0,212,170,0.55))" }}
          />
        </svg>
        <span className="absolute font-mono text-sm font-bold text-bs-text">
          {pct}%
        </span>
      </div>
      <MasteryDonut segments={segments} />
      <p className="mt-3 text-center text-sm text-bs-text-sub">
        Adaptive by proficiency: colors and counts update from your TEKS
        performance.
      </p>
    </div>
  );
}
