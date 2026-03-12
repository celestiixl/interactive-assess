"use client";

import { useEffect, useState } from "react";
import type { PeriodMasterySnapshot } from "@/types/period-mastery";

// ─── Return type ──────────────────────────────────────────────────────────────

export interface UsePeriodMasteryResult {
  snapshots: PeriodMasterySnapshot[];
  loading: boolean;
  error: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches period mastery snapshots from GET /api/teacher/period-mastery.
 *
 * @param periodId — optional period filter; when omitted all periods are returned.
 *
 * The hook automatically re-fetches whenever `periodId` changes.
 * Fetch errors are captured as an `error` string; the hook never throws.
 */
export function usePeriodMastery(periodId?: string): UsePeriodMasteryResult {
  const [snapshots, setSnapshots] = useState<PeriodMasterySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (periodId) params.set("periodId", periodId);
    const qs = params.toString();
    const url = `/api/teacher/period-mastery${qs ? `?${qs}` : ""}`;

    fetch(url)
      .then((r) => r.json())
      .then((data: { ok?: boolean; snapshots?: PeriodMasterySnapshot[]; error?: string }) => {
        if (cancelled) return;
        if (data.ok) {
          setSnapshots(data.snapshots ?? []);
        } else {
          setError(data.error ?? "Failed to load period mastery data");
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(
          e instanceof Error
            ? e.message
            : "Failed to load period mastery data",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [periodId]);

  return { snapshots, loading, error };
}
