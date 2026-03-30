"use client";

import type { TexasPhenomenon } from "@/lib/texasPhenomena";

type PhenomenonBannerProps = {
  phenomenon: TexasPhenomenon;
};

/**
 * PhenomenonBanner
 *
 * Displays a Texas real-world phenomenon anchor at the beginning of a lesson.
 * The banner surfaces the observable event, its Texas location, and the
 * driving question students will answer by completing the lesson.
 */
export default function PhenomenonBanner({ phenomenon }: PhenomenonBannerProps) {
  return (
    <section
      aria-label="Texas Real-World Phenomenon"
      className="rounded-3xl border border-emerald-200 bg-[rgba(74,222,128,0.06)] p-5 shadow-sm dark:border-emerald-800 dark:bg-emerald-950"
    >
      <div className="mb-3 flex items-center gap-2">
        <span aria-hidden="true" className="text-2xl">
          {phenomenon.icon}
        </span>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Texas Phenomenon · {phenomenon.location}
          </div>
          <h2 className="text-lg font-bold text-[#4ade80] dark:text-emerald-100">
            {phenomenon.title}
          </h2>
        </div>
      </div>

      <p className="text-sm leading-7 text-[#4ade80] dark:text-emerald-200">
        {phenomenon.description}
      </p>

      {phenomenon.funFact ? (
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-bs-surface px-4 py-3 dark:border-emerald-700 dark:bg-emerald-900">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Did You Know?
          </span>
          <span className="text-xs leading-6 text-[#4ade80] dark:text-emerald-300">
            {phenomenon.funFact}
          </span>
        </div>
      ) : null}

      <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 dark:border-emerald-700 dark:bg-emerald-900">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          Driving Question
        </div>
        <p className="text-sm font-semibold italic leading-6 text-[#4ade80] dark:text-emerald-100">
          &ldquo;{phenomenon.drivingQuestion}&rdquo;
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {phenomenon.teks.map((code) => (
          <span
            key={code}
            className="rounded-full border border-emerald-300 bg-bs-surface px-3 py-1 text-xs font-semibold text-[#4ade80] dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
          >
            {code}
          </span>
        ))}
      </div>
    </section>
  );
}
