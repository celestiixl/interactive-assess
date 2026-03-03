"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageContent, PageBanner, Card } from "@/components/ui";
import {
  formatNextReview,
  getReviewQueue,
  updateRecord,
} from "@/lib/spacedRepetition";

type TeksItem = {
  id: string;
  label: string;
};

const TEKS_ITEMS: TeksItem[] = [
  { id: "BIO.5A", label: "Biomolecules" },
  { id: "BIO.5C", label: "Transport & homeostasis" },
  { id: "BIO.6A", label: "Cell cycle & DNA replication" },
  { id: "BIO.6C", label: "Cell cycle disruption & cancer" },
  { id: "BIO.7B", label: "Protein synthesis" },
  { id: "BIO.8B", label: "Genetic crosses" },
  { id: "BIO.11A", label: "Photosynthesis & respiration" },
  { id: "BIO.13C", label: "Carbon & nitrogen cycles" },
];

export default function StudentLearningHubPage() {
  const [version, setVersion] = useState(0);

  const queue = useMemo(
    () => getReviewQueue(TEKS_ITEMS.map((t) => t.id)),
    [version],
  );

  const dueItems = queue.filter((q) => q.neverReviewed || q.daysOverdue > 0);
  const firstDue = dueItems[0];

  function markReview(teksId: string, quality: number) {
    updateRecord(teksId, quality);
    setVersion((v) => v + 1);
  }

  return (
    <main className="text-slate-900">
      <PageBanner
        title="Learning Hub"
        subtitle="Spaced-repetition review queue based on your last performance."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/student/dashboard"
            className="rounded-2xl bg-white/20 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/25"
          >
            Dashboard
          </Link>
          <Link
            href="/student/assignments"
            className="rounded-2xl bg-white/20 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/25"
          >
            My Assignments
          </Link>
        </div>
      </PageBanner>

      <PageContent className="py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card variant="sm">
            <div className="text-sm font-semibold text-slate-800">Due now</div>
            <div className="mt-2 text-2xl font-bold">{dueItems.length}</div>
            <div className="mt-1 text-xs text-slate-600">
              TEKS standards ready for review
            </div>
          </Card>
          <Card variant="sm">
            <div className="text-sm font-semibold text-slate-800">
              Tracked TEKS
            </div>
            <div className="mt-2 text-2xl font-bold">{TEKS_ITEMS.length}</div>
            <div className="mt-1 text-xs text-slate-600">
              Loaded into this learning queue
            </div>
          </Card>
          <Card variant="sm">
            <div className="text-sm font-semibold text-slate-800">
              Next practice
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-900">
              {firstDue ? firstDue.teksId : "No due topics"}
            </div>
            <div className="mt-3">
              <Link
                href={
                  firstDue
                    ? `/practice?focus=${encodeURIComponent(firstDue.teksId)}`
                    : "/practice"
                }
                className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Start review
              </Link>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <div className="text-sm font-semibold text-slate-900">
              Review queue
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Simulate outcomes to update SM-2 spacing immediately.
            </div>

            <div className="mt-4 grid gap-3">
              {queue.map((q) => {
                const teks = TEKS_ITEMS.find((t) => t.id === q.teksId);
                return (
                  <div
                    key={q.teksId}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {q.teksId} • {teks?.label ?? "TEKS topic"}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {q.neverReviewed
                            ? "Never reviewed"
                            : formatNextReview(q.nextReviewAt)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => markReview(q.teksId, 2)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Struggled (2)
                        </button>
                        <button
                          type="button"
                          onClick={() => markReview(q.teksId, 4)}
                          className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                          Got it (4)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </PageContent>
    </main>
  );
}
