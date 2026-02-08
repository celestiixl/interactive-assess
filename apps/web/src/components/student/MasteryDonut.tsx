"use client";

import { useMemo, useState } from "react";

type Segment = {
  key: string;   // e.g. "RC1"
  label: string; // e.g. "Cell Structure & Function"
  value: number; // 0..100
  colorClass: string; // tailwind text-* for stroke
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function MasteryDonut({
  segments,
  size = 220,
  stroke = 18,
}: {
  segments: Segment[];
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const total = useMemo(() => {
    const sum = segments.reduce((a, s) => a + s.value, 0);
    return sum <= 0 ? 1 : sum;
  }, [segments]);

  const normalized = useMemo(() => {
    // convert each segment into fraction of the ring
    return segments.map((s) => ({
      ...s,
      frac: clamp01(s.value / total),
    }));
  }, [segments, total]);

  // build stroke offsets
  let acc = 0;

  const active =
    (hoverKey && segments.find((s) => s.key === hoverKey)) || null;

  const overall = Math.round(
    segments.reduce((a, s) => a + s.value, 0) / segments.length
  );

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-slate-700">Personal mastery</div>
          <div className="text-xs text-slate-500">
            Hover a slice to see the reporting category.
          </div>
        </div>
        <div className="rounded-full border bg-white px-3 py-1 text-sm font-semibold text-slate-800">
          {active ? `${active.key}: ${active.value}%` : `Overall: ${overall}%`}
        </div>
      </div>

      <div className="relative w-fit">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {/* track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              className="stroke-slate-200"
            />
            {/* segments */}
            {normalized.map((s) => {
              const segLen = c * s.frac;
              const dasharray = `${segLen} ${c - segLen}`;
              const dashoffset = -acc;
              acc += segLen;

              const isActive = hoverKey === s.key;

              return (
                <circle
                  key={s.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={dasharray}
                  strokeDashoffset={dashoffset}
                  className={`${s.colorClass} transition-opacity ${hoverKey && !isActive ? "opacity-40" : "opacity-100"}`}
                  onMouseEnter={() => setHoverKey(s.key)}
                  onMouseLeave={() => setHoverKey(null)}
                />
              );
            })}
          </g>

          {/* center */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r - stroke * 0.6}
            className="fill-white"
          />
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            className="fill-slate-900"
            fontSize="24"
            fontWeight="700"
          >
            {active ? active.key : `${overall}%`}
          </text>
          <text
            x="50%"
            y="60%"
            textAnchor="middle"
            className="fill-slate-500"
            fontSize="12"
          >
            {active ? active.label : "mastery"}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {segments.map((s) => (
          <button
            key={s.key}
            className="rounded-lg border bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
            onMouseEnter={() => setHoverKey(s.key)}
            onMouseLeave={() => setHoverKey(null)}
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-slate-900">{s.key}</div>
              <div className="text-slate-600">{s.value}%</div>
            </div>
            <div className="mt-1 text-xs text-slate-500 line-clamp-2">
              {s.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
