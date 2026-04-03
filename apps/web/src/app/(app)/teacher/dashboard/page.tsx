"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContent, PageBanner, Card, Button } from "@/components/ui";
import PageShell from "@/components/ui/PageShell";
import BsCard from "@/components/ui/BsCard";
import BsCardLabel from "@/components/ui/BsCardLabel";
import BsCardTitle from "@/components/ui/BsCardTitle";
import BsTag from "@/components/ui/BsTag";
import BsBtn from "@/components/ui/BsBtn";
import WeeklyDigestCard from "@/components/teacher/WeeklyDigestCard";
import PeriodMasterySection from "@/components/teacher/PeriodMasterySection";

export default function TeacherDashboardPage() {
  const router = useRouter();

  return (
    <PageShell>
      {/* ── Topbar ── */}
      <div className="mb-7">
        <p className="text-[13px] text-bs-muted">Welcome back</p>
        <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight text-bs-ink">
          Teacher Dashboard
        </h1>
        <p className="mt-1 text-[13px] text-bs-muted">
          Quick access to your item bank, builder, classes, and insights.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <BsBtn variant="ghost" onClick={() => router.push("/teacher/item-bank")}>
            Item Bank
          </BsBtn>
          <BsBtn variant="teal" onClick={() => router.push("/teacher/builder")}>
            Builder
          </BsBtn>
          <BsBtn variant="ghost" onClick={() => router.push("/simulations")} aria-label="Open simulations">
            Simulations
          </BsBtn>
          <BsBtn variant="ghost" onClick={() => router.push("/phenomena-studio")} aria-label="Open phenomenon exploration">
            SparkScope
          </BsBtn>
        </div>
      </div>

      {/* ── Weekly Digest ── */}
      <div className="mb-3">
        <WeeklyDigestCard take={3} showFooter />
      </div>

      {/* ── Main content ── */}
      <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BsCard>
          <div className="flex items-start justify-between gap-4">
            <div>
              <BsCardTitle>Recent Assessments</BsCardTitle>
              <p className="mt-1 text-[13px] text-bs-muted">
                Your latest drafts and published assessments.
              </p>
            </div>
            <BsBtn variant="ghost" onClick={() => router.push("/teacher/assessments")}>
              View All
            </BsBtn>
          </div>
          <div className="mt-4 rounded-bs-sm border border-[rgba(0,0,0,0.06)] p-4">
            <div className="text-[13px] text-bs-muted">No assessments yet.</div>
            <div className="mt-5 flex justify-end gap-3">
              <BsBtn variant="ghost" onClick={() => router.push("/teacher/builder")}>
                Open
              </BsBtn>
              <BsBtn variant="ghost" onClick={() => router.push("/teacher/learning-analytics")}>
                Analytics
              </BsBtn>
            </div>
          </div>
        </BsCard>

        <div className="flex flex-col gap-3">
          <BsCard>
            <BsCardTitle>My Classes</BsCardTitle>
            <div className="mt-4 rounded-bs-sm border border-[rgba(0,0,0,0.06)] p-4">
              <div className="text-[15px] font-semibold text-bs-ink">Biology Period —</div>
              <div className="text-[13px] text-bs-muted">Code: BIO-—</div>
            </div>
          </BsCard>

          <BsCard>
            <div className="flex items-start justify-between gap-2">
              <div>
                <BsCardTitle>AI Grading Assistant</BsCardTitle>
                <p className="mt-2 text-[13px] text-bs-muted">
                  You have <span className="font-semibold">—</span> constructed
                  responses waiting for review.
                </p>
              </div>
              <BsTag variant="teal">Ready</BsTag>
            </div>
            <div className="mt-4">
              <BsBtn variant="ghost" disabled>
                Open Queue
              </BsBtn>
            </div>
          </BsCard>

          <BsCard>
            <BsCardTitle>Learning Hub Admin</BsCardTitle>
            <p className="mt-2 text-[13px] text-bs-muted">
              Manage visibility, playlists, curriculum quality, and imports.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Link
                href="/teacher/learning-controls"
                className="rounded-bs-sm border border-[rgba(0,0,0,0.06)] bg-bs-surface px-3 py-2 text-[13px] font-semibold text-bs-muted hover:bg-bs-teal-soft"
              >
                Learning Controls
              </Link>
              <Link
                href="/teacher/content-quality"
                className="rounded-bs-sm border border-[rgba(0,0,0,0.06)] bg-bs-surface px-3 py-2 text-[13px] font-semibold text-bs-muted hover:bg-bs-teal-soft"
              >
                Content Quality
              </Link>
              <Link
                href="/teacher/import-curriculum"
                className="rounded-bs-sm border border-[rgba(0,0,0,0.06)] bg-bs-surface px-3 py-2 text-[13px] font-semibold text-bs-muted hover:bg-bs-teal-soft"
              >
                Import Validator
              </Link>
              <Link
                href="/teacher/learning-analytics"
                className="rounded-bs-sm border border-[rgba(0,0,0,0.06)] bg-bs-surface px-3 py-2 text-[13px] font-semibold text-bs-muted hover:bg-bs-teal-soft"
              >
                Learning Analytics
              </Link>
              <Link
                href="/student/learn/simulations/population-genetics"
                className="rounded-bs-sm border border-[rgba(124,92,252,0.2)] bg-bs-purple-soft px-3 py-2 text-[13px] font-semibold text-[#4a2fc0] hover:opacity-90 sm:col-span-2"
              >
                🧬 Population Genetics Simulator
              </Link>
            </div>
          </BsCard>
        </div>
      </div>

      {/* ── Period Mastery Snapshot ── */}
      <PeriodMasterySection />
    </PageShell>
  );
}
