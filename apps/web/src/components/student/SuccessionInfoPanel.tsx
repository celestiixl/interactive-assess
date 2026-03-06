"use client";

import { useEffect, useRef } from "react";
import type { SuccessionStage, SuccessionScenario } from "@/types/succession";

interface SuccessionInfoPanelProps {
  stage: SuccessionStage;
  scenario: SuccessionScenario;
}

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

function StatBar({ label, value, color }: StatBarProps) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span
          style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, color: "#94a3b8" }}
        >
          {label}
        </span>
        <span
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color }}
        >
          {pct}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: "#1e3a52" }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: color,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function SuccessionInfoPanel({
  stage,
  scenario,
}: SuccessionInfoPanelProps) {
  const isClimaxStage =
    stage.id === scenario.stages[scenario.stages.length - 1].id;

  // Pulse animation ref for climax banner
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bannerRef.current) return;
    // Trigger re-animation on stage change
    const el = bannerRef.current;
    el.style.animation = "none";
    void el.offsetHeight; // reflow
    el.style.animation = "";
  }, [stage.id]);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#132638", border: "1px solid #1e3a52" }}
    >
      {/* Stage name + year */}
      <div className="mb-3">
        <h3
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#00d4aa",
          }}
        >
          {stage.name}
        </h3>
        <p
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 13,
            color: "#64748b",
            marginTop: 2,
          }}
        >
          {stage.yearsAfterDisturbance === 0
            ? "Year 0 — disturbance event"
            : `Year ${stage.yearsAfterDisturbance}+ after disturbance`}
        </p>
      </div>

      {/* Stat bars */}
      <div className="mb-4 space-y-3">
        <StatBar label="Soil Health" value={stage.soilHealth} color="#f5a623" />
        <StatBar label="Canopy Cover" value={stage.canopyCover} color="#00d4aa" />
        <StatBar
          label="Biodiversity Index"
          value={stage.biodiversityIndex}
          color="#60a5fa"
        />
      </div>

      {/* Dominant species chips */}
      <div className="mb-4">
        <p
          className="mb-2"
          style={{ fontFamily: "Outfit, sans-serif", fontSize: 12, color: "#64748b" }}
        >
          Dominant Species
        </p>
        <div className="flex flex-wrap gap-2">
          {stage.dominantSpecies.map((sp) => (
            <span
              key={sp}
              className="rounded-full px-3 py-1"
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 11,
                background: "#00d4aa22",
                color: "#00d4aa",
                border: "1px solid #00d4aa44",
              }}
            >
              {sp}
            </span>
          ))}
        </div>
      </div>

      {/* Ecological note callout */}
      <div
        className="mb-4 rounded-xl p-3"
        style={{
          border: "1px solid #00d4aa44",
          background: "#00d4aa08",
        }}
      >
        <p
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 13,
            color: "#94a3b8",
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: "#00d4aa", fontWeight: 600 }}>🌿 Ecological Note: </span>
          {stage.ecologicalNote}
        </p>
      </div>

      {/* TEKS badges */}
      <div className="mb-4 flex flex-wrap gap-2">
        {scenario.teks.map((code) => (
          <span
            key={code}
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: "#1e3a52",
              color: "#60a5fa",
              border: "1px solid #60a5fa44",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            TEKS {code}
          </span>
        ))}
      </div>

      {/* Climax community celebration banner */}
      {isClimaxStage && (
        <div
          ref={bannerRef}
          className="rounded-xl p-3 text-center"
          style={{
            background: "linear-gradient(135deg, #00d4aa22, #00d4aa11)",
            border: "1px solid #00d4aa",
            animation: "successionPulse 2s ease-in-out infinite",
          }}
        >
          <p
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#00d4aa",
            }}
          >
            🌿 Climax Community Reached!
          </p>
          <p
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 12,
              color: "#94a3b8",
              marginTop: 4,
            }}
          >
            The ecosystem has returned to a stable, self-sustaining state after secondary succession.
          </p>
        </div>
      )}

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes successionPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 170, 0.3); }
          50% { box-shadow: 0 0 16px 4px rgba(0, 212, 170, 0.15); }
        }
      `}</style>
    </div>
  );
}
