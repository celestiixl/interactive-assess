"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import MasteryDonut, { type DonutSegment } from "@/components/student/MasteryDonut";
import { loadLearningProgress, getMostRecentLessonId } from "@/lib/learningProgress";
import { getXP, getStreak } from "@/lib/xp";
import { LEARNING_UNITS, type LearningLesson, type LearningUnit } from "@/lib/learningHubContent";
import { MOCK_STUDENT_ASSIGNMENTS } from "@/lib/studentAssignments";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardClientProps {
  studentName: string;
  currentLesson: LearningLesson | null;
  currentUnitId: string | null;
  nextLesson: LearningLesson | null;
  nextUnitId: string | null;
  weakestTeks: string | null;
  weakestTeksTitle: string | null;
  recentLesson: { title: string; score: number; completedAt: string } | null;
  dueAssignment: { title: string; dueDate: string; questionCount: number } | null;
  xp: number;
  streakDays: number;
  weeklyStreak: boolean[];
  masteryPercent: number;
}

// ---------------------------------------------------------------------------
// Default TEKS segments (same as existing dashboard demo data)
// ---------------------------------------------------------------------------

const DEFAULT_SEGMENTS: DonutSegment[] = [
  { key: "B.5A", label: "Biomolecules", value: 0.8, group: "B.5" },
  { key: "B.5B", label: "Prokaryote vs eukaryote", value: 0.54, group: "B.5" },
  { key: "B.5C", label: "Transport & homeostasis", value: 0.49, group: "B.5" },
  { key: "B.11A", label: "Photosynthesis & respiration", value: 0.55, group: "B.11" },
  { key: "B.11B", label: "Enzyme function", value: 0.51, group: "B.11" },
  { key: "B.7A", label: "DNA structure & traits", value: 0.56, group: "B.7" },
  { key: "B.7B", label: "Protein synthesis", value: 0.5, group: "B.7" },
  { key: "B.7C", label: "Mutations", value: 0.44, group: "B.7" },
  { key: "B.5D", label: "Viruses vs cells", value: 0.48, group: "B.5" },
  { key: "B.6A", label: "Cell cycle importance", value: 0.41, group: "B.6" },
  { key: "B.6B", label: "Differentiation", value: 0.46, group: "B.6" },
  { key: "B.6C", label: "Cell cycle disruptions", value: 0.39, group: "B.6" },
  { key: "B.8A", label: "Meiosis and diversity", value: 0.43, group: "B.8" },
];


// Day-of-week labels for streak display
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_ABBREV = ["M", "T", "W", "T", "F", "S", "S"];

// Build weekly streak booleans: index 0 = Monday of current week
function buildWeeklyStreak(streakDays: number): boolean[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun..6=Sat
  const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=Mon..6=Sun
  return DAY_LABELS.map((_, i) => {
    if (i > todayIndex) return false;
    const daysAgo = todayIndex - i;
    return daysAgo < streakDays;
  });
}

// Utility: how many days ago was a date string?
function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

// Resolve current+next lesson from progress map
function resolveCurrentAndNext(progress: Record<string, { lastVisitedAt: string; percent: number; completed: boolean }>): {
  currentLesson: LearningLesson | null;
  currentUnit: LearningUnit | null;
  nextLesson: LearningLesson | null;
  nextUnit: LearningUnit | null;
} {
  const recentId = getMostRecentLessonId(progress);

  for (let ui = 0; ui < LEARNING_UNITS.length; ui++) {
    const unit = LEARNING_UNITS[ui];
    for (let li = 0; li < unit.lessons.length; li++) {
      const lesson = unit.lessons[li];
      if (lesson.id === recentId) {
        // currentLesson is the most recently visited; nextLesson is the lesson after
        const nextLesson = unit.lessons[li + 1] ?? LEARNING_UNITS[ui + 1]?.lessons[0] ?? null;
        const nextUnit =
          unit.lessons[li + 1] != null
            ? unit
            : LEARNING_UNITS[ui + 1] ?? null;
        return { currentLesson: lesson, currentUnit: unit, nextLesson, nextUnit };
      }
    }
  }

  // No progress found - return first lesson
  const first = LEARNING_UNITS[0];
  return {
    currentLesson: first?.lessons[0] ?? null,
    currentUnit: first ?? null,
    nextLesson: first?.lessons[1] ?? null,
    nextUnit: first ?? null,
  };
}

