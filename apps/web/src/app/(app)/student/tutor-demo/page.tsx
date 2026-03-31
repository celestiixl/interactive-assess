"use client";

import { useState } from "react";
import { BackLink } from "@/components/nav/BackLink";
import PageBanner from "@/components/ui/PageBanner";
import { PageContent } from "@/components/ui/PageShell";
import { TutorWidget } from "@/components/student/TutorWidget";
import type { TutorTrigger } from "@/types/tutor";

// ── Demo constants ────────────────────────────────────────────────────────────
const DEMO_STUDENT_ID = "demo-student-001";

const LESSON_OPTIONS: { slug: string; label: string; teks: string }[] = [
  { slug: "biomolecules-and-cell-structure", label: "Biomolecules & Cell Structure", teks: "B.5A / B.5B" },
  { slug: "cell-transport-and-homeostasis", label: "Cell Transport & Homeostasis", teks: "B.5C" },
  { slug: "enzymes-photosynthesis-respiration", label: "Enzymes, Photosynthesis & Respiration", teks: "B.11A / B.11B" },
  { slug: "dna-structure-and-replication", label: "DNA Structure & Replication", teks: "B.7A" },
  { slug: "transcription-and-translation", label: "Transcription & Translation", teks: "B.7B" },
  { slug: "mutations-and-significance", label: "Mutations & Significance", teks: "B.7C" },
  { slug: "cell-growth", label: "Cell Growth", teks: "" },
  { slug: "disruptions-cell-cycle", label: "Disruptions of the Cell Cycle", teks: "" },
  { slug: "plant-transport-and-vascular-systems", label: "Plant Transport & Vascular Systems", teks: "B.12B" },
  { slug: "plant-reproduction", label: "Plant Reproduction", teks: "B.12B" },
  { slug: "plant-responses-and-hormones", label: "Plant Responses & Hormones", teks: "B.12B" },
  { slug: "plant-systems-integration", label: "Plant Systems Integration", teks: "B.12B" },
];

const TRIGGER_OPTIONS: { value: TutorTrigger; label: string; emoji: string; description: string }[] = [
  { value: "student", emoji: "💬", label: "Student-initiated", description: "Student opened the chat themselves" },
  { value: "wrong-answer", emoji: "❌", label: "Wrong answer", description: "Triggered after an incorrect quick-check answer" },
  { value: "failed-attempts", emoji: "🔄", label: "Failed attempts", description: "Triggered after multiple failed attempts" },
  { value: "time-on-section", emoji: "⏱️", label: "Time on section", description: "Student has been on a section too long" },
];

const FEATURE_CARDS: { icon: string; title: string; body: string }[] = [
  {
    icon: "🎯",
    title: "Adaptive to mastery",
    body: "Derives your learning level from live mastery data and adjusts the scaffolding — more guidance for developing learners, richer depth for advanced ones.",
  },
  {
    icon: "🧠",
    title: "Socratic by design",
    body: "Never gives away answers directly. Guides you with questions, hints, and worked examples so understanding sticks rather than just passing the check.",
  },
  {
    icon: "📊",
    title: "Intervention-aware",
    body: "Returns an intervention tier with every reply. Tier 2 triggers graphic organizers; Tier 3 unlocks intensive scaffolding and simplified materials.",
  },
  {
    icon: "🔬",
    title: "TEKS-anchored",
    body: "Every response is grounded in the specific TEKS standard for the lesson — B.5A, B.7B, B.11A, and more — keeping feedback curriculum-aligned.",
  },
];

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#0d1117",
  surface: "#13171f",
  surfaceAlt: "#0f1319",
  border: "#21262d",
  borderLight: "#30363d",
  accent: "#6366f1",
  accentGlow: "rgba(99,102,241,0.18)",
  text: "#e6edf3",
  textSub: "#8b949e",
  textDim: "#c9d1d9",
  success: "#10b981",
  warning: "#f59e0b",
};

