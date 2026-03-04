import Link from "next/link";
import { notFound } from "next/navigation";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { getLessonBySlug, getUnitById } from "@/lib/learningHubContent";

type LessonPageProps = {
  params: Promise<{ unitId: string; lessonSlug: string }>;
};

export default async function LearningLessonPage({ params }: LessonPageProps) {
  const { unitId, lessonSlug } = await params;
  const unit = getUnitById(unitId);
  if (!unit) notFound();

  const lesson = getLessonBySlug(unit, lessonSlug);
  if (!lesson) notFound();

  const lessonIndex = unit.lessons.findIndex((entry) => entry.id === lesson.id);
  const previousLesson = lessonIndex > 0 ? unit.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < unit.lessons.length - 1
      ? unit.lessons[lessonIndex + 1]
      : null;

  return (
    <main className="ia-vh-page relative min-h-dvh px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <div className="mx-auto grid w-full max-w-4xl gap-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            {unit.title}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {lesson.title}
          </h1>
          <div className="mt-2 text-sm text-slate-600">
            {lesson.type} • {lesson.minutes} min
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {lesson.summary}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {lesson.keyTerms.map((term) => (
              <span
                key={term}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {term}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-5">
            {lesson.sections.map((section) => (
              <article key={section.heading}>
                <h2 className="text-lg font-semibold text-slate-900">
                  {section.heading}
                </h2>
                <div className="mt-2 space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-6 text-slate-700"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Link
                href="/student/learn"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hub
              </Link>
              <Link
                href={`/student/learn/${unit.id}`}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Unit
              </Link>
            </div>

            <div className="flex gap-2">
              {previousLesson ? (
                <Link
                  href={`/student/learn/${unit.id}/${previousLesson.slug}`}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Previous
                </Link>
              ) : null}
              {nextLesson ? (
                <Link
                  href={`/student/learn/${unit.id}/${nextLesson.slug}`}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Next →
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <StudentFloatingDock />
      <ThemeToggle />
    </main>
  );
}
