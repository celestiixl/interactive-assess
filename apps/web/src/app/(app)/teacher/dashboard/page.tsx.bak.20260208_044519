import ReportingCategoryDonut from "@/components/analytics/ReportingCategoryDonut";
import { REPORTING_CATEGORIES } from "@/lib/reportingCategories";
import Link from "next/link";
import { AppShell } from "@/components/ia/AppShell";

export default function TeacherDashboard() {
  return (
    <AppShell activeKey="teacher"><main className="space-y-6 min-h-dvh">
      
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/student/assessment"
          className="ia-btn text-sm"
        >
          Student Assessment Lab
        </Link>
      </div>
<div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Teacher Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Manage classes, assessments, and view analytics.
            </p>
          </div>

          <a
            href="/teacher/builder"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-white font-semibold shadow-sm hover:bg-emerald-700"
          >
            <span className="text-xl leading-none">＋</span>
            Create Assessment
          </a>
        </div>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Kpi title="Total Students" value="—" sub="+— from last week" />
          <Kpi title="Active Assessments" value="—" sub="— drafts pending" />
          <Kpi title="Class Average" value="—" sub="+— improvement" />
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="ia-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Assessments</h2>
              <a className="text-emerald-700 font-semibold hover:underline" href="/teacher/builder">
                View All
              </a>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">Practice Mode</div>
                  <div className="mt-1 text-slate-600">
                    Jump into the practice runner and test interactive items.
                  </div>

                  <div className="mt-4 flex gap-5 text-sm text-slate-600">
                    <div>Items: —</div>
                    <div>Time: —</div>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                  published
                </span>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <a
                  href="/teacher/builder"
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50"
                >
                  Open
                </a>
                <button
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold opacity-60"
                  title="Hook this up later"
                >
                  Analytics
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="ia-card p-5">
              <h2 className="text-xl font-semibold">My Classes</h2>
              <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                <div className="text-lg font-semibold">Biology Period —</div>
                <div className="text-slate-600">Code: BIO-—</div>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-700 p-5 text-white shadow-sm">
              <h2 className="text-xl font-semibold">AI Grading Assistant</h2>
              <p className="mt-2 text-emerald-50">
                You have <span className="font-semibold">—</span> constructed responses waiting for review.
              </p>
              <button className="mt-5 w-full rounded-xl bg-white/90 px-4 py-3 font-semibold text-emerald-900 hover:bg-white">
                Review Now
              </button>
            </div>
          </div>
        </section>
      </div>
    </main></AppShell>
  );
}

function Kpi({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="ia-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-slate-700 font-semibold">{title}</div>
        <div className="h-8 w-8 rounded-full bg-slate-100" />
      </div>
      <div className="mt-3 text-4xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-slate-600">{sub}</div>
    </div>
  );
}
