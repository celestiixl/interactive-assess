import Link from "next/link";

const DEFAULT_RC = 'RC1 • Cell Structure & Function';

export default function StudentAssessmentLab() {
  const rc = encodeURIComponent(DEFAULT_RC);

  return (
    <main className="w-full px-6 py-10 min-h-dvh py-8 bg-slate-950 text-slate-100">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assessment Lab</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quick entry points for student-facing practice and interactive item testing.
          </p>
        </div>

        <Link
          href="/teacher/dashboard"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          Back to Teacher Dashboard
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href={`/practice?rc=${rc}`}
          className="group rounded-2xl border p-5 shadow-sm transition hover:bg-muted/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Demo Student Practice Runner</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Opens the student practice runner with a safe default reporting category.
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Default RC: <span className="font-medium text-foreground">{DEFAULT_RC}</span>
              </div>
            </div>
            <div className="text-lg opacity-70 group-hover:opacity-100">→</div>
          </div>
        </Link>

        <Link
          href="/student/assessment/items"
          className="group rounded-2xl border p-5 shadow-sm transition hover:bg-muted/40"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold">Interactive Items Test Screen</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Sandbox screen to verify item rendering, pills, attempts, and check behavior.
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                (We’ll wire real test data next.)
              </div>
            </div>
            <div className="text-lg opacity-70 group-hover:opacity-100">→</div>
          </div>
        </Link>
      </div>
    </main>
  );
}
