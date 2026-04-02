"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/ia/AppShell";
import { Pill } from "@/components/ia/Pill";
import { Surface } from "@/components/ia/Surface";
import { WhatsNextRoadmap } from "@/components/roadmap/WhatsNextRoadmap";
import { Card, Button } from "@/components/ui";
import { useRoadmapItems } from "@/lib/roadmap";

function ActionCard({
  href,
  title,
  desc,
  chips,
  accent,
}: {
  href: string;
  title: string;
  desc: string;
  chips: string[];
  accent: "teal" | "slate" | "amber" | "violet" | "emerald";
}) {
  const accentBar =
    accent === "teal"
      ? "bg-teal-500"
      : accent === "amber"
        ? "bg-amber-500"
        : accent === "violet"
          ? "bg-violet-500"
          : accent === "emerald"
            ? "bg-emerald-500"
            : "bg-[var(--bs-raised)]0";

  const accentWash =
    accent === "teal"
      ? "from-teal-500/10"
      : accent === "amber"
        ? "from-amber-500/10"
        : accent === "violet"
          ? "from-violet-500/10"
          : accent === "emerald"
            ? "from-emerald-500/10"
            : "from-slate-500/10";

  const chipCycle: Array<"teal" | "emerald" | "amber" | "violet" | "slate"> = [
    "teal",
    "emerald",
    "amber",
    "violet",
    "slate",
  ];

  return (
    <Link href={href} className="group block">
      <Card
        variant="accent"
        animate
        className="relative overflow-hidden border-slate-200/80 p-6"
        accentColor={
          accent === "teal"
            ? "teal"
            : accent === "amber"
              ? "orange"
              : accent === "violet"
                ? "purple"
                : accent === "emerald"
                  ? "green"
                  : "blue"
        }
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b ${accentWash} to-transparent`}
        />
        <div
          className={`pointer-events-none absolute left-0 top-0 h-full w-1.5 ${accentBar}`}
        />

        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-bs-text">
              {title}
            </h2>
            <p className="mt-2 text-sm text-bs-text-sub">{desc}</p>
          </div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--bs-border)] bg-white/70 text-lg text-bs-text transition group-hover:bg-bs-surface">
            →
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <Pill key={c} tone={chipCycle[i % chipCycle.length]}>
              {c}
            </Pill>
          ))}
        </div>
      </Card>
    </Link>
  );
}

export default function AssessmentDashboardEntry() {
  const router = useRouter();
  const { roadmapItems } = useRoadmapItems();

  return (
    <AppShell activeKey="assessment">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-bs-text">
          Assessment
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-bs-text-sub">
          Choose your view. Student is the practice + item sandbox. Teacher is
          building, managing, and analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ActionCard
          href="/auth/student/login"
          accent="teal"
          title="Continue as Student"
          desc="Practice runner entry, interactive item testing, goals, and progress."
          chips={["Practice", "Interactive items", "Goals", "Mastery"]}
        />
        <ActionCard
          href="/auth/teacher/login"
          accent="slate"
          title="Continue as Teacher"
          desc="Build items, manage assessments, view analytics, and jump into student view."
          chips={["Builder", "Analytics", "Assign", "Student view"]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Surface className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-bs-text">
                Quick actions
              </div>
              <div className="mt-1 text-xs text-bs-text-sub">
                Handy jumps while you’re building and testing.
              </div>
            </div>
            <Pill tone="slate">shortcuts</Pill>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => router.push("/practice")}
            >
              Practice Runner
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => router.push("/simulations")}
            >
              Simulations
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => router.push("/phenomena-studio")}
            >
              SparkScope
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => router.push("/student/assessment/items")}
            >
              Items Test Screen
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => router.push("/student/assessment")}
            >
              Student Lab
            </Button>
          </div>
        </Surface>

        <WhatsNextRoadmap
          items={roadmapItems}
          footer="Direction: when authentication is fully connected, this page can route users directly to Student or Teacher based on account role."
        />
      </div>
    </AppShell>
  );
}