// ── Page component ────────────────────────────────────────────────────────────
export default function TutorDemoPage() {
  const [lessonSlug, setLessonSlug] = useState(LESSON_OPTIONS[0].slug);
  const [trigger, setTrigger] = useState<TutorTrigger>("student");
  // key forces TutorWidget to remount (reset) when lesson/trigger change
  const [widgetKey, setWidgetKey] = useState(0);

  const currentLesson = LESSON_OPTIONS.find((l) => l.slug === lessonSlug)!;
  const currentTrigger = TRIGGER_OPTIONS.find((t) => t.value === trigger)!;

  function applySettings() {
    setWidgetKey((k) => k + 1);
  }

  return (
    <main
      className="min-h-dvh flex flex-col"
      style={{ background: C.bg, color: C.text }}
    >
      <BackLink href="/student/dashboard" label="Back to dashboard" />

      <PageBanner
        title="AI Tutor — Visual Demo"
        subtitle="Interact with the live BioSpark Tutor. Configure the context below, then click the 🧬 button."
      />

      <PageContent className="flex-1 py-8 pb-28">
        {/* ── Hero section ──────────────────────────────────────────────── */}
        <HeroSection />

        {/* ── Static in-use mockup ──────────────────────────────────────── */}
        <MockupSection />

        {/* ── Configuration + widget showcase ───────────────────────────── */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: config panel */}
          <div className="flex flex-col gap-6">
            <ConfigCard
              lessonSlug={lessonSlug}
              trigger={trigger}
              currentLesson={currentLesson}
              currentTrigger={currentTrigger}
              onLessonChange={setLessonSlug}
              onTriggerChange={setTrigger}
              onApply={applySettings}
            />
            <FeaturesGrid />
          </div>

          {/* Right: live widget preview */}
          <div>
            <WidgetShowcase
              key={widgetKey}
              lessonSlug={lessonSlug}
              lessonLabel={`${currentLesson.label}${currentLesson.teks ? ` (${currentLesson.teks})` : ""}`}
              trigger={trigger}
              studentId={DEMO_STUDENT_ID}
            />
          </div>
        </section>
      </PageContent>

    </main>
  );
}

