"use client";

import * as React from "react";
import type {
  PeriodMasterySnapshot,
  PeriodTEKSAggregate,
} from "@/types/period-mastery";

// ─── Default priority TEKS list ───────────────────────────────────────────────

const DEFAULT_PRIORITY_TEKS = [
  "B.5A",
  "B.5B",
  "B.11A",
  "B.11B",
  "B.7A",
  "B.7B",
  "B.7C",
  "B.12B",
];

// ─── Score band configuration ─────────────────────────────────────────────────

const SCORE_BANDS = [
  { label: "0–49%", key: "band0" as const },
  { label: "50–69%", key: "band1" as const },
  { label: "70–84%", key: "band2" as const },
  { label: "85–100%", key: "band3" as const },
];

/**
 * Derive per-band student counts from PeriodTEKSAggregate data.
 *
 * Tier thresholds (must match computePeriodMastery.ts):
 *   Tier 3 → score < 0.5  (danger)
 *   Tier 2 → score < 0.7  (caution)
 *   Tier 1 → score >= 0.85 (strong)
 *
 * Mapping:
 *   band0 (0–49%)   → tier3Count          (score < 0.5 OR attempts ≥ 2)
 *   band1 (50–69%)  → tier2Count − tier3Count
 *   band2 (70–84%)  → studentCount − tier2Count − tier1Count
 *   band3 (85–100%) → tier1Count
 *
 * NOTE: tier3Count includes students with attemptCount ≥ 2 regardless of score,
 * so band0 is an approximation of "below 50%" rather than an exact count.
 */
function deriveBandCounts(agg: PeriodTEKSAggregate) {
  const band0 = agg.tier3Count;
  const band1 = Math.max(0, agg.tier2Count - agg.tier3Count);
  const band3 = agg.tier1Count;
  const band2 = Math.max(0, agg.studentCount - agg.tier2Count - band3);
  return { band0, band1, band2, band3 };
}

// ─── Color scale ──────────────────────────────────────────────────────────────

/**
 * Returns a background-color rgba string for a TEKS row based on its
 * averageScore.
 *
 *  < 0.50 → coral  rgba(255,107,107,0.25)  — Tier 3 danger
 *  < 0.70 → amber  rgba(245,166,35,0.20)   — Tier 2 caution
 *  < 0.85 → neutral rgba(154,188,176,0.10) — approaching strong
 * >= 0.85 → teal  rgba(0,212,170,0.15)    — strong
 */
