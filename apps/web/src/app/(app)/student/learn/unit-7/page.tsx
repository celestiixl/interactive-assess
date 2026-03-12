import Link from "next/link";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import ThemeToggle from "@/components/ia/ThemeToggle";

export default function Unit7Page() {
  return (
    <main className="ia-vh-page relative min-h-dvh px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <div className="mx-auto grid w-full max-w-5xl gap-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Grading Period 2
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Unit 7: Processes in Plants
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Explain how interactions among plant transport, reproduction, and
            response systems are facilitated by their structures.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              B.12B
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Priority TEKS
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              9 instructional days
            </span>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Lessons in this Unit
            </h2>
            <Link
              href="/student/learn"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Hub
            </Link>
          </div>

          <div className="space-y-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lesson 1 • Phenomenon • 12 min
              </div>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                Plant Systems B.12B Phenomenon
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Explore a Buffalo Bayou flooding scenario and identify how plant
                systems depend on each other.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  B.12B
                </span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-800">
                  Phenomenon
                </span>
              </div>
              <div className="mt-3">
                <Link
                  href="/student/learn/unit-7/plant-systems-b12b-phenomenon"
                  className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Open Lesson →
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lesson 2 • Reading • 18 min
              </div>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                Plant Systems Standalone Lesson
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Complete the interactive B.12B lesson on transport,
                reproduction, response, and system integration.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  B.12B
                </span>
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-800">
                  Standalone Lesson
                </span>
              </div>
              <div className="mt-3">
                <Link
                  href="/student/learn/unit-7/plant-systems-b12b"
                  className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Open Lesson →
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lesson 3 • Simulation • 20 min
              </div>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                Bottle Ecosystem Cycles Lab
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Build a sealed bottle ecosystem and observe how water, carbon,
                and nitrogen cycle through the system. Predict outcomes and
                complete a CER reflection.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  B.12A
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  B.12B
                </span>
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[11px] font-semibold text-cyan-800">
                  Simulation
                </span>
              </div>
              <div className="mt-3">
                <Link
                  href="/student/learn/simulations/bottle-ecosystem-cycles"
                  className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Open Simulation →
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>

      <StudentFloatingDock />
      <ThemeToggle />
    </main>
  );
}