// ── Section components ─────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <div
      className="rounded-3xl p-8 sm:p-10 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #13152a 0%, #1a1045 50%, #0e1620 100%)`,
        border: `1px solid rgba(99,102,241,0.3)`,
        boxShadow: `inset 0 0 80px rgba(99,102,241,0.05)`,
      }}
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-60px",
          left: "30%",
          width: "320px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
        {/* Avatar */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-2xl"
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)",
            fontSize: "40px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.4)",
          }}
          aria-hidden="true"
        >
          🧬
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold" style={{ color: "#e0e7ff" }}>
              BioSpark Tutor
            </h2>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: "rgba(99,102,241,0.2)",
                border: "1px solid rgba(99,102,241,0.4)",
                color: "#a5b4fc",
              }}
            >
              Powered by Claude
            </span>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
                color: "#6ee7b7",
              }}
            >
              ● Live
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-xl" style={{ color: "#94a3b8" }}>
            An adaptive Socratic tutor anchored to FBISD Biology TEKS standards. Adjusts
            scaffolding in real time based on student mastery, and flags intervention needs
            for teachers automatically.
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {["B.5A", "B.5B", "B.7B", "B.11A", "B.11B", "B.12B"].map((t) => (
              <span
                key={t}
                className="rounded px-2 py-0.5 font-mono text-xs font-semibold"
                style={{ background: "#1e2d3e", color: "#67e8f9" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigCard({
  lessonSlug,
  trigger,
  currentLesson,
  currentTrigger,
  onLessonChange,
  onTriggerChange,
  onApply,
}: {
  lessonSlug: string;
  trigger: TutorTrigger;
  currentLesson: (typeof LESSON_OPTIONS)[0];
  currentTrigger: (typeof TRIGGER_OPTIONS)[0];
  onLessonChange: (slug: string) => void;
  onTriggerChange: (t: TutorTrigger) => void;
  onApply: () => void;
}) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: C.textSub }}>
        Demo Configuration
      </h3>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Lesson */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="lesson-select"
            className="text-xs font-medium"
            style={{ color: C.textSub }}
          >
            Lesson context
          </label>
          <select
            id="lesson-select"
            value={lessonSlug}
            onChange={(e) => onLessonChange(e.target.value)}
            aria-label="Select lesson"
            className="rounded-xl px-3 py-2.5 text-sm outline-none appearance-none"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.borderLight}`,
              color: C.text,
            }}
          >
            {LESSON_OPTIONS.map((opt) => (
              <option key={opt.slug} value={opt.slug}>
                {opt.label}
                {opt.teks ? ` — ${opt.teks}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Trigger */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="trigger-select"
            className="text-xs font-medium"
            style={{ color: C.textSub }}
          >
            Invocation trigger
          </label>
          <select
            id="trigger-select"
            value={trigger}
            onChange={(e) => onTriggerChange(e.target.value as TutorTrigger)}
            aria-label="Select trigger"
            className="rounded-xl px-3 py-2.5 text-sm outline-none appearance-none"
            style={{
              background: C.surfaceAlt,
              border: `1px solid ${C.borderLight}`,
              color: C.text,
            }}
          >
            {TRIGGER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.emoji} {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active summary */}
      <div
        className="mt-4 rounded-xl p-3 flex flex-wrap gap-4 text-xs"
        style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
      >
        <div>
          <span style={{ color: C.textSub }}>Lesson: </span>
          <span style={{ color: C.textDim, fontWeight: 600 }}>{currentLesson.label}</span>
          {currentLesson.teks && (
            <span
              className="ml-2 rounded px-1.5 py-0.5 font-mono font-semibold"
              style={{ background: "#1e2d3e", color: "#67e8f9", fontSize: "10px" }}
            >
              {currentLesson.teks}
            </span>
          )}
        </div>
        <div>
          <span style={{ color: C.textSub }}>Trigger: </span>
          <span style={{ color: C.textDim, fontWeight: 600 }}>
            {currentTrigger.emoji} {currentTrigger.label}
          </span>
        </div>
        <div>
          <span style={{ color: C.textSub }}>Student: </span>
          <span
            className="rounded px-1.5 py-0.5 font-mono"
            style={{ background: C.accentGlow, color: "#a5b4fc", fontSize: "10px" }}
          >
            {DEMO_STUDENT_ID}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onApply}
        aria-label="Apply configuration and reset conversation"
        className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold transition"
        style={{
          background: C.accent,
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Apply &amp; Reset Conversation
      </button>
      <p className="mt-1.5 text-center text-xs" style={{ color: C.textSub }}>
        Then click the 🧬 button in the widget on the right
      </p>
    </div>
  );
}

function FeaturesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FEATURE_CARDS.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl p-5"
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
          }}
        >
          <div className="text-2xl mb-3" aria-hidden="true">{card.icon}</div>
          <p className="text-sm font-semibold mb-1" style={{ color: C.text }}>
            {card.title}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: C.textSub }}>
            {card.body}
          </p>
        </div>
      ))}
    </div>
  );
}

function WidgetShowcase({
  lessonSlug,
  lessonLabel,
  trigger,
  studentId,
}: {
  lessonSlug: string;
  lessonLabel: string;
  trigger: TutorTrigger;
  studentId: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 sticky top-20"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div>
        <h3 className="text-sm font-semibold" style={{ color: C.text }}>
          Live Widget
        </h3>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: C.textSub }}>
          The 🧬 button below is the actual floating trigger. Click it to open the chat
          panel and start a real conversation with the tutor.
        </p>
      </div>

      {/* Simulated phone frame */}
      <div
        className="relative flex items-end justify-end rounded-2xl overflow-hidden"
        style={{
          height: "480px",
          background:
            "linear-gradient(160deg, #0d1117 0%, #13152a 50%, #0d1117 100%)",
          border: `1px solid ${C.borderLight}`,
        }}
        aria-label="Widget preview area"
      >
        {/* Decorative grid pattern */}
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.04,
          }}
        >
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#6366f1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Decorative label */}
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "rgba(165,180,252,0.7)",
            }}
          >
            Student lesson view
          </span>
        </div>

        {/* Mock lesson content hint */}
        <div
          className="absolute"
          style={{
            top: "52px",
            left: "16px",
            right: "80px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
          aria-hidden="true"
        >
          {[100, 80, 90, 60].map((w, i) => (
            <div
              key={i}
              style={{
                height: i === 0 ? "14px" : "10px",
                width: `${w}%`,
                borderRadius: "6px",
                background: "rgba(255,255,255,0.04)",
              }}
            />
          ))}
          <div style={{ height: "24px" }} />
          {[85, 70, 95, 55, 75].map((w, i) => (
            <div
              key={i}
              style={{
                height: "10px",
                width: `${w}%`,
                borderRadius: "6px",
                background: "rgba(255,255,255,0.03)",
              }}
            />
          ))}
        </div>

        {/* The actual TutorWidget — inline position inside the frame */}
        <div style={{ position: "absolute", bottom: "16px", right: "16px" }}>
          <TutorWidget
            lessonSlug={lessonSlug}
            lessonLabel={lessonLabel}
            studentId={studentId}
            triggeredBy={trigger}
            defaultOpen={false}
            position="inline"
          />
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: C.textSub }}>
        The widget floats at bottom-right in real lesson pages
      </p>
    </div>
  );
}

