"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { getMondayOf } from "@/lib/weeklyDigest";
import type { DigestEntry, WeeklyDigestResult } from "@/lib/weeklyDigest";

// ─── Period options (mock — replace with real period data when available) ──────
const PERIOD_OPTIONS = [
  { value: "", label: "All periods" },
  { value: "1", label: "Period 1" },
  { value: "2", label: "Period 2" },
  { value: "3", label: "Period 3" },
  { value: "4", label: "Period 4" },
  { value: "5", label: "Period 5" },
];

// ─── TEKS filter options ───────────────────────────────────────────────────────
const TEKS_OPTIONS = [
  { value: "", label: "All TEKS" },
  { value: "B.5A", label: "B.5A" },
  { value: "B.5B", label: "B.5B" },
  { value: "B.5C", label: "B.5C" },
  { value: "B.7A", label: "B.7A" },
  { value: "B.7B", label: "B.7B" },
  { value: "B.7C", label: "B.7C" },
  { value: "B.11A", label: "B.11A" },
  { value: "B.11B", label: "B.11B" },
];

// ─── Single entry row ──────────────────────────────────────────────────────────
function EntryRow({ entry }: { entry: DigestEntry }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-4 transition-colors hover:bg-surface-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            aria-label={`Rank ${entry.rank}`}
          >
            {entry.rank}
          </span>
          <Badge
            className="border-transparent bg-teks-rc2 text-white"
            aria-label={`TEKS ${entry.teks}`}
          >
            {entry.teks}
          </Badge>
          <span className="text-xs text-text-muted">{entry.unitTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {entry.selectionCount} selections
          </span>
          <span
            className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300"
            aria-label={`${entry.selectionPct}% of wrong attempts chose this answer`}
          >
            {entry.selectionPct}% chose it
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm font-medium text-text">{entry.questionText}</p>
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
        <span className="font-semibold">Wrong answer: </span>
        {entry.wrongAnswer}
      </p>

      <p className="mt-2 text-sm text-text-muted">
        {entry.misconceptionDescription}
      </p>

      <button
        type="button"
        className="mt-2 text-xs font-semibold text-brand-purple underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? "Hide talking point ↑" : "Show talking point ↓"}
      </button>

      {expanded && (
        <div
          className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
          role="note"
          aria-label="Suggested talking point"
        >
          {entry.talkingPoint}
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function WeeklyDigestPage() {
  const [periodId, setPeriodId] = React.useState("");
  const [teksFilter, setTeksFilter] = React.useState("");
  const [weekOf, setWeekOf] = React.useState(() => getMondayOf(new Date()));

  const [digest, setDigest] = React.useState<WeeklyDigestResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  // Fetch whenever filters change
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    const params = new URLSearchParams({ weekOf, take: "10" });
    if (periodId) params.set("periodId", periodId);

    fetch(`/api/teacher/weekly-digest?${params.toString()}`)
      .then((r) => r.json())
      .then((data: WeeklyDigestResult) => {
        if (cancelled) return;
        if (data.ok) {
          setDigest(data);
        } else {
          setFetchError("Failed to load digest");
        }
      })
      .catch(() => {
        if (!cancelled) setFetchError("Failed to load digest");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [weekOf, periodId]);

  // Apply TEKS filter client-side (no extra round-trip needed)
  const filteredEntries: DigestEntry[] = React.useMemo(() => {
    const entries = digest?.entries ?? [];
    if (!teksFilter) return entries;
    return entries.filter((e) => e.teks === teksFilter);
  }, [digest, teksFilter]);

  const formattedLastUpdated = digest?.lastUpdated
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(digest.lastUpdated))
    : null;

  return (
    <main className="mx-auto w-full max-w-4xl p-6 text-slate-900 dark:text-slate-100">
      {/* Page header */}
      <section className="rounded-3xl border border-border bg-surface-1 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Weekly Teaching Moments</h1>
            <p className="mt-1 text-sm text-text-muted">
              The misconceptions most worth addressing this week — top 10, filterable by
              period and TEKS.
            </p>
          </div>
          <Link
            href="/teacher/learning-analytics"
            className="rounded-xl border border-border bg-surface-1 px-4 py-2 text-sm font-semibold text-text shadow-sm hover:bg-surface-3"
          >
            ← Analytics
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="mt-4 flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-surface-1 p-4 shadow-sm">
        {/* Week picker */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="weekOf"
            className="text-xs font-semibold text-text-muted"
          >
            Week of (Monday)
          </label>
          <input
            id="weekOf"
            type="date"
            value={weekOf}
            onChange={(e) => setWeekOf(e.target.value)}
            className="rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-purple"
            aria-label="Select week starting date"
          />
        </div>

        {/* Period filter */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="periodId"
            className="text-xs font-semibold text-text-muted"
          >
            Class period
          </label>
          <select
            id="periodId"
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            className="rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-purple"
            aria-label="Filter by class period"
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* TEKS filter */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="teksFilter"
            className="text-xs font-semibold text-text-muted"
          >
            TEKS
          </label>
          <select
            id="teksFilter"
            value={teksFilter}
            onChange={(e) => setTeksFilter(e.target.value)}
            className="rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-purple"
            aria-label="Filter by TEKS standard"
          >
            {TEKS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {formattedLastUpdated && (
          <p className="ml-auto self-end text-xs text-text-muted">
            Last updated {formattedLastUpdated}
          </p>
        )}
      </section>

      {/* Summary stat */}
      {digest && !loading && (
        <div className="mt-4 flex flex-wrap gap-3">
          <Card className="flex-1 p-4">
            <div className="text-xs text-text-muted">Total wrong attempts</div>
            <div className="mt-1 text-2xl font-bold">
              {digest.totalWrongAttempts}
            </div>
          </Card>
          <Card className="flex-1 p-4">
            <div className="text-xs text-text-muted">
              Misconceptions surfaced
            </div>
            <div className="mt-1 text-2xl font-bold">
              {filteredEntries.length}
            </div>
          </Card>
        </div>
      )}

      {/* Entry list */}
      <section className="mt-4 flex flex-col gap-3">
        {loading && (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-1 p-5 text-sm text-text-muted">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
            Loading digest…
          </div>
        )}

        {!loading && fetchError && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {fetchError}
          </div>
        )}

        {!loading && !fetchError && filteredEntries.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface-1 p-5 text-sm text-text-muted">
            No misconceptions found for the selected filters.
          </div>
        )}

        {!loading &&
          !fetchError &&
          filteredEntries.map((entry) => (
            <EntryRow key={entry.questionId} entry={entry} />
          ))}
      </section>
    </main>
  );
}
