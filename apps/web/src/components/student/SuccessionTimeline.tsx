"use client";

import { useEffect, useRef, useCallback } from "react";
import type { SuccessionStage } from "@/types/succession";

interface SuccessionTimelineProps {
  stages: SuccessionStage[];
  currentIndex: number;
  onChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export default function SuccessionTimeline({
  stages,
  currentIndex,
  onChange,
  isPlaying,
  onTogglePlay,
  onReset,
}: SuccessionTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onChange(Math.min(currentIndex + 1, stages.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onChange(Math.max(currentIndex - 1, 0));
      }
    },
    [currentIndex, stages.length, onChange],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Progress fraction for the connecting line fill
  const progressPct =
    stages.length > 1 ? (currentIndex / (stages.length - 1)) * 100 : 0;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      aria-label="Succession timeline. Use ArrowLeft and ArrowRight to navigate stages."
      className="rounded-2xl p-4 focus-visible:outline-none focus-visible:ring-2"
      style={{
        background: "#132638",
        border: "1px solid #1e3a52",
      }}
    >
      {/* ── Timeline nodes ─────────────────────────────────────── */}
      <div className="relative flex items-center justify-between px-2">
        {/* Track background */}
        <div
          className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2"
          style={{ background: "#1e3a52", borderRadius: 4 }}
        />
        {/* Track fill (teal up to current index) */}
        <div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2"
          style={{
            width: `${progressPct}%`,
            background: "#00d4aa",
            borderRadius: 4,
            transition: "width 0.4s ease",
          }}
        />

        {stages.map((stage, i) => {
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;
          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center gap-1">
              <button
                type="button"
                aria-label={`Stage ${i + 1}: ${stage.name}, year ${stage.yearsAfterDisturbance}`}
                aria-pressed={isActive}
                onClick={() => onChange(i)}
                className="flex items-center justify-center rounded-full font-bold transition-all"
                style={{
                  width: isActive ? 32 : 22,
                  height: isActive ? 32 : 22,
                  background: isActive ? "#00d4aa" : isPast ? "#00d4aa" : "#1e3a52",
                  border: isActive ? "2px solid #00d4aa" : "2px solid #1e3a52",
                  boxShadow: isActive ? "0 0 12px rgba(0,212,170,0.6)" : "none",
                  color: isActive ? "#0d1e2c" : isPast ? "#0d1e2c" : "#94a3b8",
                  fontSize: isActive ? 12 : 10,
                  transition: "all 0.3s ease",
                  outline: "none",
                }}
              >
                {i + 1}
              </button>
              {/* Year label */}
              <span
                className="text-center"
                style={{
                  fontFamily: "DynaPuff, sans-serif",
                  fontSize: 11,
                  color: isActive ? "#00d4aa" : "#64748b",
                  whiteSpace: "nowrap",
                  maxWidth: 70,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  transition: "color 0.3s ease",
                }}
              >
                {stage.yearsAfterDisturbance === 0
                  ? "Year 0"
                  : `Yr ${stage.yearsAfterDisturbance}+`}
              </span>
              {/* Stage name */}
              <span
                className="hidden text-center sm:block"
                style={{
                  fontFamily: "DynaPuff, sans-serif",
                  fontSize: 10,
                  color: isActive ? "#cbd5e1" : "#475569",
                  maxWidth: 72,
                  lineHeight: 1.2,
                  transition: "color 0.3s ease",
                }}
              >
                {stage.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Controls ────────────────────────────────────────────── */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Reset to stage 0"
          onClick={onReset}
          className="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors hover:opacity-80"
          style={{
            background: "#1e3a52",
            color: "#94a3b8",
            border: "1px solid #2a4a62",
          }}
        >
          Reset 🔄
        </button>
        <button
          type="button"
          aria-label={isPlaying ? "Pause auto-advance" : "Fast-forward through stages"}
          onClick={onTogglePlay}
          className="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors hover:opacity-80"
          style={{
            background: isPlaying ? "#00d4aa22" : "#00d4aa",
            color: isPlaying ? "#00d4aa" : "#0d1e2c",
            border: isPlaying ? "1px solid #00d4aa" : "none",
          }}
        >
          {isPlaying ? "Pause ⏸" : "Fast Forward ⏩"}
        </button>
      </div>
    </div>
  );
}
