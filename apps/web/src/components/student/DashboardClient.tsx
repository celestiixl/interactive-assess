"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MasteryDonut, { type DonutSegment } from "@/components/student/MasteryDonut";
import { loadLearningProgress, getMostRecentLessonId } from "@/lib/learningProgress";
import { getXP, getStreak } from "@/lib/xp";
import { LEARNING_UNITS, type LearningLesson, type LearningUnit } from "@/lib/learningHubContent";
import { MOCK_STUDENT_ASSIGNMENTS } from "@/lib/studentAssignments";
import {
  PageShell, BsCard, BsTag, BsBtn, BsCardLabel, BsCardTitle,
} from "@/components/ui";

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
// Card wrapper with hover effect (kept for internal use)
// ---------------------------------------------------------------------------

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

  // v4 derived values
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
  const weekActivity = DAY_LABELS.map((_, i) => {
    if (i > todayIndex) return "" as const;
    return (weeklyStreak[i] ?? false) ? "active" as const : "past" as const;
  });
  const teksStatus = DEFAULT_SEGMENTS.slice(0, 8).map((seg) => {
    const v = seg.value <= 1 ? seg.value * 100 : seg.value;
    return {
      code: seg.key,
      variant: (v >= 75 ? "teal" : v >= 40 ? "gray" : "coral") as "teal" | "gray" | "coral",
    };
  });
  const continueHref = `/student/learn/${currentUnitId ?? "unit-1"}/${currentLesson?.slug ?? ""}`;
  const nextHref = `/student/learn/${nextUnitId ?? "unit-1"}/${nextLesson?.slug ?? ""}`;
  const dueLabel = dueAssignment
    ? new Date(dueAssignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";
  const challenge = { title: "Today's Question", subject: primaryTeks, xp: 10 };

  return (
    <PageShell>
      {/* ── Topbar ── */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-bs-muted">Good {timeOfDay}</p>
          <h1 className="font-display text-[40px] font-extrabold italic leading-none tracking-tight text-bs-ink">
            <span className="text-bs-teal-dark">{studentName}</span> ✦
          </h1>
          <p className="mt-1 text-[12px] text-bs-muted">
            Period 2 · Unit {heroUnitNum} · {todayLabel}
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <div className="flex items-center gap-1.5 rounded-bs-pill border border-[rgba(0,0,0,0.07)] bg-bs-surface px-3.5 py-1.5 text-[12px] font-medium text-bs-ink-2"
            aria-label={`${streakDays}-day streak`}>
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-bs-amber" aria-hidden="true" />
            {streakDays}-day streak
          </div>
          <div className="flex items-center gap-1.5 rounded-bs-pill border border-[rgba(0,0,0,0.07)] bg-bs-surface px-3.5 py-1.5 text-[12px] font-medium text-bs-ink-2"
            aria-label={`${xp} experience points`}>
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-bs-teal" aria-hidden="true" />
            {xp} XP
          </div>
        </div>
      </div>

      {/* ── Hero: continue lesson ── */}
      <div className="relative mb-3 overflow-hidden rounded-bs bg-bs-teal-deep p-7">
        {/* decorative orbs */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(0,196,154,0.22)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute bottom-[-60px] right-[120px] h-[160px] w-[160px] rounded-full bg-[radial-gradient(circle,rgba(0,196,154,0.1)_0%,transparent_70%)]" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-bs-teal">
              Continue where you left off
            </p>
            <h2 className="mb-1 font-display text-[26px] font-bold italic leading-snug text-white">
              {currentLesson?.title ?? "Start Learning"}
            </h2>
            <p className="mb-5 text-[12px] text-white/40">
              Unit {heroUnitNum} · {currentLesson?.minutes ?? 5} min read
            </p>
            <div className="flex items-center gap-2.5">
              <Link href={continueHref} aria-label={`Resume lesson: ${currentLesson?.title ?? "Start Learning"}`}>
                <BsBtn variant="hero" className="whitespace-nowrap">Resume lesson →</BsBtn>
              </Link>
              <BsTag variant="teal-inv">{primaryTeks}</BsTag>
            </div>
          </div>
          {/* progress ring */}
          <div className="flex-shrink-0 text-right">
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.05em] text-white/35">Progress</p>
            <svg width="72" height="72" viewBox="0 0 72 72" className="ml-auto">
              <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7"/>
              <circle cx="36" cy="36" r="28" fill="none" stroke="#00c49a" strokeWidth="7"
                strokeDasharray={`${(currentLessonPercent / 100) * 175.9} 175.9`}
                strokeLinecap="round" transform="rotate(-90 36 36)"/>
              <text x="36" y="33" textAnchor="middle" fontSize="13" fontWeight="700"
                fill="#fff" fontFamily="var(--font-fraunces),serif" fontStyle="italic">
                {currentLessonPercent}%
              </text>
              <text x="36" y="45" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)"
                fontFamily="var(--font-dm-sans),sans-serif">done</text>
            </svg>
          </div>
        </div>
      </div>

      {/* ── 2-col: next up + needs practice ── */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <BsCard variant="teal">
          <BsCardLabel>Unit {nextUnitNum} · Lesson {nextLessonNum}</BsCardLabel>
          <BsCardTitle className="mb-1">{nextLesson?.title ?? "Coming soon"}</BsCardTitle>
          <p className="mb-3 text-[12px] text-bs-muted">Next up in your playlist</p>
          {nextLesson && (
            <Link href={nextHref} aria-label={`View next lesson: ${nextLesson.title}`}>
              <BsBtn variant="teal">View lesson →</BsBtn>
            </Link>
          )}
        </BsCard>
        <BsCard variant="coral">
          <BsCardLabel className="text-bs-coral">Needs practice · {weakestTeks}</BsCardLabel>
          <BsCardTitle className="mb-1 text-[#8a1a05]">{weakestTeksTitle}</BsCardTitle>
          <p className="mb-3 text-[12px] text-bs-muted">Low mastery detected</p>
          <Link href="/student/learn/standards" aria-label={`Practice ${weakestTeks}`}>
            <BsBtn variant="coral">Practice now →</BsBtn>
          </Link>
        </BsCard>
      </div>

      {/* ── 3-col: streak + assignment + challenge ── */}
      <div className="mb-3 grid grid-cols-3 gap-3">
        <BsCard variant="amber" className="flex flex-col">
          <BsCardLabel className="text-[#8a5e00]">Your streak</BsCardLabel>
          <span className="font-display text-[44px] font-extrabold italic leading-none tracking-tight text-bs-amber">
            {streakDays}
          </span>
          <p className="mt-0.5 mb-2.5 text-[12px] text-[#8a5e00]">
            {streakDays === 0 ? "days — start one today!" : `day${streakDays !== 1 ? "s" : ""} and counting`}
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-bs-amber" style={{ width: `${Math.min((xp / 50) * 100, 100)}%` }} />
          </div>
          <p className="mt-1 text-[10px] font-medium text-[#8a5e00]">{xp} / 50 XP to next level</p>
        </BsCard>
        <BsCard>
          <BsCardLabel>Assignment</BsCardLabel>
          <BsCardTitle size="sm" className="mb-1">
            {dueAssignment?.title ?? "All caught up!"}
          </BsCardTitle>
          <p className="mb-2.5 text-[12px] text-bs-muted">
            {dueAssignment ? `${dueAssignment.questionCount} questions` : "No assignments due"}
          </p>
          {dueAssignment && <BsTag variant="coral">Due {dueLabel}</BsTag>}
        </BsCard>
        <BsCard variant="purple">
          <BsCardLabel className="text-[#4a2fc0]">Daily challenge</BsCardLabel>
          <BsCardTitle size="sm" className="mb-1 text-[#1a0060]">{challenge.title}</BsCardTitle>
          <p className="mb-2.5 text-[12px] text-[#7060c0]">{challenge.subject} · +{challenge.xp} XP</p>
          <Link href="/student/assessment/items" aria-label="Take today's daily challenge">
            <BsBtn variant="ghost" className="border-[rgba(124,92,252,0.25)] text-[#4a2fc0] text-[12px] px-3 py-1.5">
              Go →
            </BsBtn>
          </Link>
        </BsCard>
      </div>

      {/* ── Mastery donut + TEKS status ── */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <BsCard>
          <BsCardLabel className="mb-3.5">Overall mastery</BsCardLabel>
          <MasteryDonut segments={DEFAULT_SEGMENTS} size={200} />
        </BsCard>
        <BsCard>
          <BsCardLabel>TEKS status</BsCardLabel>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {teksStatus.map((t) => (
              <BsTag key={t.code} variant={t.variant}>{t.code}</BsTag>
            ))}
          </div>
          <BsCardLabel className="mt-4 mb-2">This week</BsCardLabel>
          <div className="flex gap-2">
            {DAY_ABBREV.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`h-[22px] w-[22px] rounded-full ${
                  weekActivity[i] === "active" ? "bg-bs-teal-dark" :
                  weekActivity[i] === "past"   ? "bg-bs-teal opacity-40" :
                  "bg-black/10"
                }`} />
                <span className="text-[9px] font-semibold tracking-[0.05em] text-bs-muted">{day}</span>
              </div>
            ))}
          </div>
        </BsCard>
      </div>

      {/* ── AI Tutor ── */}
      <Link
        href="/student/learn"
        aria-label="Ask the AI tutor"
        className="mb-3 flex w-full cursor-pointer items-center gap-3.5 rounded-bs border-none bg-bs-ink p-[18px_24px] no-underline"
      >
        <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[rgba(0,196,154,0.2)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c49a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <circle cx="12" cy="17" r="0.5" fill="#00c49a"/>
          </svg>
        </div>
        <div className="text-left">
          <p className="font-display text-[17px] font-bold italic text-white">Ask the AI tutor</p>
          <p className="mt-0.5 text-[11px] text-white/40">Get help with any biology concept, anytime</p>
        </div>
        <div className="ml-auto flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-bs-teal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003d2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </Link>

      {/* ── Bottom nav ── */}
      <nav className="flex justify-around rounded-bs border border-[rgba(0,0,0,0.06)] bg-bs-surface py-2.5 px-6" aria-label="Main navigation">
        {/* Dashboard (active) */}
        <Link href="/student/dashboard" aria-label="Dashboard" className="flex h-10 w-10 items-center justify-center rounded-bs-sm bg-bs-teal-soft">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006e55" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </Link>
        {/* Lessons */}
        <Link href="/student/learn" aria-label="Lessons" className="flex h-10 w-10 items-center justify-center rounded-bs-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8aada0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19V6a2 2 0 012-2h12a2 2 0 012 2v13"/><path d="M4 19h16"/><path d="M9 9h6M9 13h4"/>
          </svg>
        </Link>
        {/* Assignments */}
        <Link href="/student/assignments" aria-label="Assignments" className="flex h-10 w-10 items-center justify-center rounded-bs-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8aada0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/>
          </svg>
        </Link>
        {/* Profile */}
        <Link href="/student/profile" aria-label="Profile" className="flex h-10 w-10 items-center justify-center rounded-bs-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8aada0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
          </svg>
        </Link>
      </nav>
    </PageShell>
  );
}

