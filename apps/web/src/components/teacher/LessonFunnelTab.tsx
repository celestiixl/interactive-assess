"use client";

import * as React from "react";
import { ANALYTICS_COLORS } from "@/lib/analyticsData";
import type { LessonRow } from "@/lib/analyticsData";

// ── Colour helper ─────────────────────────────────────────────────────────────

function barColor(pct: number): string {
  if (pct >= 70) return ANALYTICS_COLORS.teal;
  if (pct >= 40) return ANALYTICS_COLORS.amber;
  return ANALYTICS_COLORS.coral;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <li className="flex flex-col gap-1.5 rounded-xl border border-[#1e3f5a] bg-[#1a3148] p-3">
      <div className="h-3 w-2/3 animate-pulse rounded bg-[#213d58]" />
      <div className="h-2 w-full animate-pulse rounded-full bg-[#213d58]" />
    </li>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface LessonFunnelTabProps {
  lessons: LessonRow[];
  loading?: boolean;
}

export function LessonFunnelTab({ lessons, loading }: LessonFunnelTabProps) {
  if (loading) {
    return (
      <ul aria-busy="true" role="list" className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </ul>
    );
  }

  if (lessons.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#9abcb0]">
        No lesson data for the selected filters.
      </p>
    );
  }

  return (
    <ul role="list" className="flex flex-col gap-2">
      {lessons.map((lesson) => {
        const pct =
          lesson.totalStudents > 0
            ? Math.round((lesson.completedCount / lesson.totalStudents) * 100)
            : 0;
        const color = barColor(pct);

        return (
          <li
            key={lesson.slug}
            className="rounded-xl border border-[#1e3f5a] bg-[#1a3148] p-3"
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-[#e8f4f0] leading-snug">
                {lesson.title}
              </span>
              <span className="shrink-0 tabular-nums text-xs text-[#9abcb0]">
                {lesson.completedCount}&thinsp;/&thinsp;{lesson.totalStudents}
              </span>
            </div>
            {/* Progress bar */}
            <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-[#213d58]">
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${lesson.title} completion`}
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${pct}%`,
                  background: color,
                  boxShadow: `0 0 8px ${color}88`,
                }}
              />
            </div>
            <div
              className="mt-1 text-right text-[11px] font-semibold tabular-nums"
              style={{ color }}
            >
              {pct}%
            </div>
          </li>
        );
      })}
    </ul>
  );
}
