import { LEARNING_UNITS } from "@/lib/learningHubContent";
import { BackLink } from "@/components/nav/BackLink";

export default function TeacherContentQualityPage() {
  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-bs-text">
      <BackLink href="/teacher/dashboard" label="Back to dashboard" />
      <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Content Quality Workflow</h1>
          <p className="mt-1 text-sm text-bs-text-sub">
            Track versions, approval status, and curriculum change logs.
          </p>
        </div>
      </section>

      <section className="mt-4 space-y-3">
        {LEARNING_UNITS.map((unit) => (
          <article
            key={unit.id}
            className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">
                  GP {unit.gradingPeriod} • Unit {unit.unitNumber}
                </div>
                <h2 className="mt-1 text-lg font-semibold text-bs-text">
                  {unit.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[var(--bs-border)] bg-bs-surface px-2 py-0.5 text-xs font-semibold text-bs-text-sub">
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
            </div>
            <div className="mt-3 space-y-2">
              {unit.changeLog.map((row) => (
                <div
                  key={`${unit.id}-${row.date}-${row.note}`}
                  className="rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-sm text-bs-text-sub"
                >
                  <span className="font-semibold">{row.date}</span> — {row.note}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
