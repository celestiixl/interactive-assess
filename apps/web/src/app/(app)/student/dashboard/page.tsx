"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Segment } from "@/types/segment";
import AccommodationsButton from "@/components/student/AccommodationsButton";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

import MasteryDonut from "@/components/student/MasteryDonut";
import SpecimenGrid from "@/components/student/SpecimenGrid";
import {
  PageContent,
  Card,
  Section,
  BentoGrid,
  BentoCell,
  SpotlightCard,
  BlurText,
  ShinyText,
  CountUp,
} from "@/components/ui";

import LinearProgress from "@mui/joy/LinearProgress";
import Chip from "@mui/joy/Chip";
import Button from "@mui/joy/Button";

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function getBiomeHealth(segments: Segment[]) {
  const total = segments.reduce((acc, seg) => acc + (Number(seg.value) || 0), 0);
  const avg = segments.length ? total / segments.length : 0;
  const p = clamp01(avg);

  if (p < 0.25) {
    return {
      level: "Collapsed",
      biome: "Polluted Waters",
      desc: "Food web is unstable.",
      pct: Math.round(p * 100),
      tone: "neutral" as const,
      banner: "bg-neutral-50",
      badge: "border-neutral-200 text-neutral-800",
      joyColor: "neutral" as const,
    };
  }
  if (p < 0.5) {
    return {
      level: "Recovering",
      biome: "Sparse Grassland",
      desc: "Some stability, gaps remain.",
      pct: Math.round(p * 100),
      tone: "warning" as const,
      banner: "bg-amber-50",
      badge: "border-amber-200 text-amber-900",
      joyColor: "warning" as const,
    };
  }
  if (p < 0.75) {
    return {
      level: "Stable",
      biome: "Balanced Forest",
      desc: "Most relationships are solid.",
      pct: Math.round(p * 100),
      tone: "success" as const,
      banner: "bg-green-50",
      badge: "border-green-200 text-green-900",
      joyColor: "success" as const,
    };
  }
  return {
    level: "Thriving",
    biome: "Thriving Reef",
    desc: "Ecosystem is strong and resilient.",
    pct: Math.round(p * 100),
    tone: "primary" as const,
    banner: "bg-cyan-50",
    badge: "border-cyan-200 text-cyan-900",
    joyColor: "primary" as const,
  };
}