// ---------------------------------------------------------------------------
// Client state shape
// ---------------------------------------------------------------------------

type DashState = {
  studentName: string;
  xp: number;
  streakDays: number;
  weeklyStreak: boolean[];
  currentLesson: DashboardClientProps["currentLesson"];
  currentUnitId: string | null;
  nextLesson: DashboardClientProps["nextLesson"];
  nextUnitId: string | null;
  recentLesson: DashboardClientProps["recentLesson"];
  currentLessonPercent: number;
};

// ---------------------------------------------------------------------------
// Card wrapper with hover effect
// ---------------------------------------------------------------------------

function DashCard({
  children,
  className = "",
  style,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -2 }}
      className={`rounded-2xl border border-bs-border bg-bs-surface p-5 transition-colors hover:border-bs-border-soft ${className}`}
      style={{ transition: "border-color 0.2s, box-shadow 0.2s", ...style }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DashboardClient(props: DashboardClientProps) {
  const [state, setState] = useState<DashState>({
    studentName: props.studentName,
    xp: props.xp,
    streakDays: props.streakDays,
    weeklyStreak: props.weeklyStreak,
    currentLesson: props.currentLesson,
    currentUnitId: props.currentUnitId,
    nextLesson: props.nextLesson,
    nextUnitId: props.nextUnitId,
    recentLesson: props.recentLesson,
    currentLessonPercent: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const xpVal = getXP();
    const streakVal = getStreak();

    let storedName = props.studentName;
    try {
      const n = window.localStorage.getItem("biospark.studentName");
      if (n) storedName = n;
    } catch {}

    const progress = loadLearningProgress();
    const { currentLesson: cl, currentUnit: cu, nextLesson: nl, nextUnit: nu } =
      resolveCurrentAndNext(progress);

    const currentLessonPercent = cl ? (progress[cl.id]?.percent ?? 0) : 0;

    let recentLesson: DashState["recentLesson"] = props.recentLesson;
    const completed = Object.entries(progress)
      .filter(([, row]) => row.completed)
      .sort((a, b) => (a[1].lastVisitedAt < b[1].lastVisitedAt ? 1 : -1));
    if (completed.length) {
      const [recentId, recentRow] = completed[0];
      for (const unit of LEARNING_UNITS) {
        const lesson = unit.lessons.find((l) => l.id === recentId);
        if (lesson) {
          recentLesson = {
            title: lesson.title,
            score: recentRow.checkScore ?? 0,
            completedAt: recentRow.lastVisitedAt,
          };
          break;
        }
      }
    }

    setState({
      studentName: storedName,
      xp: xpVal,
      streakDays: streakVal,
      weeklyStreak: buildWeeklyStreak(streakVal),
      currentLesson: cl ?? props.currentLesson,
      currentUnitId: cu?.id ?? props.currentUnitId,
      nextLesson: nl ?? props.nextLesson,
      nextUnitId: nu?.id ?? props.nextUnitId,
      recentLesson,
      currentLessonPercent,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { studentName, xp, streakDays, weeklyStreak, currentLesson, currentUnitId, nextLesson, nextUnitId, recentLesson, currentLessonPercent } = state;

  // Due assignment - use props or first not-started from mock
  const dueAssignment = props.dueAssignment ?? (() => {
    const asgn = MOCK_STUDENT_ASSIGNMENTS.find(
      (a) => a.status === "not_started" && a.dueDate != null
    );
    if (!asgn) return null;
    return {
      title: asgn.title,
      dueDate: asgn.dueDate!,
      questionCount: asgn.totalItems,
    };
  })();

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Current lesson info for hero card
  const heroUnit = currentUnitId
    ? LEARNING_UNITS.find((u) => u.id === currentUnitId)
    : LEARNING_UNITS[0];
  const heroLessonIndex = heroUnit
    ? heroUnit.lessons.findIndex((l) => l.id === currentLesson?.id)
    : 0;
  const heroUnitNum = heroUnit?.unitNumber ?? 1;
  const heroLessonNum = heroLessonIndex >= 0 ? heroLessonIndex + 1 : 1;
  const primaryTeks = currentLesson?.teks?.[0] ?? (heroUnit?.teks[0] ?? "B.5A");

  // Next lesson unit info
  const nextUnit = nextUnitId ? LEARNING_UNITS.find((u) => u.id === nextUnitId) : LEARNING_UNITS[0];
  const nextLessonIndex = nextUnit
    ? nextUnit.lessons.findIndex((l) => l.id === nextLesson?.id)
    : 1;
  const nextUnitNum = nextUnit?.unitNumber ?? 1;
  const nextLessonNum = nextLessonIndex >= 0 ? nextLessonIndex + 1 : 2;

  // Weakest TEKS for focus standard card
  const weakestSegment = [...DEFAULT_SEGMENTS].sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];
  const weakestTeks = props.weakestTeks ?? weakestSegment?.key ?? "B.6C";
  const weakestTeksBarPct = Math.round(
    ((weakestSegment?.value ?? 0) <= 1
      ? (weakestSegment?.value ?? 0) * 100
      : (weakestSegment?.value ?? 0))
  );
  const weakestTeksTitle = props.weakestTeksTitle ?? (() => {
    for (const unit of LEARNING_UNITS) {
      for (const lesson of unit.lessons) {
        if (lesson.teks?.includes(weakestTeks)) return lesson.title;
      }
    }
    return "Cell Cycle Disruptions";
  })();

  const todayIndex = (() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  })();

  return (
    <div className="relative min-h-screen">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-3 px-4 pb-5 pt-6 sm:px-8"
      >
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-bs-text"
            style={{ fontFamily: "var(--bs-font-ui)" }}
          >
            {greeting},{" "}
            <span style={{ color: "var(--bs-teal)" }}>{studentName}</span>
            {" "}&#10022;
          </h1>
          <p className="mt-0.5 text-sm text-bs-text-sub">
            Period 2 &middot; Unit {heroUnitNum} &middot; Today
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak pill */}
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{
              background: "rgba(245,166,35,0.15)",
              color: "var(--bs-amber)",
              border: "1px solid rgba(245,166,35,0.25)",
            }}
            aria-label={`${streakDays}-day streak`}
          >
            <span aria-hidden="true">&#128293;</span>
            <span>{streakDays}-day streak</span>
          </div>

          {/* XP pill */}
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{
              fontFamily: "var(--bs-font-mono)",
              background: "rgba(245,166,35,0.1)",
              color: "var(--bs-text-sub)",
              border: "1px solid rgba(245,166,35,0.15)",
            }}
            aria-label={`${xp} XP earned`}
          >
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "var(--bs-amber)" }}
            />
            <span>{xp} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid gap-5 px-4 pb-10 sm:px-8 lg:grid-cols-[1fr_300px]">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT COLUMN                                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col gap-5">
          {/* Hero card */}
          {currentLesson ? (
            <DashCard delay={0.04}>
              {/* Eyebrow */}
              <div
                className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "var(--bs-font-mono)", color: "var(--bs-teal)" }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    background: "var(--bs-teal)",
                    boxShadow: "0 0 6px var(--bs-teal)",
                    animation: "bsPulse 2s ease-in-out infinite",
                  }}
                />
                Continue where you left off
              </div>

              {/* Title */}
              <h2
                className="text-2xl font-bold text-bs-text"
                style={{ fontFamily: "var(--bs-font-ui)" }}
              >
                {currentLesson.title}
              </h2>

              {/* Meta */}
              <p className="mt-1.5 text-sm text-bs-text-sub">
                Unit {heroUnitNum} &middot; Lesson {heroLessonNum} &middot; {currentLesson.minutes} min read
              </p>

              {/* Progress bar */}
              <div className="relative mt-4 h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${currentLessonPercent}%`,
                    background: "linear-gradient(90deg, var(--bs-teal), rgba(0,212,170,0.6))",
                    boxShadow: "2px 0 8px var(--bs-teal)",
                  }}
                />
                {currentLessonPercent > 0 && (
                  <div
                    aria-hidden="true"
                    className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full"
                    style={{
                      left: `calc(${currentLessonPercent}% - 6px)`,
                      background: "var(--bs-teal)",
                      boxShadow: "0 0 8px var(--bs-teal)",
                    }}
                  />
                )}
              </div>

              {/* Footer row */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/student/learn/${currentUnitId ?? "unit-1"}/${currentLesson.slug}`}
                  className="inline-flex items-center rounded-full px-5 py-2 text-sm font-bold transition hover:opacity-90"
                  style={{
                    background: "var(--bs-teal)",
                    color: "#0d1e2c",
                  }}
                  aria-label={`Resume lesson: ${currentLesson.title}`}
                >
                  Resume Lesson &#8594;
                </Link>

                {/* TEKS badge */}
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "rgba(0,212,170,0.12)",
                    color: "var(--bs-teal)",
                    border: "1px solid rgba(0,212,170,0.25)",
                    fontFamily: "var(--bs-font-mono)",
                  }}
                >
                  {primaryTeks}
                </span>
              </div>
            </DashCard>
          ) : (
            <DashCard delay={0.04}>
              <p className="text-bs-text-sub">Ready to start your biology journey?</p>
              <Link
                href="/student/learn"
                className="mt-3 inline-flex items-center rounded-full px-5 py-2 text-sm font-bold transition hover:opacity-90"
                style={{ background: "var(--bs-teal)", color: "#0d1e2c" }}
                aria-label="Start learning"
              >
                Start Learning &#8594;
              </Link>
            </DashCard>
          )}

          {/* Row 2: Next Up + Focus Standard */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Next Up card */}
            <DashCard delay={0.1}>
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-bs-text-muted"
                style={{ fontFamily: "var(--bs-font-mono)" }}
              >
                Unit {nextUnitNum} &middot; Lesson {nextLessonNum}
              </p>
              <h3
                className="text-base font-bold text-bs-text"
                style={{ fontFamily: "var(--bs-font-ui)" }}
              >
                {nextLesson?.title ?? "Next lesson coming soon"}
              </h3>
              {nextLesson && (
                <Link
                  href={`/student/learn/${nextUnitId ?? "unit-1"}/${nextLesson.slug}`}
                  className="mt-3 block text-sm font-semibold transition hover:opacity-80"
                  style={{ color: "var(--bs-teal)" }}
                  aria-label={`Go to next lesson: ${nextLesson.title}`}
                >
                  View lesson &#8594;
                </Link>
              )}
              {/* Empty progress bar */}
              <div
                className="mt-3 h-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </DashCard>

            {/* Focus Standard card */}
            <DashCard
              delay={0.1}
              style={{ borderColor: "rgba(255,107,107,0.2)" }}
            >
              <p
                className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
                style={{ fontFamily: "var(--bs-font-mono)", color: "var(--bs-coral)" }}
              >
                Needs practice &middot; {weakestTeks}
              </p>
              <h3
                className="text-base font-bold text-bs-text"
                style={{ fontFamily: "var(--bs-font-ui)" }}
              >
                {weakestTeksTitle}
              </h3>
              <Link
                href="/student/learn/standards"
                className="mt-3 block text-sm font-semibold transition hover:opacity-80"
                style={{ color: "var(--bs-coral)" }}
                aria-label={`Practice ${weakestTeks}`}
              >
                Practice now &#8594;
              </Link>
              {/* Coral low-mastery bar */}
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${weakestTeksBarPct}%`,
                    background: "var(--bs-coral)",
                    opacity: 0.7,
                  }}
                />
              </div>
            </DashCard>
          </div>

          {/* Row 3: Activity cards */}
          <div className="grid gap-5 sm:grid-cols-3">
            {/* Recent lesson */}
            <DashCard delay={0.17}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
                  style={{ background: "rgba(52,211,153,0.15)", color: "var(--bs-success)" }}
                >
                  &#10003;
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest text-bs-text-muted"
                  style={{ fontFamily: "var(--bs-font-mono)" }}
                >
                  Recent
                </span>
              </div>
              {recentLesson ? (
                <>
                  <p className="line-clamp-2 text-sm font-semibold text-bs-text">
                    {recentLesson.title}
                  </p>
                  <p className="mt-1 text-xs text-bs-text-sub">
                    Completed &middot; {daysAgo(recentLesson.completedAt)} days ago
                  </p>
                  <p
                    className="mt-1 text-sm font-bold"
                    style={{ color: "var(--bs-success)" }}
                    aria-label={`Score: ${recentLesson.score}%`}
                  >
                    {recentLesson.score}%
                  </p>
                </>
              ) : (
                <p className="text-sm text-bs-text-sub">No completed lessons yet.</p>
              )}
            </DashCard>

            {/* Assignment */}
            <DashCard delay={0.17}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
                  style={{ background: "rgba(245,166,35,0.15)", color: "var(--bs-amber)" }}
                >
                  &#128203;
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest text-bs-text-muted"
                  style={{ fontFamily: "var(--bs-font-mono)" }}
                >
                  Assignment
                </span>
              </div>
              {dueAssignment ? (
                <>
                  <p className="line-clamp-2 text-sm font-semibold text-bs-text">
                    {dueAssignment.title}
                  </p>
                  <p className="mt-1 text-xs text-bs-text-sub">
                    {dueAssignment.questionCount} questions
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        background: "rgba(245,166,35,0.15)",
                        color: "var(--bs-amber)",
                      }}
                    >
                      Due {new Date(dueAssignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-bs-text-sub">All caught up! &#127881;</p>
              )}
            </DashCard>

            {/* Daily challenge */}
            <DashCard delay={0.17}>
              <div className="mb-2 flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm"
                  style={{ background: "rgba(0,212,170,0.15)", color: "var(--bs-teal)" }}
                >
                  &#9889;
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest text-bs-text-muted"
                  style={{ fontFamily: "var(--bs-font-mono)" }}
                >
                  Daily challenge
                </span>
              </div>
              <p className="text-sm font-semibold text-bs-text">Today&apos;s Question</p>
              <p className="mt-1 text-xs text-bs-text-sub">
                Cell Biology &middot; +10 XP available
              </p>
              <Link
                href="/student/assessment/items"
                className="mt-3 block text-sm font-bold transition hover:opacity-80"
                style={{ color: "var(--bs-teal)" }}
                aria-label="Take today's daily challenge"
              >
                Go &#8594;
              </Link>
            </DashCard>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT COLUMN - Mastery panel                                        */}
        {/* ------------------------------------------------------------------ */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="flex flex-col gap-4 rounded-2xl border border-bs-border bg-bs-surface p-5"
        >
          {/* Label */}
          <p
            className="text-[10px] font-semibold uppercase tracking-widest text-bs-text-muted"
            style={{ fontFamily: "var(--bs-font-mono)" }}
          >
            Mastery
          </p>

          {/* Donut */}
          <div className="overflow-hidden">
            <MasteryDonut segments={DEFAULT_SEGMENTS} size={280} />
          </div>

          {/* TEKS chips */}
          <div>
            <p className="mb-2 text-xs font-semibold text-bs-text-sub">TEKS Status</p>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_SEGMENTS.slice(0, 6).map((seg) => {
                const v = seg.value <= 1 ? seg.value * 100 : seg.value;
                const color =
                  v >= 75
                    ? "rgba(52,211,153,0.15)"
                    : v >= 50
                    ? "rgba(245,166,35,0.15)"
                    : "rgba(255,107,107,0.15)";
                const textColor =
                  v >= 75
                    ? "var(--bs-success)"
                    : v >= 50
                    ? "var(--bs-amber)"
                    : "var(--bs-coral)";
                return (
                  <span
                    key={seg.key}
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: color, color: textColor }}
                    aria-label={`${seg.key}: ${Math.round(v)}% mastery`}
                  >
                    {seg.key}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Weekly streak dots */}
          <div>
            <p className="mb-2 text-xs font-semibold text-bs-text-sub">This Week</p>
            <div className="flex items-center justify-between gap-1">
              {DAY_LABELS.map((label, i) => {
                const done = weeklyStreak[i] ?? false;
                const isToday = i === todayIndex;
                return (
                  <div key={`${label}-${i}`} className="flex flex-col items-center gap-1">
                    <div
                      aria-label={`${label}: ${done ? "done" : isToday ? "today" : "not yet"}`}
                      className="h-6 w-6 rounded-sm transition-all"
                      style={{
                        background: isToday
                          ? "var(--bs-teal)"
                          : done
                          ? "rgba(0,212,170,0.3)"
                          : "rgba(255,255,255,0.06)",
                        border: done || isToday
                          ? "1px solid rgba(0,212,170,0.5)"
                          : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: isToday ? "0 0 8px rgba(0,212,170,0.5)" : "none",
                      }}
                    />
                    <span
                      className="text-[9px] font-semibold"
                      style={{ color: isToday ? "var(--bs-teal)" : "var(--bs-text-muted)" }}
                    >
                      {DAY_ABBREV[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
