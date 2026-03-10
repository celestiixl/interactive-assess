"use client";

export default function PlantSystemsB12BPhenomenon() {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-950">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Unit 7 Phenomenon
          </div>
          <h2 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
            Buffalo Bayou Flooding and Plant System Stress
          </h2>
          <p className="mt-1 text-sm text-emerald-900/80 dark:text-emerald-200/80">
            Observe how flooding conditions can disrupt transport, reproduction,
            and response systems in plants.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            B.12B
          </span>
          <span className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            Priority TEKS
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-black dark:border-emerald-800">
        <iframe
          src="/phenomena/buffalo-bayou-harvey-ecosystem-lab.html"
          title="Buffalo Bayou Plant Systems Phenomenon"
          className="block h-[560px] w-full"
          style={{ border: "none" }}
        />
      </div>

      <div className="mt-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
        Driving Question: How do transport, reproduction, and response systems
        interact to help plants survive when environmental conditions rapidly
        change?
      </div>
    </section>
  );
}
