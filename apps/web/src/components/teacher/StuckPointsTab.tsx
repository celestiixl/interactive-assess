"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { ANALYTICS_COLORS } from "@/lib/analyticsData";
import type { StudentRow } from "@/lib/analyticsData";

// ── Tier badge ────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: 2 | 3 }) {
  const color = tier === 3 ? ANALYTICS_COLORS.coral : ANALYTICS_COLORS.amber;
  return (
    <Badge
      color={color}
      aria-label={`Tier ${tier} intervention needed`}
      className="shrink-0 text-[10px] font-bold"
    >
      <span style={{ color }}>Tier {tier}</span>
    </Badge>
  );
}

// ── Mastery pill ─────────────────────────────────────────────────────────────

function MasteryPill({ value }: { value: number }) {
  const color =
    value >= 70 ? ANALYTICS_COLORS.teal : value >= 50 ? ANALYTICS_COLORS.amber : ANALYTICS_COLORS.coral;
  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {value}%
    </span>
  );
}

// ── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-[#1e3f5a] bg-[#1a3148] p-3">
      <div className="h-4 w-28 animate-pulse rounded bg-[#213d58]" />
      <div className="ml-auto h-4 w-10 animate-pulse rounded bg-[#213d58]" />
      <div className="h-5 w-12 animate-pulse rounded-full bg-[#213d58]" />
    </li>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface StuckPointsTabProps {
  students: StudentRow[];
  loading?: boolean;
}

export function StuckPointsTab({ students, loading }: StuckPointsTabProps) {
  if (loading) {
    return (
      <ul aria-busy="true" role="list" className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </ul>
    );
  }

  if (students.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#9abcb0]">
        🎉 All students are above the mastery threshold.
      </p>
    );
  }

  return (
    <ul
      role="list"
      aria-label="Students below mastery threshold"
      className="flex flex-col gap-2"
    >
      {students.map((s) => (
        <li
          key={s.id}
          className="flex flex-wrap items-center gap-2.5 rounded-xl border border-[#1e3f5a] bg-[#1a3148] px-3 py-2.5"
        >
          {/* Name + stuck lesson */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#e8f4f0]">
              {s.name}
            </p>
            {s.stuckLesson && (
              <p className="truncate text-[11px] text-[#9abcb0]">
                Stuck: {s.stuckLesson}
              </p>
            )}
          </div>

          {/* Right-side metrics */}
          <MasteryPill value={s.avgMastery} />
          <TierBadge tier={s.tier} />
          {s.failedAttempts > 0 && (
            <span className="text-[11px] text-[#5a8070]">
              {s.failedAttempts} failed
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