// ── Static in-use mockup ──────────────────────────────────────────────────────

const MOCKUP_COLORS = {
  panelBg: "#0d0f1a",
  headerBg: "#13151f",
  border: "#2a2d3e",
  borderLight: "#353850",
  accent: "#6366f1",
  accentLight: "#818cf8",
  userBubble: "#312e81",
  userBubbleBorder: "#4338ca",
  assistantBubble: "#1a1d2e",
  assistantBubbleBorder: "#2a2d3e",
  text: "#e2e8f0",
  textSub: "#9abcb0",
  textMuted: "#64748b",
  textDim: "#94a3b8",
  success: "#10b981",
  warning: "#f59e0b",
  inputBg: "#0a0c14",
};

const TRAFFIC_LIGHT_DOTS: { bg: string }[] = [
  { bg: "#ef4444" },
  { bg: "#f59e0b" },
  { bg: "#10b981" },
];

const MOCK_MESSAGES: {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}[] = [
  {
    role: "user",
    content:
      "I got the lipids question wrong. I thought lipids were just fats, but the answer said they also include steroids and phospholipids. Can you explain what lipids actually are?",
    timestamp: "2:14 PM",
  },
  {
    role: "assistant",
    content:
      "Good catch — that's a really common mix-up! Before I explain, let me ask you something: what do you already know about the cell membrane? What is it made of, and what does it do?",
    timestamp: "2:14 PM",
  },
  {
    role: "user",
    content:
      "I know the cell membrane controls what goes in and out of the cell. I think it's made of a phospholipid bilayer?",
    timestamp: "2:15 PM",
  },
  {
    role: "assistant",
    content:
      "Exactly right — and notice you just named the connection yourself. Phospholipids are a type of lipid, and they form the cell membrane. So lipids aren't just fats for energy storage; they include any molecule that's hydrophobic (water-fearing) or amphipathic. That covers fats, oils, waxes, steroids like cholesterol, and phospholipids.\n\nHere's a question to test your understanding: if phospholipids form the membrane, why do you think it matters that one end of a phospholipid repels water while the other attracts it?",
    timestamp: "2:15 PM",
  },
];

function MockupSection() {
  return (
    <section className="mt-10" aria-label="Tutor in-use mockup">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-base font-semibold" style={{ color: C.text }}>
          What it looks like in use
        </h2>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#fbbf24",
          }}
        >
          Wrong-answer trigger
        </span>
      </div>

      {/* Outer chrome — two-column: lesson content + chat panel */}
      <div
        className="overflow-hidden rounded-3xl"
        style={{
          background: "linear-gradient(160deg, #0d1117 0%, #13152a 60%, #0d1117 100%)",
          border: "1px solid rgba(99,102,241,0.2)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 0 60px rgba(99,102,241,0.04)",
        }}
      >
        {/* Browser bar */}
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(0,0,0,0.3)",
          }}
          aria-hidden="true"
        >
          {TRAFFIC_LIGHT_DOTS.map((dot) => (
            <span
              key={dot.bg}
              style={{ width: 10, height: 10, borderRadius: "50%", background: dot.bg, display: "inline-block" }}
            />
          ))}
          <div
            style={{
              flex: 1,
              marginLeft: "8px",
              height: "22px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              paddingLeft: "10px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.3)",
              maxWidth: "360px",
            }}
          >
            biospark.app/student/learn/unit-1/biomolecules
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px]">
          {/* Left: mock lesson content */}
          <MockLessonPane />

          {/* Right: open chat panel */}
          <MockChatPanel />
        </div>
      </div>
    </section>
  );
}

