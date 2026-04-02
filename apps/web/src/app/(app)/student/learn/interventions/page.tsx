"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildInterventionQueue } from "@/lib/learningInsights";
import { loadLearningProgress } from "@/lib/learningProgress";
import { BackLink } from "@/components/nav/BackLink";

export default function InterventionQueuePage() {
  const progress = useMemo(() => loadLearningProgress(), []);
  const queue = useMemo(() => buildInterventionQueue(progress), [progress]);

  return (
    <main className="mx-auto w-full max-w-5xl p-6 text-bs-text">
      <BackLink href="/student/learn" label="Back to hub" />
      <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Intervention Queue</h1>
          <p className="mt-1 text-sm text-bs-text-sub">
            Priority lessons that need re-teach or targeted support.
          </p>
        </div>
      </section>

      <section className="mt-4 space-y-3">
        {queue.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Great work — no intervention items at the moment.
          </div>
        ) : (
          queue.map((item) => (
            <article
              key={item.lessonId}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                {item.unitTitle}
              </div>
              <h2 className="mt-1 text-base font-semibold text-amber-950">
                {item.lessonTitle}
              </h2>
              <div className="mt-1 inline-flex rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Tier {item.tier} Intervention
              </div>
              <div className="mt-1 text-sm text-amber-900">
                Reason: {item.reason}
              </div>
              <div className="text-sm text-amber-900">
                Recommendation: {item.recommendation}
              </div>
              <div className="mt-3">
                <Link
                  href={item.href}
                  className="rounded-bs bg-bs-bg px-3 py-2 text-xs font-semibold text-white hover:bg-bs-bg"
                >
                  Open Lesson
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
