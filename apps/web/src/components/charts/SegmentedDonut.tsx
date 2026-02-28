/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";

type SegmentInput = {
  id: string;
  label?: string;
  rc?: string;

  // assessed volume (wedge size)
  value?: number;
  total?: number;

  // mastery (inner ring)
  progress?: number; // 0..1
  correct?: number;
  mastered?: number;

  // optional explicit color
  color?: string;
};

type Props = {
  segments: SegmentInput[];
  size?: number;
  label?: string;
};

const DEFAULT_PALETTE = ["#0f766e", "#2563eb", "#d97706", "#b91c1c"]; // chlorophyll/teal-ish, slate-blue, amber, rose-red

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function polar(cx: number, cy: number, r: number, a: number) {
  // a in radians, 0 at 12 o'clock
  const x = cx + r * Math.cos(a - Math.PI / 2);
  const y = cy + r * Math.sin(a - Math.PI / 2);
  return { x, y };
}

function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  a0: number,
  a1: number,
) {
  const p0 = polar(cx, cy, rOuter, a0);
  const p1 = polar(cx, cy, rOuter, a1);
  const p2 = polar(cx, cy, rInner, a1);
  const p3 = polar(cx, cy, rInner, a0);

  const large = a1 - a0 > Math.PI ? 1 : 0;

  return [
    `M ${p0.x} ${p0.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p3.x} ${p3.y}`,
    "Z",
  ].join(" ");
}

