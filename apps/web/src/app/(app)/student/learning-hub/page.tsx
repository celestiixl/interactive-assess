"use client";

import Link from "next/link";
import LearningHub from "@/components/student/LearningHub";
import { PageBanner, PageContent, Card } from "@/components/ui";
import { BackLink } from "@/components/nav/BackLink";

export default function StudentLearningHubStandalonePage() {
  return (
    <main className="ia-vh-page flex h-dvh flex-col overflow-hidden text-bs-text">
      <BackLink href="/student/dashboard" label="Back to dashboard" />
      <PageBanner
        title="Learning Hub"
        subtitle="Structured readings, lectures, and notes for active FBISD Units 1-2."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/student/learn"
            className="rounded-2xl bg-white/20 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/25"
          >
            Open BioSpark Quest
          </Link>
        </div>
      </PageBanner>

      <PageContent className="flex-1 min-h-0 py-4">
        <div className="ia-vh-scroll h-full min-h-0 overflow-y-auto pr-1">
          <Card>
            <LearningHub streak={3} accuracy={74} />
          </Card>
        </div>
      </PageContent>

    </main>
  );
}