export default function StudentDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("tab") || "").toLowerCase() : "";
  const initialTab = tabParam === "specimens" ? "specimens" : "overview";

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
    window.localStorage.setItem("studentDashboard.activeTab", tab === "specimens" ? "specimens" : "overview");
  }, [tab]);


  // Demo segments (0..1). Replace later with real stats.
  const SEGMENTS: Segment[] = [
    { key: "BIO.1", label: "BIO.1 • Ask questions & investigate safely", value: 0.8, group: "BIO.1" },
    { key: "BIO.2", label: "BIO.2 • Analyze & interpret data", value: 0.52, group: "BIO.2" },
    { key: "BIO.3", label: "BIO.3 • Communicate findings", value: 0.57, group: "BIO.3" },
    { key: "BIO.4", label: "BIO.4 • Science & society", value: 0.48, group: "BIO.4" },

    { key: "BIO.5A", label: "Biomolecules", value: 0.8, group: "BIO.5" },
    { key: "BIO.5B", label: "Prokaryote vs eukaryote", value: 0.54, group: "BIO.5" },
    { key: "BIO.5C", label: "Transport & homeostasis", value: 0.49, group: "BIO.5" },
    { key: "BIO.5D", label: "Viruses vs cells", value: 0.46, group: "BIO.5" },

    { key: "BIO.6A", label: "Cell cycle & DNA replication", value: 0.55, group: "BIO.6" },
    { key: "BIO.6B", label: "Cell differentiation", value: 0.51, group: "BIO.6" },
    { key: "BIO.6C", label: "Cell cycle disruption & cancer", value: 0.44, group: "BIO.6" },

    { key: "BIO.7A", label: "DNA structure & traits", value: 0.56, group: "BIO.7" },
    { key: "BIO.7B", label: "Protein synthesis", value: 0.5, group: "BIO.7" },
    { key: "BIO.7C", label: "Mutations", value: 0.47, group: "BIO.7" },
    { key: "BIO.7D", label: "Molecular technologies", value: 0.52, group: "BIO.7" },

    { key: "BIO.8A", label: "Meiosis & diversity", value: 0.53, group: "BIO.8" },
    { key: "BIO.8B", label: "Genetic crosses", value: 0.48, group: "BIO.8" },

    { key: "BIO.9A", label: "Evidence of evolution", value: 0.6, group: "BIO.9" },
    { key: "BIO.9B", label: "Rates of evolutionary change", value: 0.52, group: "BIO.9" },

    { key: "BIO.10A", label: "Natural selection", value: 0.57, group: "BIO.10" },
    { key: "BIO.10B", label: "Elements of natural selection", value: 0.5, group: "BIO.10" },
    { key: "BIO.10C", label: "Speciation", value: 0.44, group: "BIO.10" },
    { key: "BIO.10D", label: "Other mechanisms", value: 0.46, group: "BIO.10" },

    { key: "BIO.11A", label: "Photosynthesis & respiration", value: 0.55, group: "BIO.11" },
    { key: "BIO.11B", label: "Enzymes", value: 0.51, group: "BIO.11" },

    { key: "BIO.12A", label: "Animal systems", value: 0.49, group: "BIO.12" },
    { key: "BIO.12B", label: "Plant systems", value: 0.47, group: "BIO.12" },

    { key: "BIO.13A", label: "Ecological relationships", value: 0.58, group: "BIO.13" },
    { key: "BIO.13B", label: "Energy/matter disruption", value: 0.5, group: "BIO.13" },
    { key: "BIO.13C", label: "Carbon & nitrogen cycles", value: 0.46, group: "BIO.13" },
    { key: "BIO.13D", label: "Biodiversity change", value: 0.44, group: "BIO.13" },
  ];

  const segments = SEGMENTS;

  const biome = useMemo(() => getBiomeHealth(segments), [segments]);

  const nextSegment = useMemo(() => {
    const s = [...segments].sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];
    return s ?? null;
  }, [segments]);

  const masteredCount = useMemo(
    () => segments.filter((s) => (s.value ?? 0) >= 0.75).length,
    [segments]
  );

  return (
    <main className="min-h-dvh text-slate-900">
      {/* FULL-WIDTH HEADER BAND */}
      <div className="bg-linear-to-r from-sky-500 via-blue-600 to-indigo-600">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <BlurText
                text="Student Dashboard"
                className="text-4xl font-semibold tracking-tight text-white"
                delay={70}
                animateBy="words"
              />
              <div className="mt-2 flex flex-wrap items-center gap-3 text-white/90">
                <span>Your personal mastery tracker.</span>
                <button
                  type="button"
                  onClick={() => {
                    Object.keys(sessionStorage).forEach((k) => {
                      if (k.startsWith("specimen_unlocked_")) sessionStorage.removeItem(k);
                    });
                    location.reload();
                  }}
                  className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/25"
                >
                  Reset Specimen Unlocks
                </button>
              </div>
            </div>

            <Link
              href="/student/assessment"
              className="rounded-2xl bg-white/20 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/25"
            >
              Back to Assessment Lab
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT SURFACE */}
      <PageContent className="-mt-5 pb-10">
        <Card>
          {/* Biome banner */}
          <div className={`mb-5 flex flex-wrap items-start justify-between gap-3 rounded-2xl border p-5 ${biome.banner}`}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Biome Health
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <ShinyText
                  text={`${biome.level} • ${biome.biome}`}
                  color="rgb(15,23,42)"
                  shineColor="#2563eb"
                  speed={3}
                  className="text-lg font-semibold"
                />
                <span className="text-sm font-semibold text-slate-600">({biome.pct}%)</span>
              </div>
              <div className="mt-1 text-sm text-slate-600">{biome.desc}</div>
              {/* Joy UI progress bar */}
              <div className="mt-3 w-48">
                <LinearProgress
                  determinate
                  value={biome.pct}
                  color={biome.joyColor}
                  size="sm"
                  sx={{ "--LinearProgress-radius": "9999px" }}
                />
              </div>
              <div className={`mt-3 inline-flex items-center rounded-full border bg-white/95 px-3 py-1 text-xs font-semibold ${biome.badge}`}>
                segments passed: {segments.length}
              </div>
            </div>

            <div className="flex items-center">
              <Link
                href={nextSegment ? `/practice?focus=${encodeURIComponent(nextSegment.key)}` : "/practice"}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                {nextSegment ? `Next: practice ${nextSegment.label}` : "Start practice"}
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setTab("overview"); if (typeof window !== "undefined") window.localStorage.setItem("studentDashboard.activeTab", "overview"); } }
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                tab === "overview" ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-50"
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => { setTab("specimens"); if (typeof window !== "undefined") window.localStorage.setItem("studentDashboard.activeTab", "specimens"); } }
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                tab === "specimens" ? "bg-slate-900 text-white" : "bg-white text-slate-900 hover:bg-slate-50"
              }`}
            >
              Specimens
            </button>
          </div>

          {/* Main panel */}
          <Section className="/0 p-6 ia-card-soft ">
            {tab === "overview" ? (
              <>
                <MasteryDonut segments={segments} />
                <div className="mt-4 text-center text-sm text-slate-500">
                  Hover a slice to see the TEKS.
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 text-sm text-slate-600">
                  Collect organisms by mastering TEKS segments (75%+ unlock).
                </div>
                <SpecimenGrid segments={segments} />
              </>
            )}
          </Section>

          {/* Bento stats row */}
          <BentoGrid cols={3} className="mt-5">
            {/* Next best step — wide */}
            <BentoCell span="2x1">
              <SpotlightCard
                className="h-full rounded-2xl border bg-white p-5 shadow-sm"
                spotlightColor="rgba(14,165,233,0.18)"
              >
                <div className="text-sm font-semibold text-slate-800">Next best step</div>
                <div className="mt-2 text-sm text-slate-600">
                  Focus on RC4 practice sets — your lowest mastery category.
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    component={Link}
                    href="/practice?rc=RC4%20%E2%80%A2%20Biological%20Processes%20%26%20Systems"
                    variant="solid"
                    color="primary"
                    size="sm"
                  >
                    Practice RC4
                  </Button>
                  <Button
                    component={Link}
                    href="/practice?rc=RC1%20%E2%80%A2%20Cell%20Structure%20%26%20Function"
                    variant="outlined"
                    color="neutral"
                    size="sm"
                  >
                    Practice RC1
                  </Button>
                </div>
              </SpotlightCard>
            </BentoCell>

            {/* Segments mastered */}
            <BentoCell>
              <SpotlightCard
                className="h-full rounded-2xl border bg-white p-5 shadow-sm"
                spotlightColor="rgba(16,185,129,0.2)"
              >
                <div className="text-sm font-semibold text-slate-800">Segments Mastered</div>
                <div className="mt-2 flex items-end gap-1">
                  <CountUp
                    to={masteredCount}
                    duration={1.4}
                    className="text-3xl font-semibold tabular-nums text-emerald-600"
                  />
                  <span className="mb-0.5 text-lg text-slate-400">/{segments.length}</span>
                </div>
                <div className="mt-3">
                  <LinearProgress
                    determinate
                    value={Math.round((masteredCount / segments.length) * 100)}
                    color="success"
                    size="sm"
                    sx={{ "--LinearProgress-radius": "9999px" }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500">75%+ threshold per segment</div>
              </SpotlightCard>
            </BentoCell>

            {/* Streak */}
            <BentoCell>
              <SpotlightCard
                className="h-full rounded-2xl border bg-white p-5 shadow-sm"
                spotlightColor="rgba(245,158,11,0.2)"
              >
                <div className="text-sm font-semibold text-slate-800" data-focus-hide="1">
                  Daily Streak
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <CountUp
                    to={3}
                    duration={1.2}
                    className="text-3xl font-semibold tabular-nums text-amber-500"
                  />
                  <span className="text-base text-slate-500">days</span>
                </div>
                <Chip
                  color="warning"
                  variant="soft"
                  size="sm"
                  sx={{ mt: 1.5 }}
                >
                  🔥 Keep it up
                </Chip>
              </SpotlightCard>
            </BentoCell>

            {/* Accuracy */}
            <BentoCell>
              <SpotlightCard
                className="h-full rounded-2xl border bg-white p-5 shadow-sm"
                spotlightColor="rgba(139,92,246,0.2)"
              >
                <div className="text-sm font-semibold text-slate-800" data-focus-hide="1">
                  Accuracy
                </div>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <CountUp
                    to={74}
                    duration={1.6}
                    className="text-3xl font-semibold tabular-nums text-violet-500"
                  />
                  <span className="text-lg text-slate-400">%</span>
                </div>
                <div className="mt-3">
                  <LinearProgress
                    determinate
                    value={74}
                    sx={{
                      "--LinearProgress-radius": "9999px",
                      "--LinearProgress-progressColor":
                        "linear-gradient(90deg, #a78bfa, #7c3aed)",
                    }}
                    size="sm"
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500">Last 20 checks (demo)</div>
              </SpotlightCard>
            </BentoCell>

            {/* Biome health */}
            <BentoCell>
              <SpotlightCard
                className="h-full rounded-2xl border bg-white p-5 shadow-sm"
                spotlightColor="rgba(20,184,166,0.2)"
              >
                <div className="text-sm font-semibold text-slate-800">Biome Score</div>
                <div className="mt-2 flex items-baseline gap-0.5">
                  <CountUp
                    to={biome.pct}
                    duration={1.5}
                    className="text-3xl font-semibold tabular-nums text-teal-500"
                  />
                  <span className="text-lg text-slate-400">%</span>
                </div>
                <div className="mt-3">
                  <LinearProgress
                    determinate
                    value={biome.pct}
                    color={biome.joyColor}
                    size="sm"
                    sx={{ "--LinearProgress-radius": "9999px" }}
                  />
                </div>
                <Chip
                  color={biome.joyColor}
                  variant="soft"
                  size="sm"
                  sx={{ mt: 1.5 }}
                >
                  {biome.level}
                </Chip>
              </SpotlightCard>
            </BentoCell>
          </BentoGrid>
        </Card>
      </PageContent>
    </main>
  );
}
