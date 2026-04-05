"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type DonutSegment } from "@/components/student/MasteryDonut";
import { loadLearningProgress, getMostRecentLessonId } from "@/lib/learningProgress";
import { getXP, getStreak } from "@/lib/xp";
import { LEARNING_UNITS, type LearningLesson, type LearningUnit } from "@/lib/learningHubContent";
import { MOCK_STUDENT_ASSIGNMENTS } from "@/lib/studentAssignments";
import { useStudentAuth } from "@/lib/studentAuth";
import PageShell from "@/components/ui/PageShell";
import BsCard from "@/components/ui/BsCard";
import BsTag, { type TagVariant } from "@/components/ui/BsTag";
import BsCardLabel from "@/components/ui/BsCardLabel";
import BsCardTitle from "@/components/ui/BsCardTitle";

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
// Builds DonutSegment[] from a flat mastery map { "B.5A": 0.82, ... }
// ---------------------------------------------------------------------------

function buildSegments(masteryMap: Record<string, number>): DonutSegment[] {
  return DEFAULT_SEGMENTS.map((seg) => ({
    ...seg,
    value: masteryMap[seg.key] ?? seg.value,
  }));
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DashboardClient(props: DashboardClientProps) {
  const student = useStudentAuth((s) => s.student);

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

  const [masterySegments, setMasterySegments] = useState<DonutSegment[]>(DEFAULT_SEGMENTS);
  const [isLoadingMastery, setIsLoadingMastery] = useState(false);
  const [masteryError, setMasteryError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const xpVal = getXP();
    const streakVal = getStreak();

    // Student name: prefer Zustand auth store (DB displayName), fall back to props
    const storedName = student?.displayName ?? props.studentName;

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
  }, [student?.displayName]);

  // Fetch mastery data from Prisma when student ID is available
  useEffect(() => {
    if (!student?.id) return;
    setIsLoadingMastery(true);
    setMasteryError(false);
    fetch(`/api/mastery?studentId=${student.id}`)
      .then((r) => r.json())
      .then((masteryMap: Record<string, number>) => {
        setMasterySegments(buildSegments(masteryMap));
      })
      .catch(() => {
        setMasteryError(true);
      })
      .finally(() => {
        setIsLoadingMastery(false);
      });
  }, [student?.id]);

  const { studentName, xp, streakDays, weeklyStreak, currentLesson, currentUnitId, nextLesson, nextUnitId, currentLessonPercent } = state;

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

  // Greeting / time of day
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

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

  // Weakest TEKS for practice card
  const weakestSegment = [...DEFAULT_SEGMENTS].sort((a, b) => (a.value ?? 0) - (b.value ?? 0))[0];
  const weakestTeks = props.weakestTeks ?? weakestSegment?.key ?? "B.6C";
  const weakestTeksTitle = props.weakestTeksTitle ?? (() => {
    for (const unit of LEARNING_UNITS) {
      for (const lesson of unit.lessons) {
        if (lesson.teks?.includes(weakestTeks)) return lesson.title;
      }
    }
    return "Cell Cycle Disruptions";
  })();

  // Derive weekActivity from weeklyStreak + today index
  const todayDow = new Date().getDay();
  const todayIndex = todayDow === 0 ? 6 : todayDow - 1;
  const weekActivity = weeklyStreak.map((done: boolean, i: number) => {
    if (i > todayIndex) return "";
    if (i === todayIndex && done) return "active";
    if (done) return "past";
    return "";
  });

  // Derive teksStatus from DEFAULT_SEGMENTS
  const teksStatus = DEFAULT_SEGMENTS.slice(0, 8).map((seg) => {
    const v = seg.value <= 1 ? seg.value * 100 : seg.value;
    const variant: TagVariant = v >= 75 ? "teal" : v >= 50 ? "amber" : "coral";
    return { code: seg.key, variant };
  });

  // Assemble continueLesson data
  const continueLesson = {
    title: currentLesson?.title ?? "Start your first lesson",
    unitLabel: `Unit ${heroUnitNum} · Lesson ${heroLessonNum}`,
    readTime: `${currentLesson?.minutes ?? 5} min read`,
    progress: currentLessonPercent,
    teks: primaryTeks,
    href: `/student/learn/${currentUnitId ?? "unit-1"}/${currentLesson?.slug ?? ""}`,
  };

  // Assemble nextLesson data
  const nextLessonData = {
    unit: nextUnitNum,
    lesson: nextLessonNum,
    title: nextLesson?.title ?? "Coming Soon",
    href: `/student/learn/${nextUnitId ?? "unit-1"}/${nextLesson?.slug ?? ""}`,
  };

  // Assemble assignment data
  const assignmentData = {
    title: dueAssignment?.title ?? "No pending assignment",
    questionCount: dueAssignment?.questionCount ?? 0,
    dueLabel: dueAssignment
      ? new Date(dueAssignment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "—",
  };

  // Daily challenge (static)
  const challenge = { title: "Today's Question", subject: "Cell Biology", xp: 10 };

  // Period / unit info
  const period = student?.period ?? "—";
  const currentUnit = `Unit ${heroUnitNum}`;
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  // ── Compact mastery ring (3-slice: mastered / learned / attempted) ──────────
  // normalizeToPercentage: values in [0,1] are multiplied ×100; values >1 pass through
  const normalizeToPercentage = (v: number) => (v <= 1 ? v * 100 : v);
  const masteryTotal = masterySegments.length > 0 ? masterySegments.length : 1;
  const ringMastered  = masterySegments.filter(s => normalizeToPercentage(s.value) >= 75).length;
  const ringLearned   = masterySegments.filter(s => { const v = normalizeToPercentage(s.value); return v >= 40 && v < 75; }).length;
  const ringAttempted = masteryTotal - ringMastered - ringLearned;
  const ringOverallPct = masterySegments.length > 0
    ? Math.round(masterySegments.reduce((a, s) => a + normalizeToPercentage(s.value), 0) / masterySegments.length)
    : 0;
  const RING_R    = 52;
  const RING_CIRC = 2 * Math.PI * RING_R;
  const RING_SW   = 13;
  const RING_GAP  = 2.5;
  const arcMastered  = (ringMastered  / masteryTotal) * RING_CIRC;
  const arcLearned   = (ringLearned   / masteryTotal) * RING_CIRC;
  const solidMastered  = Math.max(0, arcMastered  - RING_GAP);
  const solidLearned   = Math.max(0, arcLearned   - RING_GAP);
  const solidAttempted = Math.max(0, RING_CIRC - arcMastered - arcLearned - RING_GAP);

  return (
    <PageShell>
      {/* ── Topbar ── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] text-bs-muted">Good {timeOfDay}</p>
          <h1
            className="font-display text-[40px] font-extrabold italic leading-none tracking-tight text-bs-teal-dark"
          >
            {student?.displayName ?? studentName} ✦
          </h1>
          <p className="mt-1 text-[12px] text-bs-muted">
            Period {period} · {currentUnit} · {todayLabel}
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <div className="flex items-center gap-1.5 rounded-bs-pill border border-[rgba(0,0,0,0.07)] bg-bs-surface px-3.5 py-1.5 text-[12px] font-medium text-bs-ink-2">
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-bs-amber" />
            {streakDays}-day streak
          </div>
          <div className="flex items-center gap-1.5 rounded-bs-pill border border-[rgba(0,0,0,0.07)] bg-bs-surface px-3.5 py-1.5 text-[12px] font-medium text-bs-ink-2">
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-bs-teal" />
            {xp} XP
          </div>
        </div>
      </div>

      {/* ── Hero: continue lesson ── */}
      <div className="relative mb-3 overflow-hidden rounded-bs bg-bs-teal-deep p-5">
        {/* decorative orbs */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(0,196,154,0.22)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute bottom-[-60px] right-[120px] h-[160px] w-[160px] rounded-full bg-[radial-gradient(circle,rgba(0,196,154,0.1)_0%,transparent_70%)]" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-bs-teal">
              Continue where you left off
            </p>
            <h2 className="mb-1 font-display text-[22px] font-bold italic leading-snug text-white">
              {continueLesson.title}
            </h2>
            <p className="mb-3 text-[12px] text-white/40">
              {continueLesson.unitLabel} · {continueLesson.readTime}
            </p>
            <div className="flex items-center gap-2.5">
              <Link
                href={continueLesson.href}
                className="inline-flex cursor-pointer items-center gap-1 rounded-bs-sm border border-transparent bg-bs-teal px-4 py-2 text-[13px] font-bold font-body text-bs-teal-deep hover:opacity-90 whitespace-nowrap"
                aria-label={`Resume lesson: ${continueLesson.title}`}
              >
                Resume lesson →
              </Link>
              <BsTag variant="teal-inv">{continueLesson.teks}</BsTag>
            </div>
          </div>
          {/* progress ring — plain SVG */}
          <div className="flex-shrink-0 text-right">
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.05em] text-white/35">Progress</p>
            <svg width="72" height="72" viewBox="0 0 72 72" className="ml-auto">
              <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7"/>
              <circle cx="36" cy="36" r="28" fill="none" stroke="#00c49a" strokeWidth="7"
                strokeDasharray={`${(continueLesson.progress / 100) * 175.9} 175.9`}
                strokeLinecap="round" transform="rotate(-90 36 36)"/>
              <text x="36" y="33" textAnchor="middle" fontSize="13" fontWeight="700"
                fill="#fff" fontFamily="var(--font-fraunces),serif" fontStyle="italic">
                {continueLesson.progress}%
              </text>
              <text x="36" y="45" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.4)"
                fontFamily="var(--font-dm-sans),sans-serif">done</text>
            </svg>
          </div>
        </div>
      </div>

      {/* ── 2-col: next up + needs practice ── */}
      <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BsCard variant="teal">
          <BsCardLabel>Unit {nextLessonData.unit} · Lesson {nextLessonData.lesson}</BsCardLabel>
          <BsCardTitle className="mb-1">{nextLessonData.title}</BsCardTitle>
          <p className="mb-3 text-[12px] text-bs-muted">Next up in your playlist</p>
          <Link
            href={nextLessonData.href}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-bs-sm border border-transparent bg-bs-teal-dark px-4 py-2 text-[13px] font-medium font-body text-white hover:opacity-90"
            aria-label={`View lesson: ${nextLessonData.title}`}
          >
            View lesson →
          </Link>
        </BsCard>
        <BsCard variant="coral">
          <BsCardLabel className="text-bs-coral">Needs practice · {weakestTeks}</BsCardLabel>
          <BsCardTitle className="mb-1 text-[#8a1a05]">{weakestTeksTitle}</BsCardTitle>
          <p className="mb-3 text-[12px] text-bs-muted">Low mastery detected</p>
          <Link
            href="/student/learn/standards"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-bs-sm border border-transparent bg-bs-coral px-4 py-2 text-[13px] font-medium font-body text-white hover:opacity-90"
            aria-label={`Practice ${weakestTeks}`}
          >
            Practice now →
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
          {dueAssignment ? (
            <>
              <BsCardTitle size="sm" className="mb-1 text-bs-ink">{assignmentData.title}</BsCardTitle>
              <p className="mb-2.5 text-[12px] text-bs-muted">{assignmentData.questionCount} questions</p>
              <BsTag variant="coral">Due {assignmentData.dueLabel}</BsTag>
            </>
          ) : (
            <p className="text-[12px] text-bs-muted italic mt-1">No assignments due</p>
          )}
        </BsCard>
        <BsCard variant="purple">
          <BsCardLabel className="text-[#4a2fc0]">Daily challenge</BsCardLabel>
          <BsCardTitle size="sm" className="mb-1 text-[#1a0060]">{challenge.title}</BsCardTitle>
          <p className="mb-2.5 text-[12px] text-[#7060c0]">{challenge.subject} · +{challenge.xp} XP</p>
          <Link
            href="/student/assessment/items"
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1 rounded-bs-sm border border-[rgba(124,92,252,0.25)] bg-transparent px-3 py-1.5 text-[12px] font-medium font-body text-[#4a2fc0] hover:bg-bs-teal-soft"
            aria-label="Take today's daily challenge"
          >
            Go →
          </Link>
        </BsCard>
      </div>

      {/* ── 2-col: overall mastery + TEKS status ── */}
      <div className="mb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Mastery card — compact 3-slice SVG ring + legend */}
        <BsCard>
          <BsCardLabel>Overall mastery</BsCardLabel>
          <div className="mt-3 flex items-center gap-5">
            {isLoadingMastery ? (
              <div className="flex h-[120px] w-[120px] flex-shrink-0 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00c49a] border-t-transparent" />
              </div>
            ) : (
              /* Plain SVG ring: 3 stroked arcs stacked on one circle path */
              <svg width="120" height="120" viewBox="0 0 140 140" className="flex-shrink-0" aria-label={`${ringOverallPct}% overall mastery`}>
                {/* background track */}
                <circle cx="70" cy="70" r={RING_R} fill="none" stroke="#e2e8f0" strokeWidth={RING_SW} />
                {/* mastered arc (dark teal) */}
                {ringMastered > 0 && (
                  <circle cx="70" cy="70" r={RING_R} fill="none" stroke="#00c49a" strokeWidth={RING_SW}
                    strokeDasharray={`${solidMastered} ${RING_CIRC}`} strokeDashoffset={0}
                    transform="rotate(-90 70 70)" strokeLinecap="round" />
                )}
                {/* learned arc (light teal) */}
                {ringLearned > 0 && (
                  <circle cx="70" cy="70" r={RING_R} fill="none" stroke="#7de3cb" strokeWidth={RING_SW}
                    strokeDasharray={`${solidLearned} ${RING_CIRC}`} strokeDashoffset={arcMastered}
                    transform="rotate(-90 70 70)" strokeLinecap="round" />
                )}
                {/* attempted arc (salmon) */}
                {ringAttempted > 0 && (
                  <circle cx="70" cy="70" r={RING_R} fill="none" stroke="#ffa694" strokeWidth={RING_SW}
                    strokeDasharray={`${solidAttempted} ${RING_CIRC}`} strokeDashoffset={arcMastered + arcLearned}
                    transform="rotate(-90 70 70)" strokeLinecap="round" />
                )}
                {/* center label */}
                <text x="70" y="66" textAnchor="middle" fontSize="26" fontWeight="800" fill="#0a1a14"
                  fontFamily="var(--font-fraunces),serif" fontStyle="italic">{ringOverallPct}%</text>
                <text x="70" y="83" textAnchor="middle" fontSize="11" fill="#8aada0"
                  fontFamily="var(--font-dm-sans),sans-serif">overall</text>
              </svg>
            )}
            {/* legend */}
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              <li className="flex items-center gap-2 text-[13px]">
                <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#00c49a]" aria-hidden="true" />
                <span className="text-bs-ink">Mastered: <strong>{ringMastered}</strong></span>
              </li>
              <li className="flex items-center gap-2 text-[13px]">
                <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#7de3cb]" aria-hidden="true" />
                <span className="text-bs-ink">Learned: <strong>{ringLearned}</strong></span>
              </li>
              <li className="flex items-center gap-2 text-[13px]">
                <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#ffa694]" aria-hidden="true" />
                <span className="text-bs-ink">Attempted: <strong>{ringAttempted}</strong></span>
              </li>
            </ul>
          </div>
        </BsCard>

        {/* TEKS status + this week */}
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
                }`} aria-label={
                  weekActivity[i] === "active" ? `${day} — today` :
                  weekActivity[i] === "past"   ? `${day} — completed` :
                  `${day} — no activity`
                } />
                <span className="text-[9px] font-semibold tracking-[0.05em] text-bs-muted">{day}</span>
              </div>
            ))}
          </div>
        </BsCard>
      </div>

      {/* ── AI Tutor — full-width dark bar ── */}
      <Link
        href="/student/tutor"
        className="flex w-full cursor-pointer items-center gap-4 rounded-bs bg-bs-teal-deep p-4 no-underline"
        aria-label="Open AI tutor"
      >
        <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[rgba(0,196,154,0.2)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00c49a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <circle cx="12" cy="17" r="0.5" fill="#00c49a"/>
          </svg>
        </div>
        <div className="text-left">
          <p className="font-display text-[17px] font-bold italic text-white">Ask the AI tutor</p>
          <p className="mt-0.5 text-[11px] text-white/60">Get help with any biology concept, anytime</p>
        </div>
        <div className="ml-auto flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-bs-teal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#003d2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </Link>
    </PageShell>
  );
}
