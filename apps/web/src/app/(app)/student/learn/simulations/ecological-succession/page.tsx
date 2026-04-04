"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BackLink } from "@/components/nav/BackLink";
import { PageBanner, PageContent } from "@/components/ui";
import SuccessionPhenomenonBanner from "@/components/student/SuccessionPhenomenonBanner";
import SuccessionScene from "@/components/student/SuccessionScene";
import SuccessionTimeline from "@/components/student/SuccessionTimeline";
import SuccessionInfoPanel from "@/components/student/SuccessionInfoPanel";
import { successionScenarios } from "@/data/successionScenarios";

// ── Constants ──────────────────────────────────────────────────────────────
const LESSON_SLUG = "ecological-succession";
const TEKS_B6D = "B.6D";

// ── Reflection Quick-Check ─────────────────────────────────────────────────
interface ReflectionPanelProps {
  onSubmit: (text: string) => Promise<void>;
  submitted: boolean;
  feedback: string | null;
}

function ReflectionPanel({ onSubmit, submitted, feedback }: ReflectionPanelProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    await onSubmit(text);
    setLoading(false);
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#132638", border: "1px solid #1e3a52" }}
    >
      <h3
        style={{
          fontFamily: "DynaPuff, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: "#e2e8f0",
          marginBottom: 8,
        }}
      >
        🌱 Reflection Prompt
      </h3>
      <p
        style={{
          fontFamily: "DynaPuff, sans-serif",
          fontSize: 14,
          color: "#94a3b8",
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        What type of succession is shown here — primary or secondary? How do you know?
      </p>
      <textarea
        aria-label="Reflection answer"
        disabled={submitted}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Type your answer here…"
        className="w-full resize-none rounded-bs p-3 text-sm outline-none"
        style={{
          background: "#0d1e2c",
          border: "1px solid #1e3a52",
          color: "#e2e8f0",
          fontFamily: "DynaPuff, sans-serif",
          opacity: submitted ? 0.6 : 1,
        }}
      />
      {feedback && (
        <div
          className="mt-3 rounded-bs p-3"
          style={{
            background: "#00d4aa11",
            border: "1px solid #00d4aa44",
            fontFamily: "DynaPuff, sans-serif",
            fontSize: 13,
            color: "#94a3b8",
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: "#00d4aa", fontWeight: 600 }}>Feedback: </span>
          {feedback}
        </div>
      )}
      {!submitted && (
        <button
          type="button"
          aria-label="Submit reflection"
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className="mt-3 rounded-full px-5 py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            background: "#00d4aa",
            color: "#0d1e2c",
            fontFamily: "DynaPuff, sans-serif",
          }}
        >
          {loading ? "Submitting…" : "Submit Reflection"}
        </button>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function EcologicalSuccessionPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    successionScenarios[0].id,
  );
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const masteryRecordedRef = useRef(false);
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  const [reflectionFeedback, setReflectionFeedback] = useState<string | null>(null);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario =
    successionScenarios.find((s) => s.id === selectedScenarioId) ??
    successionScenarios[0];

  const currentStage = scenario.stages[currentStageIndex];
  const isAtClimaxStage = currentStageIndex === scenario.stages.length - 1;

  // ── Auto-advance (fast-forward) ──
  const stopPlay = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentStageIndex((prev) => {
          const next = prev + 1;
          if (next >= scenario.stages.length) {
            stopPlay();
            return prev;
          }
          return next;
        });
      }, 2500);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, scenario.stages.length, stopPlay]);

  // ── Record mastery when climax is reached ──
  useEffect(() => {
    if (isAtClimaxStage && !masteryRecordedRef.current) {
      masteryRecordedRef.current = true;
      fetch("/api/mastery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teks: TEKS_B6D,
          score: 1,
          lessonSlug: LESSON_SLUG,
        }),
      }).catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("[EcologicalSuccession] mastery POST failed:", err);
        }
      });
    }
  }, [isAtClimaxStage]);

  // ── Scenario switch resets stage index and mastery ref ──
  function handleScenarioSwitch(id: string) {
    stopPlay();
    setSelectedScenarioId(id);
    setCurrentStageIndex(0);
    masteryRecordedRef.current = false;
  }

  function handleReset() {
    stopPlay();
    setCurrentStageIndex(0);
  }

  function handleTogglePlay() {
    if (isPlaying) {
      stopPlay();
    } else {
      if (currentStageIndex >= scenario.stages.length - 1) {
        setCurrentStageIndex(0);
      }
      setIsPlaying(true);
    }
  }

  // ── Reflection submission ──
  async function handleReflectionSubmit(text: string) {
    try {
      const res = await fetch("/api/score/short", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          rubric: {
            criteria: [
              "Identifies this as secondary succession",
              "Notes that soil remained after the disturbance",
              "Mentions recovery stages or pioneer species",
            ],
          },
        }),
      });
      const data = await res.json();
      const score = data.score ?? 0;
      const max = data.maxScore ?? 3;
      if (score >= max * 0.66) {
        setReflectionFeedback(
          "Great thinking! You correctly identified this as secondary succession. The existing soil after the disturbance is the key evidence.",
        );
      } else {
        setReflectionFeedback(
          "Good attempt! Remember: secondary succession occurs when a disturbance removes organisms but leaves the soil intact — unlike primary succession which starts on bare rock.",
        );
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[EcologicalSuccession] reflection scoring failed:", err);
      }
      setReflectionFeedback(
        "Unable to score your reflection right now. Key idea: this is secondary succession because the disturbance left soil in place, allowing faster recovery than primary succession.",
      );
    }
    setReflectionSubmitted(true);
  }

  return (
    <main
      className="ia-vh-page flex h-dvh flex-col overflow-hidden"
      style={{ background: "#0d1e2c", color: "#e2e8f0" }}
    >
      <BackLink href="/student/dashboard" label="Back to dashboard" />
      <PageBanner
        title="Ecological Succession Visualizer"
        subtitle="Explore how ecosystems recover after disturbance — TEKS B.6D & B.11A"
      >
      </PageBanner>

      <PageContent className="flex-1 overflow-y-auto py-6">
        <div
          className="mx-auto w-full max-w-3xl space-y-5 px-4"
          style={{ fontFamily: "DynaPuff, sans-serif" }}
        >
          {/* ── TEKS badge row ── */}
          <div className="flex flex-wrap gap-2">
            {["B.6D", "B.11A"].map((code) => (
              <span
                key={code}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: "#00d4aa22",
                  color: "#00d4aa",
                  border: "1px solid #00d4aa44",
                }}
              >
                TEKS {code}
              </span>
            ))}
          </div>

          {/* ── 1. Phenomenon Banner ── */}
          <SuccessionPhenomenonBanner scenario={scenario} />

          {/* ── 2. Scenario selector ── */}
          <div className="flex flex-wrap gap-3">
            {successionScenarios.map((sc) => {
              const isSelected = sc.id === selectedScenarioId;
              const isWildfire = sc.disturbance.type === "wildfire";
              return (
                <button
                  key={sc.id}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Select scenario: ${sc.name}`}
                  onClick={() => handleScenarioSwitch(sc.id)}
                  className="rounded-full px-5 py-2 text-sm font-semibold transition-all hover:opacity-80 focus-visible:outline-none focus-visible:ring-2"
                  style={{
                    background: isSelected
                      ? isWildfire
                        ? "#f5a623"
                        : "#60a5fa"
                      : "#132638",
                    color: isSelected ? "#0d1e2c" : "#94a3b8",
                    border: `1px solid ${isSelected ? (isWildfire ? "#f5a623" : "#60a5fa") : "#1e3a52"}`,
                  }}
                >
                  {isWildfire ? "🔥 Bastrop Wildfire" : "🌊 Houston Flooding"}
                </button>
              );
            })}
          </div>

          {/* ── 3. SVG Scene ── */}
          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: "1px solid #1e3a52" }}
          >
            <SuccessionScene
              stage={currentStage}
              disturbanceType={scenario.disturbance.type}
              animated
            />
          </div>

          {/* ── 4. Timeline Scrubber ── */}
          <SuccessionTimeline
            stages={scenario.stages}
            currentIndex={currentStageIndex}
            onChange={(i) => {
              stopPlay();
              setCurrentStageIndex(i);
            }}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
          />

          {/* ── 5. Info Panel ── */}
          <SuccessionInfoPanel
            stage={currentStage}
            scenario={scenario}
          />

          {/* ── 6. Reflection Quick-Check ── */}
          <ReflectionPanel
            onSubmit={handleReflectionSubmit}
            submitted={reflectionSubmitted}
            feedback={reflectionFeedback}
          />
        </div>
      </PageContent>

    </main>
  );
}
