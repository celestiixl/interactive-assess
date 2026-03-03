"use client";

import Link from "next/link";
import { useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";

type LessonStatus = "not_started" | "in_progress" | "complete";

interface Microlesson {
  id: string;
  title: string;
  teks: string;
  description: string;
  durationMin: number;
  status: LessonStatus;
  progress: number; // 0-100
  href: string;
}

const LESSONS: Microlesson[] = [
  {
    id: "ml-biomolecules",
    title: "Biomolecules at a Glance",
    teks: "BIO.5A",
    description: "Lipids, carbohydrates, proteins, and nucleic acids — their structure and roles.",
    durationMin: 4,
    status: "complete",
    progress: 100,
    href: "/practice?focus=BIO.5A",
  },
  {
    id: "ml-cell-transport",
    title: "Cell Transport & Homeostasis",
    teks: "BIO.5C",
    description: "Osmosis, diffusion, and active transport keep cells in balance.",
    durationMin: 5,
    status: "in_progress",
    progress: 55,
    href: "/practice?focus=BIO.5C",
  },
  {
    id: "ml-dna-traits",
    title: "DNA Structure & Traits",
    teks: "BIO.7A",
    description: "How the double helix encodes heritable information.",
    durationMin: 4,
    status: "in_progress",
    progress: 30,
    href: "/practice?focus=BIO.7A",
  },
  {
    id: "ml-natural-selection",
    title: "Natural Selection",
    teks: "BIO.10A",
    description: "Variation, differential survival, and heritable traits driving evolution.",
    durationMin: 5,
    status: "not_started",
    progress: 0,
    href: "/practice?focus=BIO.10A",
  },
  {
    id: "ml-mutations",
    title: "Mutations & Their Effects",
    teks: "BIO.7C",
    description: "Point mutations, insertions, deletions — when does it matter?",
    durationMin: 4,
    status: "not_started",
    progress: 0,
    href: "/practice?focus=BIO.7C",
  },
  {
    id: "ml-ecology",
    title: "Ecological Relationships",
    teks: "BIO.13A",
    description: "Predation, competition, mutualism — energy flows through the web.",
    durationMin: 5,
    status: "not_started",
    progress: 0,
    href: "/practice?focus=BIO.13A",
  },
];

const STATUS_LABEL: Record<LessonStatus, string> = {
  not_started: "Start",
  in_progress: "Continue",
  complete: "Review",
};

const STATUS_BADGE: Record<LessonStatus, string> = {
  not_started: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-100 text-amber-800",
  complete: "bg-green-100 text-green-800",
};

const STATUS_TEXT: Record<LessonStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  complete: "Complete",
};

const BTN_CLS: Record<LessonStatus, string> = {
  not_started:
    "rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition",
  in_progress:
    "rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-400 transition",
  complete:
    "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition",
};

type FilterKey = "all" | "in_progress" | "not_started" | "complete";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In Progress" },
  { key: "not_started", label: "Not Started" },
  { key: "complete", label: "Complete" },
];

interface LearningHubProps {
  streak: number;
  accuracy: number;
}

export default function LearningHub({ streak, accuracy }: LearningHubProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const visible =
    filter === "all" ? LESSONS : LESSONS.filter((l) => l.status === filter);

  const completedCount = LESSONS.filter((l) => l.status === "complete").length;
  const overallProgress = Math.round((completedCount / LESSONS.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Learning Hub</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Bite-sized lessons tied to your TEKS. Pick up where you left off.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border bg-white px-4 py-2 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{streak}</div>
            <div className="text-xs text-slate-500">day streak 🔥</div>
          </div>
          <div className="rounded-xl border bg-white px-4 py-2 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-900">{accuracy}%</div>
            <div className="text-xs text-slate-500">accuracy</div>
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">
            Overall lesson progress
          </span>
          <span className="text-sm text-slate-500">
            {completedCount}/{LESSONS.length} complete
          </span>
        </div>
        <ProgressBar percent={overallProgress} label="" />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              filter === f.key
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Microlesson cards */}
      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          No lessons match this filter.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((lesson) => (
            <div
              key={lesson.id}
              className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm"
            >
              {/* Top row: TEKS + status badge */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {lesson.teks}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[lesson.status]}`}
                >
                  {STATUS_TEXT[lesson.status]}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-slate-900">
                {lesson.title}
              </h3>
              <p className="mt-1 grow text-sm text-slate-500">
                {lesson.description}
              </p>

              {/* Duration */}
              <div className="mt-3 text-xs text-slate-400">
                ⏱ {lesson.durationMin} min
              </div>

              {/* Progress bar (only for in-progress) */}
              {lesson.status === "in_progress" && (
                <div className="mt-3">
                  <ProgressBar percent={lesson.progress} label="" />
                </div>
              )}

              {/* CTA */}
              <div className="mt-4">
                <Link href={lesson.href} className={BTN_CLS[lesson.status]}>
                  {STATUS_LABEL[lesson.status]}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daily challenge callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
            Daily Challenge
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            Answer 5 questions about Protein Synthesis
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            BIO.7B · Resets at midnight
          </div>
        </div>
        <Link
          href="/practice?focus=BIO.7B"
          className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
        >
          Take Challenge
        </Link>
      </div>
    </div>
  );
}
