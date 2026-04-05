"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type DonutSegment } from "@/components/student/MasteryDonut";
import { loadLearningProgress, getMostRecentLessonId } from "@/lib/learningProgress";
import { getXP, getStreak } from "@/lib/xp";
import { LEARNING_UNITS, type LearningLesson, type LearningUnit } from "@/lib/learningHubContent";
import { MOCK_STUDENT_ASSIGNMENTS } from "@/lib/studentAssignments";
import { useStudentAuth } from "@/lib/studentAuth";
import BsTag, { type TagVariant } from "@/components/ui/BsTag";

// ---------------------------------------------------------------------------
// Design token constants (hex values must stay in sync with globals.css :root)
// Tailwind v4 requires static values here — CSS var refs are not resolvable at build time.
// ---------------------------------------------------------------------------

const C = {
  pageBg:    "#f0f4f2",
  tealDark:  "#006e55",
  tealDeep:  "#003d2e",
  teal:      "#00c49a",
  tealSoft:  "#d6f5ed",
  coral:     "#ff4f2b",
  coralSoft: "#ffe8e3",
  coralDark: "#8a1a05",
  amber:     "#f5a800",
  amberSoft: "#fff5d6",
  amberText: "#8a5e00",
  purple:    "#7c5cfc",
  purpleSoft:"#eeebff",
  purpleText:"#4a2fc0",
  purpleDark:"#1a0060",
  ink:       "#0a1a14",
  inkAlt:    "#2d4d3f",
  muted:     "#8aada0",
  surface:   "#ffffff",
} as const;

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
    <div
      className="min-h-screen font-body"
      style={{ background: C.pageBg }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* ── TOPBAR ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 2 }}>Good {timeOfDay}</p>
            <h1 style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: 40,
              fontWeight: 800,
              fontStyle: "italic",
              color: C.tealDark,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              margin: 0,
            }}>
              {student?.displayName ?? studentName} ✦
            </h1>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>
              Period {period} · {currentUnit} · {todayLabel}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20, background: C.surface, border: "1px solid rgba(0,0,0,0.07)", fontSize: 12, fontWeight: 500, color: C.inkAlt }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.amber, display: "inline-block" }} />
              {streakDays}-day streak
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20, background: C.surface, border: "1px solid rgba(0,0,0,0.07)", fontSize: 12, fontWeight: 500, color: C.inkAlt }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal, display: "inline-block" }} />
              {xp} XP
            </div>
          </div>
        </div>

        {/* ── HERO CARD ── */}
        <div style={{
          background: C.tealDeep,
          borderRadius: 16,
          padding: "28px 30px 24px",
          marginBottom: 12,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* decorative orb */}
          <div style={{
            position: "absolute", top: -80, right: -60,
            width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,196,154,0.22) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: C.teal, marginBottom: 8 }}>
                Continue where you left off
              </p>
              <h2 style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontSize: 26, fontWeight: 700, fontStyle: "italic",
                color: "white", lineHeight: 1.15, marginBottom: 4,
              }}>
                {continueLesson.title}
              </h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
                {continueLesson.unitLabel} · {continueLesson.readTime}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link
                  href={continueLesson.href}
                  style={{
                    background: C.teal, color: C.tealDeep,
                    border: "none", borderRadius: 10,
                    padding: "10px 20px", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", textDecoration: "none",
                    display: "inline-block",
                  }}
                  aria-label={`Resume lesson: ${continueLesson.title}`}
                >
                  Resume lesson →
                </Link>
                <BsTag variant="teal-inv">{continueLesson.teks}</BsTag>
              </div>
            </div>
            {/* Progress ring */}
            <div style={{ flexShrink: 0, textAlign: "right" }}>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Progress</p>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7"/>
                <circle cx="36" cy="36" r="28" fill="none" stroke={C.teal} strokeWidth="7"
                  strokeDasharray={`${((continueLesson.progress ?? 0) / 100) * 175.9} 175.9`}
                  strokeLinecap="round" transform="rotate(-90 36 36)"/>
                <text x="36" y="33" textAnchor="middle" fontSize="13" fontWeight="700"
                  fill="white" fontFamily="var(--font-fraunces),serif" fontStyle="italic">
                  {continueLesson.progress ?? 0}%
                </text>
                <text x="36" y="45" textAnchor="middle" fontSize="8"
                  fill="rgba(255,255,255,0.4)" fontFamily="sans-serif">done</text>
              </svg>
            </div>
          </div>
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>

          {/* LEFT COLUMN */}
          <div style={{ flex: "0 0 58%", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

            {/* 2-col: next lesson + needs practice */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

              {/* Next lesson — TEAL */}
              <div style={{ background: C.tealSoft, borderRadius: 16, border: "1px solid rgba(0,196,154,0.15)", padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.tealDark, marginBottom: 7 }}>
                  Unit {nextLessonData.unit} · Lesson {nextLessonData.lesson}
                </p>
                <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 3, lineHeight: 1.3 }}>
                  {nextLessonData.title}
                </h3>
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Next up in your playlist</p>
                <Link
                  href={nextLessonData.href}
                  style={{ background: C.tealDark, color: "white", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}
                  aria-label={`View lesson: ${nextLessonData.title}`}
                >
                  View lesson →
                </Link>
              </div>

              {/* Needs practice — CORAL */}
              <div style={{ background: C.coralSoft, borderRadius: 16, border: "1px solid rgba(255,79,43,0.12)", padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.coral, marginBottom: 7 }}>
                  Needs practice · {weakestTeks}
                </p>
                <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 16, fontWeight: 700, color: C.coralDark, marginBottom: 3, lineHeight: 1.3 }}>
                  {weakestTeksTitle}
                </h3>
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Low mastery detected</p>
                <Link
                  href="/student/learn/standards"
                  style={{ background: C.coral, color: "white", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}
                  aria-label={`Practice ${weakestTeks}`}
                >
                  Practice now →
                </Link>
              </div>
            </div>

            {/* 3-col: streak + assignment + challenge */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>

              {/* Streak — AMBER */}
              <div style={{ background: C.amberSoft, borderRadius: 16, border: "1px solid rgba(245,168,0,0.15)", padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.amberText, marginBottom: 7 }}>Your streak</p>
                <span style={{
                  fontFamily: "var(--font-fraunces), serif",
                  fontSize: 44, fontWeight: 800, fontStyle: "italic",
                  color: C.amber, lineHeight: 1, display: "block",
                }}>
                  {streakDays}
                </span>
                <p style={{ fontSize: 12, color: C.amberText, marginTop: 2, marginBottom: 10 }}>
                  {streakDays === 0 ? "days — start one today!" : `day${streakDays !== 1 ? "s" : ""} and counting`}
                </p>
                <div style={{ height: 6, background: "rgba(0,0,0,0.08)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((xp / 50) * 100, 100)}%`, background: C.amber, borderRadius: 3 }} />
                </div>
                <p style={{ fontSize: 10, color: C.amberText, fontWeight: 500, marginTop: 4 }}>{xp} / 50 XP to next level</p>
              </div>

              {/* Assignment — WHITE */}
              <div style={{ background: C.surface, borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 7 }}>Assignment</p>
                {dueAssignment ? (
                  <>
                    <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                      {assignmentData.title}
                    </h3>
                    <p style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{assignmentData.questionCount} questions</p>
                    <span style={{ background: "rgba(255,79,43,0.13)", color: "#c02a10", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>
                      Due {assignmentData.dueLabel}
                    </span>
                  </>
                ) : (
                  <p style={{ fontSize: 12, color: C.muted, fontStyle: "italic", marginTop: 4 }}>No assignments due</p>
                )}
              </div>

              {/* Challenge — PURPLE */}
              <div style={{ background: C.purpleSoft, borderRadius: 16, border: "1px solid rgba(124,92,252,0.15)", padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.purpleText, marginBottom: 7 }}>Daily challenge</p>
                <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 15, fontWeight: 700, color: C.purpleDark, marginBottom: 4 }}>
                  {challenge.title}
                </h3>
                <p style={{ fontSize: 12, color: "#7060c0", marginBottom: 10 }}>{challenge.subject} · +{challenge.xp} XP</p>
                <Link
                  href="/student/assessment/items"
                  style={{ background: "transparent", border: "1px solid rgba(124,92,252,0.25)", color: C.purpleText, borderRadius: 10, padding: "6px 12px", fontSize: 12, textDecoration: "none", display: "inline-block" }}
                  aria-label="Take today's daily challenge"
                >
                  Go →
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ flex: "0 0 40%", minWidth: 0, display: "flex", flexDirection: "column", gap: 12, position: "sticky", top: 24 }}>

            {/* Mastery ring */}
            <div style={{ background: C.surface, borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", padding: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>Overall mastery</p>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {isLoadingMastery ? (
                  <div style={{ width: 120, height: 120, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", border: `4px solid ${C.teal}`, borderTopColor: "transparent" }} />
                  </div>
                ) : (
                  <svg width="120" height="120" viewBox="0 0 140 140" style={{ flexShrink: 0 }} aria-label={`${ringOverallPct}% overall mastery`}>
                    <circle cx="70" cy="70" r={RING_R} fill="none" stroke="#e2e8f0" strokeWidth={RING_SW} />
                    {ringMastered > 0 && (
                      <circle cx="70" cy="70" r={RING_R} fill="none" stroke={C.teal} strokeWidth={RING_SW}
                        strokeDasharray={`${solidMastered} ${RING_CIRC}`} strokeDashoffset={0}
                        transform="rotate(-90 70 70)" strokeLinecap="round" />
                    )}
                    {ringLearned > 0 && (
                      <circle cx="70" cy="70" r={RING_R} fill="none" stroke="#7de3cb" strokeWidth={RING_SW}
                        strokeDasharray={`${solidLearned} ${RING_CIRC}`} strokeDashoffset={arcMastered}
                        transform="rotate(-90 70 70)" strokeLinecap="round" />
                    )}
                    {ringAttempted > 0 && (
                      <circle cx="70" cy="70" r={RING_R} fill="none" stroke="#ffa694" strokeWidth={RING_SW}
                        strokeDasharray={`${solidAttempted} ${RING_CIRC}`} strokeDashoffset={arcMastered + arcLearned}
                        transform="rotate(-90 70 70)" strokeLinecap="round" />
                    )}
                    <text x="70" y="66" textAnchor="middle" fontSize="26" fontWeight="800" fill={C.ink}
                      fontFamily="var(--font-fraunces),serif" fontStyle="italic">{ringOverallPct}%</text>
                    <text x="70" y="83" textAnchor="middle" fontSize="11" fill={C.muted}
                      fontFamily="var(--font-dm-sans),sans-serif">overall</text>
                  </svg>
                )}
                <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", margin: 0, padding: 0 }}>
                  <li style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, flexShrink: 0, borderRadius: "50%", background: C.teal, display: "inline-block" }} aria-hidden="true" />
                    <span style={{ color: C.ink }}>Mastered: <strong>{ringMastered}</strong></span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, flexShrink: 0, borderRadius: "50%", background: "#7de3cb", display: "inline-block" }} aria-hidden="true" />
                    <span style={{ color: C.ink }}>Learned: <strong>{ringLearned}</strong></span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, flexShrink: 0, borderRadius: "50%", background: "#ffa694", display: "inline-block" }} aria-hidden="true" />
                    <span style={{ color: C.ink }}>Attempted: <strong>{ringAttempted}</strong></span>
                  </li>
                </ul>
              </div>
            </div>

            {/* TEKS status + this week */}
            <div style={{ background: C.surface, borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", padding: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>TEKS status</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {teksStatus.map((t) => (
                  <BsTag key={t.code} variant={t.variant}>{t.code}</BsTag>
                ))}
              </div>
              <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginTop: 14, marginBottom: 8 }}>This week</p>
              <div style={{ display: "flex", gap: 7 }}>
                {DAY_ABBREV.map((day, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: weekActivity[i] === "active" ? C.tealDark :
                                    weekActivity[i] === "past"   ? "rgba(0,196,154,0.4)" :
                                    "rgba(0,0,0,0.1)",
                      }}
                      aria-label={
                        weekActivity[i] === "active" ? `${day} — today` :
                        weekActivity[i] === "past"   ? `${day} — completed` :
                        `${day} — no activity`
                      }
                    />
                    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", color: C.muted }}>{day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Tutor */}
            <Link
              href="/student/tutor"
              style={{
                background: C.ink, borderRadius: 16,
                padding: "16px 22px", display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer", textDecoration: "none",
              }}
              aria-label="Open AI tutor"
            >
              <div style={{
                width: 40, height: 40, background: "rgba(0,196,154,0.2)",
                borderRadius: 11, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
                  <circle cx="12" cy="17" r="0.5" fill={C.teal}/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-fraunces), serif", fontSize: 17, fontWeight: 700, fontStyle: "italic", color: "white", margin: 0 }}>Ask the AI tutor</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, marginTop: 2 }}>Get help with any biology concept</p>
              </div>
              <div style={{
                marginLeft: "auto", width: 34, height: 34,
                background: C.teal, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.tealDeep} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
