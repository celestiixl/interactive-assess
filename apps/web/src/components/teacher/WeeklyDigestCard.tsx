"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Badge, Button } from "@/components/ui";
import type { DigestEntry } from "@/lib/weeklyDigest";

// ─── Types ────────────────────────────────────────────────────────────────────

type DigestCardProps = {
  /** Limit entries shown; defaults to 3 for the dashboard card */
  take?: number;
  /** When true, shows the "View full digest" footer link */
  showFooter?: boolean;
};

// ─── Single misconception row ─────────────────────────────────────────────────

function EntryRow({ entry }: { entry: DigestEntry }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-4 transition-colors hover:bg-surface-3">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
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
        <span
          className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300"
          aria-label={`${entry.selectionPct}% of wrong attempts chose this answer`}
        >
          {entry.selectionPct}% chose it
        </span>
      </div>

      {/* Question + wrong answer */}
      <p className="mt-3 text-sm font-medium text-text">{entry.questionText}</p>
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
        <span className="font-semibold">Wrong answer: </span>
        {entry.wrongAnswer}
      </p>

      {/* Misconception description */}
      <p className="mt-2 text-sm text-text-muted">
        {entry.misconceptionDescription}
      </p>

      {/* Talking point — toggleable */}
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

// ─── Weekly Digest Card ───────────────────────────────────────────────────────

export default function WeeklyDigestCard({
  take = 3,
  showFooter = true,
}: DigestCardProps) {
  const [entries, setEntries] = React.useState<DigestEntry[]>([]);
  const [weekOf, setWeekOf] = React.useState<string>("");
  const [lastUpdated, setLastUpdated] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/teacher/weekly-digest?take=${take}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setEntries(data.entries ?? []);
          setWeekOf(data.weekOf ?? "");
          setLastUpdated(data.lastUpdated ?? "");
        } else {
          setError(data.error ?? "Failed to load digest");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load digest");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [take]);

  const formattedDate = lastUpdated
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(lastUpdated))
    : null;

  return (
    <Card variant="accent" accentColor="orange" className="p-5">
      {/* Card header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-text">
            Worth five minutes this week
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Top misconceptions to address before next class
          </p>
        </div>
        {weekOf && (
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-text-muted">
            Week of {weekOf}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="mt-4 flex flex-col gap-3">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-purple border-t-transparent" />
            Loading digest…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && entries.length === 0 && (
          <div className="text-sm text-text-muted">
            No wrong-answer data yet this week.
          </div>
        )}

        {!loading &&
          !error &&
          entries.map((entry) => <EntryRow key={entry.questionId} entry={entry} />)}
      </div>

      {/* Footer */}
      {showFooter && !loading && !error && entries.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          {formattedDate && (
            <span className="text-xs text-text-muted">
              Last updated {formattedDate}
            </span>
          )}
          <Link href="/teacher/learning-analytics/weekly-digest">
            <Button variant="secondary" size="sm">
              Full digest →
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