function rowBgColor(averageScore: number): string {
  if (averageScore < 0.5) return "rgba(255,107,107,0.25)";
  if (averageScore < 0.7) return "rgba(245,166,35,0.20)";
  if (averageScore < 0.85) return "rgba(154,188,176,0.10)";
  return "rgba(0,212,170,0.15)";
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

type TooltipState = { teks: string; x: number; y: number } | null;

function HeatmapTooltip({
  agg,
  x,
  y,
}: {
  agg: PeriodTEKSAggregate;
  x: number;
  y: number;
}) {
  const scorePct = Math.round(agg.averageScore * 100);
  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-50 min-w-[180px] rounded-xl border border-[#1e3f5a] bg-[#1a3148] p-3 shadow-lg"
      style={{ left: x + 12, top: y - 8 }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-[#e8f4f0]">{agg.teks}</span>
        <span className="text-xs font-semibold text-[#00d4aa]">
          {scorePct}% avg
        </span>
      </div>
      <div className="mt-1.5 flex gap-3 text-[11px] text-[#9abcb0]">
        <span>
          Mastered:{" "}
          <span className="font-semibold text-[#00d4aa]">{agg.tier1Count}</span>
        </span>
        <span>
          Tier 2:{" "}
          <span className="font-semibold text-[#f5a623]">{agg.tier2Count}</span>
        </span>
        <span>
          Tier 3:{" "}
          <span className="font-semibold text-[#ff6b6b]">{agg.tier3Count}</span>
        </span>
      </div>
      <div className="mt-2 text-[11px] font-semibold text-[#00d4aa]">
        View students →
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PeriodMasteryHeatmapProps {
  snapshot: PeriodMasterySnapshot;
  priorityTeks?: string[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PeriodMasteryHeatmap({
  snapshot,
  priorityTeks = DEFAULT_PRIORITY_TEKS,
}: PeriodMasteryHeatmapProps) {
  const [tooltip, setTooltip] = React.useState<TooltipState>(null);

  // Sort: priority TEKS in order specified, then remaining alphabetically
  const sortedAggregates = React.useMemo(() => {
    const prioritySet = new Set(priorityTeks);
    const priorityRows = priorityTeks
      .map((t) => snapshot.teksAggregates.find((a) => a.teks === t))
      .filter((a): a is PeriodTEKSAggregate => a !== undefined);
    const otherRows = snapshot.teksAggregates
      .filter((a) => !prioritySet.has(a.teks))
      .sort((a, b) => a.teks.localeCompare(b.teks));
    return [...priorityRows, ...otherRows];
  }, [snapshot.teksAggregates, priorityTeks]);

  const prioritySet = new Set(priorityTeks);

  function handleMouseEnter(
    e: React.MouseEvent<HTMLTableRowElement>,
    teks: string,
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ teks, x: rect.left, y: rect.top });
  }

  function handleMouseMove(e: React.MouseEvent<HTMLTableRowElement>) {
    if (tooltip) {
      setTooltip((prev) =>
        prev ? { ...prev, x: e.clientX, y: e.clientY } : null,
      );
    }
  }

  function handleMouseLeave() {
    setTooltip(null);
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTableRowElement>,
    teks: string,
  ) {
    if (e.key === "Enter" || e.key === " ") {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip((prev) =>
        prev?.teks === teks ? null : { teks, x: rect.left, y: rect.top },
      );
    }
    if (e.key === "Escape") {
      setTooltip(null);
    }
  }

  const tooltipAgg = tooltip
    ? sortedAggregates.find((a) => a.teks === tooltip.teks)
    : null;

  return (
    <section
      className="rounded-2xl border border-[#1e3f5a] bg-[#132638] font-sans text-[#e8f4f0]"
      aria-label={`Mastery heatmap for ${snapshot.periodLabel}`}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#1e3f5a]">
        <h2 className="text-sm font-bold text-[#e8f4f0]">
          {snapshot.periodLabel}
        </h2>
        <span
          className="rounded-full bg-[#1a3148] border border-[#1e3f5a] px-2.5 py-0.5 text-xs font-semibold text-[#9abcb0]"
          aria-label={`${snapshot.studentCount} students`}
        >
          {snapshot.studentCount} students
        </span>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table
          className="w-full min-w-[480px] border-collapse text-xs"
          aria-label="TEKS mastery score bands"
        >
          <thead>
            <tr className="text-[#9abcb0]">
              <th
                scope="col"
                className="py-2 pl-4 pr-2 text-left font-semibold text-[11px] uppercase tracking-wide"
              >
                TEKS
              </th>
              {SCORE_BANDS.map((band) => (
                <th
                  key={band.key}
                  scope="col"
                  className="py-2 px-2 text-center font-semibold text-[11px] uppercase tracking-wide"
                >
                  {band.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAggregates.map((agg) => {
              const isPriority = prioritySet.has(agg.teks);
              const bands = deriveBandCounts(agg);
              const bg = rowBgColor(agg.averageScore);
              const isTooltipOpen = tooltip?.teks === agg.teks;

              return (
                <tr
                  key={agg.teks}
                  tabIndex={0}
                  role="row"
                  aria-label={`${agg.teks}, average score ${Math.round(agg.averageScore * 100)}%`}
                  aria-expanded={isTooltipOpen}
                  className="cursor-default border-t border-[#1e3f5a] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] focus-visible:ring-inset"
                  style={{ backgroundColor: bg }}
                  onMouseEnter={(e) => handleMouseEnter(e, agg.teks)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onKeyDown={(e) => handleKeyDown(e, agg.teks)}
                >
                  {/* TEKS label cell — priority rows get teal left border */}
                  <td
                    className="py-2.5 pl-3 pr-2 font-semibold"
                    style={
                      isPriority
                        ? { borderLeft: "2px solid #00d4aa" }
                        : { borderLeft: "2px solid transparent" }
                    }
                  >
                    <span className="text-[#e8f4f0]">{agg.teks}</span>
                    {isPriority && (
                      <span className="sr-only"> (priority TEKS)</span>
                    )}
                  </td>

                  {/* Band count cells */}
                  <td className="py-2.5 px-2 text-center tabular-nums text-[#e8f4f0]">
                    {bands.band0 > 0 ? (
                      <span className="font-semibold text-[#ff6b6b]">
                        {bands.band0}
                      </span>
                    ) : (
                      <span className="text-[#5a8070]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center tabular-nums text-[#e8f4f0]">
                    {bands.band1 > 0 ? (
                      <span className="font-semibold text-[#f5a623]">
                        {bands.band1}
                      </span>
                    ) : (
                      <span className="text-[#5a8070]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center tabular-nums text-[#e8f4f0]">
                    {bands.band2 > 0 ? (
                      <span className="font-semibold text-[#9abcb0]">
                        {bands.band2}
                      </span>
                    ) : (
                      <span className="text-[#5a8070]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center tabular-nums text-[#e8f4f0]">
                    {bands.band3 > 0 ? (
                      <span className="font-semibold text-[#00d4aa]">
                        {bands.band3}
                      </span>
                    ) : (
                      <span className="text-[#5a8070]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {sortedAggregates.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-[#5a8070]"
                >
                  No TEKS data for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-3 border-t border-[#1e3f5a] px-4 py-2.5"
        aria-label="Color scale legend"
      >
        <span className="text-[11px] text-[#5a8070] uppercase tracking-wide font-semibold mr-1">
          Row avg
        </span>
        {[
          { bg: "rgba(255,107,107,0.40)", label: "< 50% Tier 3" },
          { bg: "rgba(245,166,35,0.35)", label: "50–69% Tier 2" },
          { bg: "rgba(154,188,176,0.25)", label: "70–84%" },
          { bg: "rgba(0,212,170,0.30)", label: "≥ 85%" },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: item.bg }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-[#9abcb0]">{item.label}</span>
          </span>
        ))}
      </div>

      {/* ── Tooltip portal ─────────────────────────────────────────────────── */}
      {tooltip && tooltipAgg && (
        <HeatmapTooltip
          agg={tooltipAgg}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
    </section>
  );
}
