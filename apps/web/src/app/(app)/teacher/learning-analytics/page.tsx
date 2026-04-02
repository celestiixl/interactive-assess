"use client";

import * as React from "react";
import Link from "next/link";
import { BackLink } from "@/components/nav/BackLink";
import { TabGroup } from "@/components/ui";
import StatCard from "@/components/ui/StatCard";
import { LEARNING_UNITS } from "@/lib/learningHubContent";
import { buildAnalyticsSummary } from "@/lib/analyticsData";
import type { AnalyticsSummary } from "@/lib/analyticsData";
import { LessonFunnelTab } from "@/components/teacher/LessonFunnelTab";
import { StuckPointsTab } from "@/components/teacher/StuckPointsTab";
import { TeksBreakdownTab } from "@/components/teacher/TeksBreakdownTab";

// ── Types ─────────────────────────────────────────────────────────────────────

type TabId = "funnel" | "stuck" | "teks";

const TABS: Array<{ value: TabId; label: string; description: string }> = [
  { value: "funnel", label: "Lesson Funnel",   description: "Completion by lesson" },
  { value: "stuck",  label: "Stuck Points",    description: "Below mastery threshold" },
  { value: "teks",   label: "TEKS Breakdown",  description: "Per-standard class avg" },
];

const PERIOD_OPTIONS = [
  { value: "all",      label: "All Periods" },
  { value: "period-1", label: "Period 1" },
  { value: "period-2", label: "Period 2" },
  { value: "period-3", label: "Period 3" },
  { value: "period-4", label: "Period 4" },
  { value: "period-5", label: "Period 5" },
];

// ── Shared select styling ────────────────────────────────────────────────────

const selectClass =
  "rounded-bs border border-[#1e3f5a] bg-[#132638] px-3 py-1.5 text-sm " +
  "text-[#e8f4f0] focus:outline-none focus:ring-2 focus:ring-[#00d4aa]/50 " +
  "cursor-pointer";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TeacherLearningAnalyticsPage() {
  const [unit, setUnit]     = React.useState<string>("all");
  const [period, setPeriod] = React.useState<string>("all");
  const [tab, setTab]       = React.useState<TabId>("funnel");
  const [data, setData]     = React.useState<AnalyticsSummary | null>(null);

  // Recompute analytics whenever filters change.
  // useEffect (not lazy useState init) per repo convention for client-side
  // data reads — keeps SSR hydration safe.
  // TODO: replace buildAnalyticsSummary() with an async fetch to
  //   /api/mastery?unitId=...&period=... when the API supports period rollups.
  //   Add error handling and an AbortController to cancel in-flight requests
  //   when filters change quickly.
  React.useEffect(() => {
    setData(buildAnalyticsSummary(unit, period));
  }, [unit, period]);

  const loading = data === null;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 p-6">
      {/* ── Back link ──────────────────────────────────────────────────────── */}
      <BackLink href="/teacher/dashboard" label="Back to dashboard" />

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-[#1e3f5a] bg-[#132638] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#e8f4f0]">
              Learning Analytics
            </h1>
            <p className="mt-1 text-sm text-[#9abcb0]">
              Lesson funnel, stuck-point analysis, and TEKS mastery breakdown.
            </p>
          </div>
          <Link
            href="/teacher/learning-analytics/weekly-digest"
            className="rounded-bs border border-[#f5a623]/40 bg-[#f5a623]/10 px-4 py-2 text-sm font-semibold text-[#f5a623] transition hover:bg-[#f5a623]/20"
          >
            Weekly Digest →
          </Link>
        </div>

        {/* ── Filters row ──────────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-[#9abcb0]">
            <span className="font-semibold">Unit</span>
            <select
              aria-label="Filter by unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={selectClass}
            >
              <option value="all">All Units</option>
              {LEARNING_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-[#9abcb0]">
            <span className="font-semibold">Period</span>
            <select
              aria-label="Filter by period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className={selectClass}
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* ── Metric cards ───────────────────────────────────────────────────── */}
      <section
        className="grid gap-3 sm:grid-cols-2 md:grid-cols-4"
        aria-label="Summary metrics"
      >
        <StatCard
          label="Avg Mastery"
          value={loading ? "—" : `${data.avgMastery}%`}
        />
        <StatCard
          label="Lessons on Track"
          value={
            loading
              ? "—"
              : `${data.lessonsComplete} / ${data.lessons.length}`
          }
        />
        <StatCard
          label="Tier 2 Students"
          value={loading ? "—" : data.tier2Count}
        />
        <StatCard
          label="Tier 3 Students"
          value={loading ? "—" : data.tier3Count}
        />
      </section>

      {/* ── Tab bar ────────────────────────────────────────────────────────── */}
      <TabGroup<TabId>
        value={tab}
        onValueChange={setTab}
        items={TABS}
        className="md:grid-cols-3"
      />

      {/* ── Tab content panel ──────────────────────────────────────────────── */}
      <section
        className="rounded-2xl border border-[#1e3f5a] bg-[#132638] p-5"
        aria-busy={loading}
        aria-live="polite"
      >
        {tab === "funnel" && (
          <LessonFunnelTab
            lessons={data?.lessons ?? []}
            loading={loading}
          />
        )}
        {tab === "stuck" && (
          <StuckPointsTab
            students={data?.students ?? []}
            loading={loading}
          />
        )}
        {tab === "teks" && (
          <TeksBreakdownTab
            teksMap={data?.teksMap ?? []}
            loading={loading}
          />
        )}
      </section>
    </main>
  );
}

