"use client";

import Link from "next/link";
import { PageContent, Card } from "@/components/ui";

// If these components exist in your repo, keep them.
// If your import paths differ, the build will tell us and we can patch paths next.

export default function TeacherDashboardPage() {
  return (
    <main>
      <PageContent className="py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Teacher Dashboard
              </h1>
              <p className="mt-1 text-slate-600">
                Quick access to your item bank, builder, classes, and insights.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/teacher/item-bank"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                Item Bank
              </Link>

              <Link
                href="/teacher/builder"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Builder
              </Link>
            </div>
          </header>

          {/* KPIs */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3"></section>

          {/* Main content */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Recent Assessments</h2>
                  <p className="mt-1 text-slate-600">
                    Your latest drafts and published assessments.
                  </p>
                </div>

                <Link
                  href="/teacher/assessments"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-50"
                >
                  View All
                </Link>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                <div className="text-slate-600">No assessments yet.</div>

                <div className="mt-5 flex justify-end gap-3">
                  <Link
                    href="/teacher/builder"
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50"
                  >
                    Open
                  </Link>

                  <button
                    type="button"
                    className="rounded-xl border border-slate-300 px-4 py-2 font-semibold opacity-60"
                    title="Hook this up later"
                    disabled
                  >
                    Analytics
                  </button>
                </div>
              </div>
            </Card>

            <div className="grid gap-6">
              <Card className="p-5">
                <h2 className="text-xl font-semibold">My Classes</h2>
                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <div className="text-lg font-semibold">Biology Period —</div>
                  <div className="text-slate-600">Code: BIO-—</div>
                </div>
              </Card>

              <div className="rounded-2xl bg-emerald-700 p-5 text-white shadow-sm">
                <h2 className="text-xl font-semibold">AI Grading Assistant</h2>
                <p className="mt-2 text-emerald-50">
                  You have <span className="font-semibold">—</span> constructed
                  responses waiting for review.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    className="rounded-xl bg-white/15 px-4 py-2 font-semibold hover:bg-white/20"
                    title="Hook this up later"
                    disabled
                  >
                    Open Queue
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </PageContent>
    </main>
  );
}