export default function SegmentedDonut({ segments, size = 320, label }: Props) {
  const safe = Array.isArray(segments) ? segments : [];

  const norm = React.useMemo(() => {
    return [];
  }, [safe]);

  // normalize without any cursor mutation (lint-safe)
  const normalized = React.useMemo(() => {
    const values = safe.map((s) => {
      const v = Number.isFinite(Number(s.value))
        ? Number(s.value)
        : Number.isFinite(Number(s.total))
          ? Number(s.total)
          : 0;
      return Math.max(0, v);
    });

    const sum = values.reduce((a, b) => a + b, 0) || 1;

    const list = safe.map((s, i) => {
      const value = values[i];
      const frac = value / sum;

      const progressRaw = Number.isFinite(Number(s.progress))
        ? Number(s.progress)
        : Number.isFinite(Number(s.total)) && Number(s.total) > 0
          ? 0
          : 0;

      // TS version below (we replace placeholders right after writing)
      return {
        id: String(s.id ?? `seg_${i}`),
        label: String(s.label ?? s.rc ?? s.id ?? `Segment ${i + 1}`),
        value,
        frac,
        progress: 0,
        color: String(s.color ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]),
        raw: s,
      };
    });

    // cumulative angles
    let a = 0;
    const out = list.map((s) => {
      const a0 = a;
      const a1 = a + s.frac * Math.PI * 2;
      a = a1;
      return { ...s, a0, a1 };
    });

    return out;
  }, [safe]);

  // Fix placeholder logic by computing progress in a second memo (keeps TS clean)
  const segmentsWithProgress = React.useMemo(() => {
    return normalized.map((s) => {
      const raw = s.raw as SegmentInput;

      let prog = 0;
      if (Number.isFinite(Number(raw.progress))) {
        prog = Number(raw.progress);
      } else if (Number.isFinite(Number(raw.total)) && Number(raw.total) > 0) {
        const denom = Number(raw.total);
        const num = Number.isFinite(Number(raw.correct))
          ? Number(raw.correct)
          : Number.isFinite(Number(raw.mastered))
            ? Number(raw.mastered)
            : 0;
        prog = num / denom;
      } else {
        prog = 0;
      }

      return { ...s, progress: clamp01(prog) };
    });
  }, [normalized]);

  const overallPct = React.useMemo(() => {
    // if totals exist, compute weighted mastery; otherwise average progress
    const hasTotals = safe.some(
      (s) => Number.isFinite(Number(s.total)) && Number(s.total) > 0,
    );
    if (hasTotals) {
      /* computed below */
    }
    return 0;
  }, [safe]);

  const overallPct2 = React.useMemo(() => {
    const hasTotals = safe.some(
      (s) => Number.isFinite(Number(s.total)) && Number(s.total) > 0,
    );
    if (hasTotals) {
      const total = safe.reduce(
        (acc, s) =>
          acc + (Number.isFinite(Number(s.total)) ? Number(s.total) : 0),
        0,
      );
      const mastered = safe.reduce((acc, s) => {
        const denom = Number.isFinite(Number(s.total)) ? Number(s.total) : 0;
        if (denom <= 0) return acc;
        const num = Number.isFinite(Number(s.correct))
          ? Number(s.correct)
          : Number.isFinite(Number(s.mastered))
            ? Number(s.mastered)
            : 0;
        return acc + Math.max(0, num);
      }, 0);
      return total > 0 ? Math.round((mastered / total) * 100) : 0;
    }
    if (segmentsWithProgress.length === 0) return 0;
    const avg =
      segmentsWithProgress.reduce((a, s) => a + s.progress, 0) /
      segmentsWithProgress.length;
    return Math.round(avg * 100);
  }, [safe, segmentsWithProgress]);

  // Replace placeholders with TS-safe values (we'll rewrite this block correctly below)
  const overall = overallPct2;

  const [tip, setTip] = React.useState<{
    show: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    show: false,
    x: 0,
    y: 0,
    text: "",
  });

  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  function showTip(e: React.MouseEvent, text: string) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    setTip({ show: true, x, y, text });
  }

  function moveTip(e: React.MouseEvent) {
    if (!tip.show) return;
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    setTip((t) => ({ ...t, x, y }));
  }

  function hideTip() {
    setTip((t) => ({ ...t, show: false }));
  }

  const cx = size / 2;
  const cy = size / 2;

  const rOuter = size * 0.46;
  const rInner = size * 0.34;

  const rProgOuter = size * 0.32;
  const rProgInner = size * 0.28;

  return (
    <div ref={wrapRef} className="relative inline-block select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={label ?? "donut"}
      >
        {/* soft base ring */}
        <circle
          cx={cx}
          cy={cy}
          r={(rOuter + rInner) / 2}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={rOuter - rInner}
        />

        {/* wedges (assessed volume) */}
        {segmentsWithProgress.map((s) => (
          <path
            key={s.id}
            d={arcPath(cx, cy, rOuter, rInner, s.a0, s.a1)}
            fill={s.color}
            opacity={0.28}
            onMouseEnter={(e) => showTip(e, s.label)}
            onMouseMove={moveTip}
            onMouseLeave={hideTip}
            style={{ cursor: "pointer" }}
          />
        ))}

        {/* mastery ring per segment */}
        {segmentsWithProgress.map((s) => {
          const span = s.a1 - s.a0;
          const a1 = s.a0 + span * s.progress;
          if (a1 <= s.a0 + 1e-6) return null;
          return (
            <path
              key={`${s.id}_prog`}
              d={arcPath(cx, cy, rProgOuter, rProgInner, s.a0, a1)}
              fill={s.color}
              opacity={0.95}
              onMouseEnter={(e) => showTip(e, s.label)}
              onMouseMove={moveTip}
              onMouseLeave={hideTip}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {/* hole */}
        <circle cx={cx} cy={cy} r={size * 0.24} fill="#ffffff" />

        {/* center text: ALWAYS overall percent */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize={Math.round(size * 0.11)}
          fontWeight="700"
          fill="#0b0f17"
        >
          {overall}%
        </text>
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          fontSize={Math.round(size * 0.045)}
          fill="#475569"
        >
          overall
        </text>
      </svg>

      {/* tooltip */}
      {tip.show && (
        <div
          className="pointer-events-none absolute z-10 rounded-md bg-neutral-900/95 px-3 py-2 text-sm font-medium text-white shadow"
          style={{
            left: Math.min(Math.max(8, tip.x + 14), size - 8),
            top: Math.min(Math.max(8, tip.y + 14), size - 8),
            transform: "translate(-0%, -0%)",
            maxWidth: 260,
            whiteSpace: "nowrap",
          }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}
