"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContent, PageBanner, Card, Button } from "@/components/ui";
import WeeklyDigestCard from "@/components/teacher/WeeklyDigestCard";

// If these components exist in your repo, keep them.
// If your import paths differ, the build will tell us and we can patch paths next.

export default function TeacherDashboardPage() {
  const router = useRouter();

  return (
    <main>
      <PageBanner
        title="Teacher Dashboard"
        subtitle="Quick access to your item bank, builder, classes, and insights."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => router.push("/teacher/item-bank")}
          >
            Item Bank
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/teacher/builder")}
          >
            Builder
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push("/simulations")}
            aria-label="Open simulations"
          >
            Simulations
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => router.push("/phenomena-studio")}
            aria-label="Open phenomenon exploration"
          >
            SparkScope
          </Button>
        </div>
      </PageBanner>
      <PageContent className="py-8">
        <div className="flex flex-col gap-6">
          {/* Weekly Digest — top misconceptions for the week */}
          <WeeklyDigestCard take={3} showFooter />

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

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push("/teacher/assessments")}
                >
                  View All
                </Button>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                <div className="text-slate-600">No assessments yet.</div>

                <div className="mt-5 flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => router.push("/teacher/builder")}
                  >
                    Open
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => router.push("/teacher/learning-analytics")}
                  >
                    Analytics
                  </Button>
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

              <Card
                variant="accent"
                accentColor="green"
                className="p-5"
                animate
              >
                <h2 className="text-xl font-semibold">AI Grading Assistant</h2>
                <p className="mt-2 text-text-muted">
                  You have <span className="font-semibold">—</span> constructed
                  responses waiting for review.
                </p>
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    title="Hook this up later"
                    disabled
                  >
                    Open Queue
                  </Button>
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-xl font-semibold">Learning Hub Admin</h2>
                <p className="mt-2 text-slate-600">
                  Manage visibility, playlists, curriculum quality, and imports.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Link
                    href="/teacher/learning-controls"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Learning Controls
                  </Link>
                  <Link
                    href="/teacher/content-quality"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Content Quality
                  </Link>
                  <Link
                    href="/teacher/import-curriculum"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Import Validator
                  </Link>
                  <Link
                    href="/teacher/learning-analytics"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Learning Analytics
                  </Link>
                  <Link
                    href="/student/learn/simulations/population-genetics"
                    className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 sm:col-span-2"
                  >
                    🧬 Population Genetics Simulator
                  </Link>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </PageContent>
    </main>
  );
}
