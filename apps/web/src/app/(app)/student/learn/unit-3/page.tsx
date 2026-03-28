import Link from "next/link";
import { notFound } from "next/navigation";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { getUnitById } from "@/lib/learningHubContent";
import { BackLink } from "@/components/nav/BackLink";

export default function Unit3PageStub() {
  const unit = getUnitById("unit-3");
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
        </section>

        <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-bs-text">
              Lessons in this Unit
            </h2>
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
                <div className="mt-3">
                  <Link
                    href={`/student/learn/${unit.id}/${lesson.slug}`}
                    className="inline-flex rounded-xl bg-bs-bg px-3 py-2 text-xs font-semibold text-white hover:bg-bs-bg"
                  >
                    Open Lesson
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
