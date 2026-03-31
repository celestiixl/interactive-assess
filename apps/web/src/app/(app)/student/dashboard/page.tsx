"use client";

import { useRouter } from "next/navigation";
import type { Segment } from "@/types/segment";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

import SpecimenGrid from "@/components/student/SpecimenGrid";
import { PageContent, Card, Section, MasteryRing } from "@/components/ui";

// ---------------------------------------------------------------------------
// Mock data — replace with real data fetch when API is ready
// ---------------------------------------------------------------------------
const MOCK_USER = { initials: "BS", displayName: "Student" };

const MOCK_NEXT_ASSIGNMENT: {
  title: string;
  dueDate: string;
  teks: string[];
  type: "quiz" | "assignment";
} | null = {
  title: "Unit 1 Concept Check: Biomolecules",
  dueDate: "2026-04-04",
  teks: ["B.5A", "B.5B"],
  type: "assignment",
};

export default function StudentDashboard() {
  const router = useRouter();

  const [tab, setTab] = useState<"overview" | "specimens">("overview");

  // After hydration, restore last selected tab (prevents SSR/client mismatch)
  useEffect(() => {
    try {
      const v = window.localStorage.getItem("studentDashboard.activeTab");
      if (v === "specimens" || v === "overview") setTab(v);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "studentDashboard.activeTab",
      tab === "specimens" ? "specimens" : "overview",
    );
  }, [tab]);

  // Demo segments (0..1). Replace later with real stats.
  const SEGMENTS: Segment[] = [
    { key: "B.5A", label: "Biomolecules", value: 0.8, group: "B.5" },
    {
      key: "B.5B",
      label: "Prokaryote vs eukaryote",
      value: 0.54,
      group: "B.5",
    },
    {
      key: "B.5C",
      label: "Transport & homeostasis",
      value: 0.49,
      group: "B.5",
    },
    {
      key: "B.11A",
      label: "Photosynthesis & respiration",
      value: 0.55,
      group: "B.11",
    },
    {
      key: "B.11B",
      label: "Enzyme function",
      value: 0.51,
      group: "B.11",
    },
    {
      key: "B.7A",
      label: "DNA structure & traits",
      value: 0.56,
      group: "B.7",
    },
    {
      key: "B.7B",
      label: "Protein synthesis",
      value: 0.5,
      group: "B.7",
    },
    {
      key: "B.7C",
      label: "Mutations",
      value: 0.44,
      group: "B.7",
    },
    {
      key: "B.5D",
      label: "Viruses vs cells",
      value: 0.48,
      group: "B.5",
    },
    {
      key: "B.6A",
      label: "Cell cycle importance",
      value: 0.41,
      group: "B.6",
    },
    {
      key: "B.6B",
      label: "Differentiation",
      value: 0.46,
      group: "B.6",
    },
    {
      key: "B.6C",
      label: "Cell cycle disruptions",
      value: 0.39,
      group: "B.6",
    },
    {
      key: "B.8A",
      label: "Meiosis and diversity",
      value: 0.43,
      group: "B.8",
    },
  ];

  const segments = SEGMENTS;

  const weakestSegment = useMemo(() => {
    const sorted = [...segments].sort(
      (a, b) => (a.value ?? 0) - (b.value ?? 0),
    );
    return sorted[0] ?? null;
  }, [segments]);

  return (
    <main className="ia-vh-page flex h-dvh flex-col overflow-hidden text-bs-text">
      {/* ------------------------------------------------------------------ */}
      {/* Minimal nav bar (Part 2)                                            */}
      {/* ------------------------------------------------------------------ */}
      <nav
        className="sticky top-0 z-50 border-b border-bs-border bg-[#0d1e2c]/95 backdrop-blur-md"
        style={{ fontFamily: "Outfit, sans-serif" }}
        aria-label="Student navigation"
      >
        <div className="mx-auto flex h-14 w-full max-w-350 items-center justify-between px-6 sm:px-8">
          {/* Left: Logo */}
          <Link
            href="/student/dashboard"
            className="text-xl font-bold tracking-tight text-[#00d4aa]"
            aria-label="BioSpark home"
          >
            BioSpark
          </Link>

          {/* Center: Horizontal nav links */}
          <div className="flex items-center gap-1">
            <Link
              href="/student/learn"
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#9abcb0] hover:bg-[#132638] hover:text-[#e8f4f0]"
            >
              BioSpark Quest
            </Link>
            <Link
              href="/simulations"
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#9abcb0] hover:bg-[#132638] hover:text-[#e8f4f0]"
            >
              Simulations
            </Link>
            <Link
              href="/phenomena-studio"
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[#9abcb0] hover:bg-[#132638] hover:text-[#e8f4f0]"
            >
              SparkScope
            </Link>
          </div>

          {/* Far right: Avatar + name inline cluster */}
          <Link
            href="/student/profile"
            aria-label="My profile"
            className="flex items-center gap-2 rounded-full border border-[#00d4aa]/30 bg-[#132638] px-3 py-1.5 hover:bg-bs-raised"
          >
            <div
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00d4aa] text-xs font-bold text-[#0d1e2c]"
            >
              {MOCK_USER.initials}
            </div>
            <span className="text-sm font-semibold text-[#e8f4f0]">{MOCK_USER.displayName}</span>
          </Link>
        </div>
      </nav>

      <PageContent className="flex-1 min-h-0 py-4">
        <div className="ia-vh-scroll h-full min-h-0 overflow-y-auto pr-1">
          {/* MAIN CONTENT SURFACE */}
          <Card>
            {/* Tabs */}
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTab("overview")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  tab === "overview"
                    ? "bg-bs-bg text-white"
                    : "bg-bs-surface text-bs-text hover:bg-bs-raised"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setTab("specimens")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  tab === "specimens"
                    ? "bg-bs-bg text-white"
                    : "bg-bs-surface text-bs-text hover:bg-bs-raised"
                }`}
              >
                Specimens
              </button>
              <button
                type="button"
                onClick={() => router.push("/student/learning-hub")}
                className="rounded-full border bg-bs-surface px-4 py-2 text-sm font-semibold text-bs-text transition hover:bg-bs-raised"
              >
                Learning Hub
              </button>
            </div>

            {/* Main panel */}
            <Section className="p-6 ia-card-soft">
              {tab === "overview" ? (
                <>
                  <MasteryRing segments={segments} />

                  {/* -------------------------------------------------------- */}
                  {/* Next-best-step CTA (Part 3)                              */}
                  {/* -------------------------------------------------------- */}
                  <div className="mt-5 rounded-2xl border border-bs-border bg-bs-surface p-5">
                    <div className="text-sm font-semibold text-bs-text">
                      Next best step
                    </div>
                    <div className="mt-2 text-sm text-bs-text-sub">
                      {weakestSegment
                        ? `Focus on ${weakestSegment.label} (${weakestSegment.key}) to raise your weakest segment.`
                        : "Focus on your lowest mastery segment."}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href="/student/learn/standards"
                        className="inline-flex items-center rounded-full bg-[#00d4aa] px-4 py-2 text-sm font-semibold text-[#0d1e2c] hover:opacity-90"
                      >
                        {weakestSegment
                          ? `Practice ${weakestSegment.key}`
                          : "Practice"}
                      </Link>
                      <Link
                        href="/student/learn/standards"
                        className="inline-flex items-center rounded-full border border-bs-border bg-bs-surface px-4 py-2 text-sm font-semibold text-bs-text hover:bg-bs-raised"
                      >
                        View all standards
                      </Link>
                    </div>
                  </div>
                </>
              ) : tab === "specimens" ? (
                <>
                  <div className="mb-4 text-sm text-bs-text-sub">
                    Collect organisms by mastering TEKS segments (75%+ unlock).
                  </div>
                  <SpecimenGrid segments={segments} />
                </>
              ) : null}
            </Section>

            {/* ---------------------------------------------------------------- */}
            {/* Assigned Work card (Part 3)                                      */}
            {/* ---------------------------------------------------------------- */}
            <section className="mt-5 rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-5">
              <div className="mb-3 text-sm font-semibold text-bs-text">
                Assigned work
              </div>
              {MOCK_NEXT_ASSIGNMENT ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-bs-text">
                      {MOCK_NEXT_ASSIGNMENT.title}
                    </div>
                    <div className="mt-1 text-xs text-bs-text-sub">
                      Due{" "}
                      {new Date(
                        MOCK_NEXT_ASSIGNMENT.dueDate,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {MOCK_NEXT_ASSIGNMENT.teks.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[#00d4aa]/15 px-2 py-0.5 text-xs font-semibold text-[#00d4aa]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    href="/student/assignments"
                    className="inline-flex items-center rounded-full bg-[#00d4aa] px-4 py-2 text-sm font-semibold text-[#0d1e2c] hover:opacity-90"
                  >
                    Start
                  </Link>
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-bs-text-sub">
                  You&apos;re all caught up! 🎉
                </div>
              )}
            </section>

            <section className="mt-5 grid gap-4 md:grid-cols-2">
              <Card variant="sm">
                <div
                  className="text-sm font-semibold text-bs-text"
                  data-focus-hide="1"
                >
                  Streak
                </div>
                <div className="mt-2 text-2xl font-semibold">3 days</div>
                <div className="mt-1 text-sm text-bs-text-sub">Keep going.</div>
              </Card>

              <Card variant="sm">
                <div
                  className="text-sm font-semibold text-bs-text"
                  data-focus-hide="1"
                >
                  Accuracy
                </div>
                <div className="mt-2 text-2xl font-semibold">74%</div>
                <div className="mt-1 text-sm text-bs-text-sub">
                  Last 20 checks (demo).
                </div>
              </Card>
            </section>
          </Card>
        </div>
      </PageContent>
    </main>
  );
}
