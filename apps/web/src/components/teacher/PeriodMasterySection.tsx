"use client";

import * as React from "react";
import { usePeriodMastery } from "@/hooks/usePeriodMastery";
import { PeriodMasteryHeatmap } from "@/components/teacher/PeriodMasteryHeatmap";
import type { PeriodMasterySnapshot } from "@/types/period-mastery";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function HeatmapSkeleton() {
  return (
    <div
      className="rounded-2xl border border-[#1e3f5a] bg-[#132638] p-4"
      aria-busy="true"
      aria-label="Loading mastery data…"
    >
      {/* Fake header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="h-4 w-36 animate-pulse rounded-md bg-[#1a3148]" />
        <div className="h-4 w-20 animate-pulse rounded-full bg-[#1a3148]" />
      </div>
      {/* 3 fake rows */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="mt-2 h-8 animate-pulse rounded-lg bg-[#1a3148]" />
      ))}
    </div>
  );
}

// ─── Period selector pill ─────────────────────────────────────────────────────

function PeriodPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa]"
      style={{
        backgroundColor: active ? "#00d4aa" : "#132638",
        borderColor: active ? "#00d4aa" : "#1e3f5a",
        color: active ? "#0d1e2c" : "#9abcb0",
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

// ─── PeriodMasterySection ────────────────────────────────────────────────────

/**
 * Standalone "use client" section that renders the Period Mastery Snapshot
 * panel on the teacher dashboard.
 *
 * - Fetches all periods once on mount via usePeriodMastery()
 * - Provides an "All Periods" selector + one pill per period
 * - Client-side filters the visible heatmaps based on the active selection
 * - Shows a loading skeleton (3 animated rows) while fetching
 * - Shows an inline error message on failure — never crashes the page
 */
export default function PeriodMasterySection() {
  // Always fetch all periods; we filter locally so we avoid extra network trips
  // when switching between period pills.
  const { snapshots, loading, error } = usePeriodMastery();

  // "all" means every period is shown; anything else is a specific periodId.
  const [selectedPeriodId, setSelectedPeriodId] = React.useState<string>("all");

  // Derive the visible subset.  If all periods have loaded and the user has
  // previously selected a period that no longer exists, fall back to "all".
  const visibleSnapshots = React.useMemo((): PeriodMasterySnapshot[] => {
    if (selectedPeriodId === "all") return snapshots;
    const match = snapshots.find((s) => s.periodId === selectedPeriodId);
    if (!match) return snapshots; // graceful fallback
    return [match];
  }, [snapshots, selectedPeriodId]);

  return (
    <section aria-labelledby="period-mastery-heading" className="mt-0">
      {/* ── Section heading ──────────────────────────────────────────────── */}
      <div className="mb-4">
        <h2
          id="period-mastery-heading"
          className="font-sans text-lg font-bold text-[#e8f4f0]"
        >
          Period Mastery Snapshot
        </h2>
        <p className="mt-0.5 text-sm text-[#9abcb0]">
          Average TEKS mastery by class period
        </p>
      </div>

      {/* ── Period selector pills ─────────────────────────────────────────── */}
      {!loading && !error && snapshots.length > 0 && (
        <div
          className="mb-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by class period"
        >
          <PeriodPill
            label="All Periods"
            active={selectedPeriodId === "all"}
            onClick={() => setSelectedPeriodId("all")}
          />
          {snapshots.map((s) => (
            <PeriodPill
              key={s.periodId}
              label={s.periodLabel}
              active={selectedPeriodId === s.periodId}
              onClick={() => setSelectedPeriodId(s.periodId)}
            />
          ))}
        </div>
      )}

      {/* ── Loading state ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col gap-4">
          <HeatmapSkeleton />
        </div>
      )}

      {/* ── Error state ───────────────────────────────────────────────────── */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-2xl border border-[#1e3f5a] bg-[#132638] px-4 py-3 text-sm text-[#ff6b6b]"
        >
          <span className="font-semibold">Could not load mastery data.</span>{" "}
          {error}
        </div>
      )}

      {/* ── Heatmaps ──────────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {visibleSnapshots.length === 0 ? (
            <p className="text-sm text-[#9abcb0]">No period data available.</p>
          ) : (
            visibleSnapshots.map((snapshot) => (
              <PeriodMasteryHeatmap key={snapshot.periodId} snapshot={snapshot} />
            ))
          )}
        </div>
      )}
    </section>
  );
}
