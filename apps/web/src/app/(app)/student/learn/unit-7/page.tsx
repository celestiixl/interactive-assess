import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { getUnitById } from "@/lib/learningHubContent";
import { BackLink } from "@/components/nav/BackLink";

export default function Unit7Page() {
  const unit = getUnitById("unit-7");
  if (!unit) notFound();

  return (
    <main className="ia-vh-page relative min-h-dvh px-3 py-3 text-bs-text sm:px-4 sm:py-4">
      <BackLink href="/student/learn" label="Back to hub" />
      <div className="mx-auto grid w-full max-w-5xl gap-3">
        <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Grading Period {unit.gradingPeriod}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-bs-text">
            Unit {unit.unitNumber}: {unit.title}
          </h1>
          <p className="mt-2 text-sm text-bs-text-sub">
            Objective: {unit.objective}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-bs-text-sub">
            {unit.instructionalDays ? (
              <span className="rounded-full border border-[var(--bs-border)] bg-[var(--bs-raised)] px-2 py-0.5">
                {unit.instructionalDays} instructional days
              </span>
            ) : null}
            {unit.dateRange ? (
              <span className="rounded-full border border-[var(--bs-border)] bg-[var(--bs-raised)] px-2 py-0.5">
                {unit.dateRange}
              </span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {unit.teks.map((teks) => (
              <span
                key={teks}
                className="rounded-full border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-1 text-xs font-semibold text-bs-text-sub"
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

        <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-bs-text">
              Lessons in this Unit
            </h2>
            <p className="mt-1 text-sm text-bs-text-sub">
              {unit.lessons.length} lessons • Work through them in order.
            </p>
          </div>

          <div className="space-y-3">
            {unit.lessons.map((lesson, index) => (
              <article
                key={lesson.id}
                className="rounded-2xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-4"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                  Lesson {index + 1} • {lesson.type} • {lesson.minutes} min
                </div>
                <h3 className="mt-1 text-base font-semibold text-bs-text">
                  {lesson.title}
                </h3>
                <p className="mt-1 text-sm text-bs-text-sub">{lesson.summary}</p>
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
                    className="inline-flex rounded-xl bg-bs-bg px-3 py-2 text-xs font-semibold text-white hover:bg-bs-bg"
                  >
                    Open Lesson →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Supplemental resources kept for backward compatibility */}
        <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-bs-text">
            Supplemental Resources
          </h2>
          <div className="space-y-3">
            <article className="rounded-2xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                Phenomenon • 12 min
              </div>
              <h3 className="mt-1 text-base font-semibold text-bs-text">
                Plant Systems B.12B — Buffalo Bayou Phenomenon
              </h3>
              <p className="mt-1 text-sm text-bs-text-sub">
                Explore a Buffalo Bayou flooding scenario and identify how plant
                systems depend on each other.
              </p>
              <div className="mt-3">
                <Link
                  href="/student/learn/unit-7/plant-systems-b12b-phenomenon"
                  className="inline-flex rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-xs font-semibold text-bs-text-sub hover:bg-[var(--bs-raised)]"
                >
                  Open Phenomenon →
                </Link>
              </div>
            </article>

            <article className="rounded-2xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                Simulation • 20 min
              </div>
              <h3 className="mt-1 text-base font-semibold text-bs-text">
                Bottle Ecosystem Cycles Lab
              </h3>
              <p className="mt-1 text-sm text-bs-text-sub">
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
                  className="inline-flex rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-xs font-semibold text-bs-text-sub hover:bg-[var(--bs-raised)]"
                >
                  Open Simulation →
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>

      <ThemeToggle />
    </main>
  );
}
