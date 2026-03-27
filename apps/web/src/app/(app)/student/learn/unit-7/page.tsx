import Link from "next/link";
import { notFound } from "next/navigation";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { getUnitById } from "@/lib/learningHubContent";
import { BackLink } from "@/components/nav/BackLink";

export default function Unit7Page() {
  const unit = getUnitById("unit-7");
  if (!unit) notFound();

  return (
    <main className="ia-vh-page relative min-h-dvh px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <BackLink href="/student/learn" label="Back to hub" />
      <div className="mx-auto grid w-full max-w-5xl gap-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Grading Period {unit.gradingPeriod}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Unit {unit.unitNumber}: {unit.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Objective: {unit.objective}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
            {unit.instructionalDays ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
                {unit.instructionalDays} instructional days
              </span>
            ) : null}
            {unit.dateRange ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
                {unit.dateRange}
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {unit.teks.map((teks) => (
              <span
                key={teks}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {teks}
              </span>
            ))}
            {unit.priorityTeks.map((teks) => (
              <span
                key={`priority-${teks}`}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
              >
                {teks} ★ Priority
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Lessons in this Unit
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {unit.lessons.length} lessons • Work through them in order.
            </p>
          </div>

          <div className="space-y-3">
            {unit.lessons.map((lesson, index) => (
              <article
                key={lesson.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Lesson {index + 1} • {lesson.type} • {lesson.minutes} min
                </div>
                <h3 className="mt-1 text-base font-semibold text-slate-900">
                  {lesson.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{lesson.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {lesson.teks?.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-3">
                  <Link
                    href={`/student/learn/${unit.id}/${lesson.slug}`}
                    className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Open Lesson →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Supplemental resources kept for backward compatibility */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Supplemental Resources
          </h2>
          <div className="space-y-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phenomenon • 12 min
              </div>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                Plant Systems B.12B — Buffalo Bayou Phenomenon
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Explore a Buffalo Bayou flooding scenario and identify how plant
                systems depend on each other.
              </p>
              <div className="mt-3">
                <Link
                  href="/student/learn/unit-7/plant-systems-b12b-phenomenon"
                  className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Open Phenomenon →
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Simulation • 20 min
              </div>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                Bottle Ecosystem Cycles Lab
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Build a sealed bottle ecosystem and observe how water, carbon,
                and nitrogen cycle through the system.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  B.12A
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  B.12B
                </span>
              </div>
              <div className="mt-3">
                <Link
                  href="/student/learn/simulations/bottle-ecosystem-cycles"
                  className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