function MockLessonPane() {
  return (
    <div
      className="p-8 flex flex-col gap-6 border-r"
      style={{ borderColor: "rgba(255,255,255,0.05)", minHeight: "560px" }}
      aria-label="Mock lesson content"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "#4a5568" }}>
        <span>Unit 1</span>
        <span>/</span>
        <span>Biomolecules &amp; Cells</span>
        <span>/</span>
        <span style={{ color: "#818cf8" }}>Concept 2 — Biomolecules</span>
      </div>

      {/* Section heading */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span
            className="rounded px-2 py-0.5 font-mono text-xs font-semibold"
            style={{ background: "#1e2d3e", color: "#67e8f9" }}
          >
            B.5A
          </span>
          <span className="text-xs" style={{ color: "#4a5568" }}>
            Priority TEKS
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: "#e0e7ff" }}>
          Lipids — structure, function, and types
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "#94a3b8", maxWidth: "520px" }}>
          Lipids are a diverse group of hydrophobic or amphipathic molecules. Unlike
          carbohydrates, they are not built from repeating monomer units. The major
          categories include <span style={{ color: "#c7d2fe" }}>fats &amp; oils</span>,{" "}
          <span style={{ color: "#c7d2fe" }}>phospholipids</span>, and{" "}
          <span style={{ color: "#c7d2fe" }}>steroids</span>, each with distinct roles
          in energy storage, membrane structure, and cellular signaling.
        </p>
      </div>

      {/* Visual diagram placeholder */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.15)",
          maxWidth: "480px",
        }}
        aria-label="Lipid structure diagram"
      >
        <p className="text-xs font-semibold mb-4" style={{ color: "#818cf8" }}>
          Lipid categories
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Triglycerides", sub: "Energy storage", emoji: "🟡" },
            { label: "Phospholipids", sub: "Cell membrane", emoji: "🔵" },
            { label: "Steroids", sub: "Signaling / structure", emoji: "🟣" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-xl mb-1" aria-hidden="true">{item.emoji}</div>
              <p className="text-xs font-semibold" style={{ color: "#c7d2fe" }}>
                {item.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#4a5568" }}>
                {item.sub}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick check that the student got wrong */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          maxWidth: "480px",
        }}
        aria-label="Quick check question — incorrect answer"
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ fontSize: "14px" }} aria-hidden="true">❌</span>
          <span className="text-xs font-semibold" style={{ color: "#fca5a5" }}>
            Quick Check — incorrect answer
          </span>
        </div>
        <p className="text-sm mb-3" style={{ color: C.text }}>
          Which of the following is NOT a function of lipids in a cell?
        </p>
        <div className="flex flex-col gap-2">
          {[
            { label: "A. Energy storage", wrong: false },
            { label: "B. Building the cell membrane", wrong: false },
            { label: "C. Carrying genetic information", wrong: true },
            { label: "D. Producing steroid hormones", wrong: false },
          ].map((opt) => (
            <div
              key={opt.label}
              className="rounded-lg px-3 py-2 text-xs"
              style={{
                background: opt.wrong
                  ? "rgba(239,68,68,0.18)"
                  : "rgba(255,255,255,0.03)",
                border: opt.wrong
                  ? "1px solid rgba(239,68,68,0.4)"
                  : "1px solid rgba(255,255,255,0.05)",
                color: opt.wrong ? "#fca5a5" : "#64748b",
                fontWeight: opt.wrong ? 600 : 400,
              }}
            >
              {opt.label}
              {opt.wrong && (
                <span style={{ marginLeft: "8px", fontSize: "10px" }}>
                  ← your answer
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "#6b7280" }}>
          Genetic information is carried by nucleic acids (DNA &amp; RNA), not lipids.
        </p>
      </div>
    </div>
  );
}

function MockChatPanel() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "560px",
        background: MOCKUP_COLORS.panelBg,
        borderLeft: `1px solid ${MOCKUP_COLORS.border}`,
      }}
      role="region"
      aria-label="BioSpark Tutor chat mockup"
    >
      {/* Panel header */}
      <div
        style={{
          padding: "14px 16px",
          background: MOCKUP_COLORS.headerBg,
          borderBottom: `1px solid ${MOCKUP_COLORS.border}`,
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 0 8px rgba(99,102,241,0.3)",
            }}
            aria-hidden="true"
          >
            🧬
          </div>
          {/* Green status dot */}
          <span
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: MOCKUP_COLORS.success,
              border: `2px solid ${MOCKUP_COLORS.headerBg}`,
            }}
            aria-hidden="true"
          />
        </div>

        {/* Identity */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: MOCKUP_COLORS.text }}>
              BioSpark Tutor
            </p>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: "6px",
                background: "rgba(245,158,11,0.15)",
                color: "#f59e0b",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              Tier 2
            </span>
          </div>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: MOCKUP_COLORS.textSub }}>
            Biomolecules &amp; Cell Structure
          </p>
          <div style={{ display: "flex", gap: "4px", marginTop: "5px" }}>
            {["B.5A", "B.5B"].map((t) => (
              <span
                key={t}
                style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  padding: "1px 5px",
                  borderRadius: "5px",
                  background: "#1e2d3e",
                  color: "#67e8f9",
                  fontFamily: "monospace",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Trigger badge */}
        <span
          style={{
            fontSize: "9px",
            fontWeight: 600,
            padding: "3px 7px",
            borderRadius: "6px",
            background: "rgba(239,68,68,0.12)",
            color: "#fca5a5",
            border: "1px solid rgba(239,68,68,0.2)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          ❌ Wrong answer
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
          scrollbarWidth: "thin",
          scrollbarColor: `${MOCKUP_COLORS.border} transparent`,
        }}
        aria-label="Conversation"
        aria-live="polite"
      >
        {MOCK_MESSAGES.map((msg, i) => (
          <MockMessage key={i} msg={msg} />
        ))}
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "12px 14px",
          borderTop: `1px solid ${MOCKUP_COLORS.border}`,
          background: MOCKUP_COLORS.headerBg,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
          <div
            style={{
              flex: 1,
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "13px",
              color: MOCKUP_COLORS.textDim,
              background: MOCKUP_COLORS.inputBg,
              border: `1px solid ${MOCKUP_COLORS.borderLight}`,
              lineHeight: 1.5,
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Draft student message"
          >
            So the membrane needs both water-attracting and repelling parts because...
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "14px",
                background: MOCKUP_COLORS.accent,
                marginLeft: "2px",
                animation: "cursor-blink 1s step-end infinite",
                verticalAlign: "middle",
              }}
              aria-hidden="true"
            />
          </div>
          <div
            style={{
              width: "40px",
              height: "40px",
              flexShrink: 0,
              borderRadius: "10px",
              background: MOCKUP_COLORS.accent,
              border: `1px solid ${MOCKUP_COLORS.accent}`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </div>
        </div>
        <p style={{ marginTop: "4px", textAlign: "right", fontSize: "10px", color: MOCKUP_COLORS.textMuted }}>
          52/500 · Enter to send
        </p>
      </div>

      <style>{`
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function MockMessage({
  msg,
}: {
  msg: { role: "user" | "assistant"; content: string; timestamp: string };
}) {
  const isUser = msg.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "10px",
        alignItems: "flex-end",
        gap: "8px",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #312e81 0%, #6366f1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          🧬
        </div>
      )}
      <div>
        <div
          style={{
            maxWidth: "260px",
            padding: "10px 13px",
            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            background: isUser ? MOCKUP_COLORS.userBubble : MOCKUP_COLORS.assistantBubble,
            border: `1px solid ${isUser ? MOCKUP_COLORS.userBubbleBorder : MOCKUP_COLORS.assistantBubbleBorder}`,
            fontSize: "12.5px",
            lineHeight: 1.55,
            color: isUser ? "#e0e7ff" : MOCKUP_COLORS.text,
            whiteSpace: "pre-line",
          }}
        >
          {msg.content}
        </div>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: "9px",
            color: MOCKUP_COLORS.textMuted,
            textAlign: isUser ? "right" : "left",
            paddingLeft: isUser ? 0 : "4px",
            paddingRight: isUser ? "4px" : 0,
          }}
        >
          {msg.timestamp}
        </p>
      </div>
    </div>
  );
}
