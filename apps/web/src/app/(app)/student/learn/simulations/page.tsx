import Link from "next/link";

const SIMULATIONS = [
  {
    slug: "bottle-ecosystem-cycles",
    title: "Bottle Ecosystem Cycles Lab",
    description:
      "Build a sealed bottle ecosystem and observe how water, carbon, and nitrogen cycle through the system. Predict outcomes and complete a CER reflection.",
    teks: ["B.12A", "B.12B"],
    duration: "20 min",
    icon: "🍶",
  },
  {
    slug: "population-genetics",
    title: "Population Genetics Simulator",
    description:
      "Explore Hardy-Weinberg equilibrium, genetic drift, natural selection, and population bottlenecks through interactive graphs.",
    teks: ["B.6A", "B.6B"],
    duration: "15 min",
    icon: "🧬",
  },
  {
    slug: "ecological-succession",
    title: "Ecological Succession",
    description:
      "Step through primary and secondary succession scenarios and observe how ecosystems recover and change over time.",
    teks: ["B.6D"],
    duration: "15 min",
    icon: "🌿",
  },
  {
    slug: "genome-browser",
    title: "Genome Browser",
    description:
      "Explore gene sequences, annotations, and chromosomal regions",
    teks: ["B.7A", "B.7C"],
    duration: "15 min",
    icon: "🧬",
  },
];

export default function SimulationsPage() {
  return (
    <main className="min-h-screen bg-bs-surface pb-28 dark:bg-[#0d1117]">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-bs-text dark:text-slate-100">
          🔬 Simulations
        </h1>
        <p className="mt-1 text-sm text-bs-text-sub dark:text-slate-400">
          Interactive labs and simulations aligned to FBISD Biology TEKS.
        </p>

        <div className="mt-8 grid gap-4">
          {SIMULATIONS.map((sim) => (
            <article
              key={sim.slug}
              className="rounded-2xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-5 dark:border-[#1e3a52] dark:bg-[#0f1e2c]"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl" aria-hidden>
                  {sim.icon}
                </span>
                <div className="flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub dark:text-slate-400">
                    Simulation • {sim.duration}
                  </div>
                  <h2 className="mt-0.5 text-base font-semibold text-bs-text dark:text-slate-100">
                    {sim.title}
                  </h2>
                  <p className="mt-1 text-sm text-bs-text-sub dark:text-slate-400">
                    {sim.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sim.teks.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Link
                      href={`/student/learn/simulations/${sim.slug}`}
                      className="inline-flex rounded-bs bg-bs-bg px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 dark:bg-[#00d4aa] dark:text-[#0d1117] dark:hover:bg-[#00bfa0]"
                    >
                      Open Simulation →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

    </main>
  );
}
