"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { ANALYTICS_COLORS } from "@/lib/analyticsData";
import type { TeksRow } from "@/lib/analyticsData";

// ── Status badge ──────────────────────────────────────────────────────────────

type MasteryStatus = "mastered" | "approaching" | "developing" | "at-risk";

function masteryStatus(score: number): MasteryStatus {
  if (score >= 85) return "mastered";
  if (score >= 70) return "approaching";
  if (score >= 50) return "developing";
  return "at-risk";
}

const STATUS_CONFIG: Record<
  MasteryStatus,
  { label: string; color: string }
> = {
  mastered:    { label: "Mastered",    color: ANALYTICS_COLORS.teal },
  approaching: { label: "Approaching", color: ANALYTICS_COLORS.muted },
  developing:  { label: "Developing",  color: ANALYTICS_COLORS.amber },
  "at-risk":   { label: "At Risk",     color: ANALYTICS_COLORS.coral },
};

function StatusBadge({ score }: { score: number }) {
  const { label, color } = STATUS_CONFIG[masteryStatus(score)];
  return (
    <Badge
      color={color}
      className="text-[10px] font-bold"
      aria-label={`${label} — ${score}% average`}
    >
      <span style={{ color }}>{label}</span>
    </Badge>
  );
}

// ── Skeleton rows ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      <td className="py-2.5 pl-3 pr-2">
        <div className="h-3 w-10 animate-pulse rounded bg-[#213d58]" />
      </td>
      <td className="py-2.5 px-2">
        <div className="h-3 w-48 animate-pulse rounded bg-[#213d58]" />
      </td>
      <td className="py-2.5 px-2">
        <div className="h-3 w-10 animate-pulse rounded bg-[#213d58]" />
      </td>
      <td className="py-2.5 px-2">
        <div className="h-5 w-16 animate-pulse rounded-full bg-[#213d58]" />
      </td>
      <td className="py-2.5 px-2">
        <div className="h-3 w-6 animate-pulse rounded bg-[#213d58]" />
      </td>
      <td className="py-2.5 px-2">
        <div className="h-3 w-6 animate-pulse rounded bg-[#213d58]" />
      </td>
      <td className="py-2.5 pr-3 pl-2">
        <div className="h-3 w-6 animate-pulse rounded bg-[#213d58]" />
      </td>
    </tr>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface TeksBreakdownTabProps {
  teksMap: TeksRow[];
  loading?: boolean;
}

export function TeksBreakdownTab({ teksMap, loading }: TeksBreakdownTabProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#1e3f5a]">
      <table
        className="w-full min-w-[600px] border-collapse text-xs"
        aria-label="TEKS class mastery breakdown"
      >
        <thead>
          <tr className="border-b border-[#1e3f5a] bg-[#132638]">
            <th
              scope="col"
              className="py-2.5 pl-3 pr-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#9abcb0]"
            >
              TEKS
            </th>
            <th
              scope="col"
              className="py-2.5 px-2 text-left text-[11px] font-semibold uppercase tracking-wide text-[#9abcb0]"
            >
              Description
            </th>
            <th
              scope="col"
              className="py-2.5 px-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#9abcb0]"
            >
              Class Avg
            </th>
            <th
              scope="col"
              className="py-2.5 px-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#9abcb0]"
            >
              Status
            </th>
            <th
              scope="col"
              className="py-2.5 px-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#00d4aa]"
            >
              Mastered
            </th>
            <th
              scope="col"
              className="py-2.5 px-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#f5a623]"
            >
              Tier 2
            </th>
            <th
              scope="col"
              className="py-2.5 pr-3 pl-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#ff6b6b]"
            >
              Tier 3
            </th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
            : teksMap.length === 0
              ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-[#5a8070]"
                    >
                      No TEKS data for the selected filters.
                    </td>
                  </tr>
                )
              : teksMap.map((row) => (
                  <tr
                    key={row.teks}
                    className="border-t border-[#1e3f5a] transition-colors hover:bg-[#213d58]/40"
                  >
                    {/* TEKS code — priority rows get teal left accent */}
                    <td
                      className="py-2.5 pl-3 pr-2 font-bold text-[#e8f4f0]"
                      style={
                        row.isPriority
                          ? { borderLeft: "2px solid #00d4aa" }
                          : { borderLeft: "2px solid transparent" }
                      }
                    >
                      {row.teks}
                      {row.isPriority && (
                        <span className="sr-only"> (priority TEKS)</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-2.5 px-2 text-[#9abcb0]">
                      {row.description}
                    </td>

                    {/* Class avg */}
                    <td className="py-2.5 px-2 text-center font-semibold tabular-nums text-[#e8f4f0]">
                      {row.avgMastery}%
                    </td>

                    {/* Status badge */}
                    <td className="py-2.5 px-2 text-center">
                      <StatusBadge score={row.avgMastery} />
                    </td>

                    {/* Tier counts */}
                    <td className="py-2.5 px-2 text-center font-semibold tabular-nums text-[#00d4aa]">
                      {row.tier1Count > 0 ? row.tier1Count : (
                        <span className="text-[#5a8070]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center font-semibold tabular-nums text-[#f5a623]">
                      {row.tier2Count > 0 ? row.tier2Count : (
                        <span className="text-[#5a8070]">—</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 pl-2 text-center font-semibold tabular-nums text-[#ff6b6b]">
                      {row.tier3Count > 0 ? row.tier3Count : (
                        <span className="text-[#5a8070]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
        </tbody>
      </table>
    </div>
  );
}
