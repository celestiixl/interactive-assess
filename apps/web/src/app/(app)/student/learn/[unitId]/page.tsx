import Link from "next/link";
import { notFound } from "next/navigation";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { getUnitById } from "@/lib/learningHubContent";

type UnitPageProps = {
  params: Promise<{ unitId: string }>;
};

export default async function LearningUnitPage({ params }: UnitPageProps) {
  const { unitId } = await params;
  const unit = getUnitById(unitId);

  if (!unit) notFound();

  return (
    <main className="ia-vh-page relative min-h-dvh px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
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
            {unit.concepts ? (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
                {unit.concepts} concepts
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700">
              {unit.contentVersion}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                unit.approvalStatus === "approved"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {unit.approvalStatus}
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-600">
            {unit.lessons.length} lessons in this chapter
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
          </div>
        </section>

        {unit.lessons.some((lesson) => lesson.vocabularyTiers) ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Vocabulary</h2>
            <p className="mt-1 text-sm text-slate-600">
              Everyday → Academic → Content Specific
            </p>
            <div className="mt-3 space-y-3">
              {unit.lessons
                .filter((lesson) => lesson.vocabularyTiers)
                .map((lesson) => (
                  <article
                    key={`${lesson.id}-vocab`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {lesson.title}
                    </div>
                    <div className="mt-2 grid gap-3 md:grid-cols-3">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Everyday
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {lesson.vocabularyTiers?.everyday.map((word) => (
                            <span
                              key={`${lesson.id}-e-${word}`}
                              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Academic
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {lesson.vocabularyTiers?.academic.map((word) => (
                            <span
                              key={`${lesson.id}-a-${word}`}
                              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Content Specific
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {lesson.vocabularyTiers?.contentSpecific.map(
                            (word) => (
                              <span
                                key={`${lesson.id}-c-${word}`}
                                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                              >
                                {word}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ) : null}

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
      </div>

      <StudentFloatingDock />
      <ThemeToggle />
    </main>
  );
}
