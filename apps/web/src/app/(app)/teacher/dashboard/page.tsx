"use client";

import Link from "next/link";
import { PageContent, BentoGrid, BentoCell, SpotlightCard, BlurText, CountUp, ShinyText } from "@/components/ui";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import LinearProgress from "@mui/joy/LinearProgress";

export default function TeacherDashboardPage() {
  return (
    <main>
      <PageContent className="py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <BlurText
                text="Teacher Dashboard"
                className="text-3xl font-semibold tracking-tight text-slate-900"
                delay={80}
                animateBy="words"
              />
              <p className="mt-1 text-slate-600">
                Quick access to your item bank, builder, classes, and insights.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                component={Link}
                href="/teacher/item-bank"
                variant="outlined"
                color="neutral"
                size="sm"
              >
                Item Bank
              </Button>

              <Button
                component={Link}
                href="/teacher/builder"
                variant="solid"
                color="success"
                size="sm"
              >
                + New Assessment
              </Button>
            </div>
          </header>

          {/* KPI bento row */}
          <BentoGrid cols={3} className="gap-4">
            <BentoCell>
              <SpotlightCard
                className="h-full rounded-2xl border bg-white p-5 shadow-sm"
                spotlightColor="rgba(14,165,233,0.18)"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Items
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <CountUp
                    to={248}
                    duration={1.4}
                    className="text-3xl font-semibold tabular-nums text-blue-600"
                  />
                </div>
                <div className="mt-3">
                  <LinearProgress
                    determinate
                    value={82}
                    color="primary"
                    size="sm"
                    sx={{ "--LinearProgress-radius": "9999px" }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500">82% aligned to TEKS</div>
              </SpotlightCard>
            </BentoCell>

            <BentoCell>
              <SpotlightCard
                className="h-full rounded-2xl border bg-white p-5 shadow-sm"
                spotlightColor="rgba(16,185,129,0.2)"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Avg. Class Score
                </div>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <CountUp
                    to={71}
                    duration={1.5}
                    className="text-3xl font-semibold tabular-nums text-emerald-600"
                  />
                  <span className="text-lg text-slate-400">%</span>
                </div>
                <div className="mt-3">
                  <LinearProgress
                    determinate
                    value={71}
                    color="success"
                    size="sm"
                    sx={{ "--LinearProgress-radius": "9999px" }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500">Last 7 days across all classes</div>
              </SpotlightCard>
            </BentoCell>

            <BentoCell>
              <SpotlightCard
                className="h-full rounded-2xl border bg-white p-5 shadow-sm"
                spotlightColor="rgba(245,158,11,0.2)"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pending Reviews
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <CountUp
                    to={14}
                    duration={1.2}
                    className="text-3xl font-semibold tabular-nums text-amber-500"
                  />
                  <span className="ml-1 text-base text-slate-500">responses</span>
                </div>
                <Chip color="warning" variant="soft" size="sm" sx={{ mt: 1.5 }}>
                  AI-graded · needs review
                </Chip>
              </SpotlightCard>
            </BentoCell>
          </BentoGrid>

          {/* Main bento content */}
          <BentoGrid cols={3} className="gap-4">
            {/* Recent assessments — takes 2 columns */}
            <BentoCell span="2x1">
              <SpotlightCard
                className="h-full rounded-2xl border bg-white p-5 shadow-sm"
                spotlightColor="rgba(79,70,229,0.12)"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Recent Assessments</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Your latest drafts and published assessments.
                    </p>
                  </div>
                  <Button
                    component={Link}
                    href="/teacher/assessments"
                    variant="outlined"
                    color="neutral"
                    size="sm"
                  >
                    View All
                  </Button>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <div className="text-slate-600">No assessments yet.</div>
                  <div className="mt-5 flex justify-end gap-3">
                    <Button
                      component={Link}
                      href="/teacher/builder"
                      variant="outlined"
                      color="neutral"
                      size="sm"
                    >
                      Open Builder
                    </Button>
                    <Button variant="soft" color="neutral" size="sm" disabled>
                      Analytics
                    </Button>
                  </div>
                </div>
              </SpotlightCard>
            </BentoCell>

            {/* My Classes */}
            <BentoCell>
              <SpotlightCard
                className="h-full rounded-2xl border bg-white p-5 shadow-sm"
                spotlightColor="rgba(20,184,166,0.18)"
              >
                <h2 className="text-xl font-semibold text-slate-900">My Classes</h2>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <div className="text-sm font-semibold text-slate-900">Biology Period —</div>
                    <div className="text-xs text-slate-500 mt-0.5">Code: BIO-—</div>
                    <LinearProgress
                      determinate
                      value={64}
                      color="primary"
                      size="sm"
                      sx={{ mt: 1, "--LinearProgress-radius": "9999px" }}
                    />
                    <div className="mt-1 text-xs text-slate-500">64% avg mastery</div>
                  </div>
                </div>
              </SpotlightCard>
            </BentoCell>

            {/* Hot Questions insight */}
            <BentoCell>
              <SpotlightCard
                className="h-full rounded-2xl border bg-gradient-to-br from-violet-600 to-indigo-700 p-5 shadow-sm"
                spotlightColor="rgba(255,255,255,0.15)"
              >
                <div>
                  <Chip color="primary" variant="solid" size="sm" sx={{ mb: 1.5, background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                    Hot Questions
                  </Chip>
                  <h2 className="text-lg font-semibold text-white">Top Struggle Points</h2>
                  <p className="mt-1 text-sm text-violet-100">
                    BIO.10C — Speciation leads with 44% avg score.
                  </p>
                </div>
                <div className="mt-4">
                  <Button
                    component={Link}
                    href="/teacher/assessments"
                    variant="solid"
                    size="sm"
                    sx={{
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      "&:hover": { background: "rgba(255,255,255,0.28)" },
                    }}
                  >
                    View Insights
                  </Button>
                </div>
              </SpotlightCard>
            </BentoCell>

            {/* AI Grading */}
            <BentoCell span="2x1">
              <SpotlightCard
                className="h-full rounded-2xl border bg-gradient-to-br from-emerald-600 to-teal-700 p-5 shadow-sm"
                spotlightColor="rgba(255,255,255,0.15)"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <ShinyText
                      text="AI Grading Assistant"
                      color="rgba(255,255,255,0.9)"
                      shineColor="#fff"
                      speed={3}
                      className="text-xl font-semibold"
                    />
                    <p className="mt-1 text-sm text-emerald-50">
                      You have{" "}
                      <span className="font-semibold">
                        <CountUp to={14} duration={1.2} className="tabular-nums" />
                      </span>{" "}
                      constructed responses waiting for review.
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    sx={{
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    14 pending
                  </Chip>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button
                    variant="solid"
                    size="sm"
                    disabled
                    sx={{
                      background: "rgba(255,255,255,0.2)",
                      color: "#fff",
                      "&:hover": { background: "rgba(255,255,255,0.28)" },
                      "&:disabled": { opacity: 0.6, background: "rgba(255,255,255,0.15)", color: "#fff" },
                    }}
                  >
                    Open Queue
                  </Button>
                  <Button
                    variant="soft"
                    size="sm"
                    disabled
                    sx={{
                      background: "rgba(255,255,255,0.12)",
                      color: "#fff",
                      "&:disabled": { opacity: 0.6 },
                    }}
                  >
                    Configure AI
                  </Button>
                </div>
              </SpotlightCard>
            </BentoCell>
          </BentoGrid>
        </div>
      </PageContent>
    </main>
  );
}
