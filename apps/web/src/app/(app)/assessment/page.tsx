"use client";

import Link from "next/link";
import { AppShell } from "@/components/ia/AppShell";
import { Pill } from "@/components/ia/Pill";
import { Surface } from "@/components/ia/Surface";

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
            : "bg-slate-500";

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
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/0/90 p-6 shadow-[0_16px_45px_rgba(2,6,23,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(2,6,23,0.08)]">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b ${accentWash} to-transparent`}
        />
        <div
          className={`pointer-events-none absolute left-0 top-0 h-full w-1.5 ${accentBar}`}
        />

        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-700">{desc}</p>
          </div>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/0/70 text-lg text-slate-900 transition group-hover:bg-white">
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
      </div>
    </Link>
  );
}

export default function AssessmentDashboardEntry() {
  return (
    <AppShell activeKey="assessment">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Assessment
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-700">
          Choose your view. Student is the practice + item sandbox. Teacher is
          building, managing, and analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ActionCard
          href="/student/dashboard"
          accent="teal"
          title="Continue as Student"
          desc="Practice runner entry, interactive item testing, goals, and progress."
          chips={["Practice", "Interactive items", "Goals", "Mastery"]}
        />
        <ActionCard
          href="/teacher/dashboard"
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
              <div className="text-sm font-semibold text-slate-900">
                Quick actions
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Handy jumps while you’re building and testing.
              </div>
            </div>
            <Pill tone="slate">shortcuts</Pill>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/practice"
              className="rounded-xl border border-slate-200 bg-white/0/70 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Practice Runner
            </Link>
            <Link
              href="/student/assessment/items"
              className="rounded-xl border border-slate-200 bg-white/0/70 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Items Test Screen
            </Link>
            <Link
              href="/student/assessment"
              className="rounded-xl border border-slate-200 bg-white/0/70 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Student Lab
            </Link>
          </div>
        </Surface>

        <Surface className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">
              What’s next
            </div>
            <Pill tone="amber">roadmap</Pill>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-800">
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Inline Choice: show in pills + builder + runner (no hook errors)
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-500" />
              Role-based login routing (student/teacher) + remember my view
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
              Accommodations: text-to-speech, extended time, reduced answer
              choices
            </li>
          </ul>
          <div className="mt-4 text-xs text-slate-600">
            Tip: once we add auth, this page becomes the smart gate that routes
            by role automatically.
          </div>
        </Surface>
      </div>
    </AppShell>
  );
}
