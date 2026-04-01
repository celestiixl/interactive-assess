"use client";

import { useState } from "react";
import type { SuccessionScenario } from "@/types/succession";

interface SuccessionPhenomenonBannerProps {
  scenario: SuccessionScenario;
}

const WILDFIRE_STATS = [
  { icon: "🔥", label: "96% of park burned" },
  { icon: "🌲", label: "~70 years to full recovery" },
];

const FLOOD_STATS = [
  { icon: "🌧️", label: "51 inches of rain in 4 days" },
  { icon: "🌊", label: "Bayou ecosystems disrupted" },
];

export default function SuccessionPhenomenonBanner({
  scenario,
}: SuccessionPhenomenonBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const isWildfire = scenario.disturbance.type === "wildfire";

  const headline = isWildfire
    ? "🔥 What happened at Bastrop State Park?"
    : "🌊 What happened to Houston's bayous?";

  const dateLabel = isWildfire ? "September 4, 2011" : "August 25–31, 2017";

  const stats = isWildfire ? WILDFIRE_STATS : FLOOD_STATS;

  const glowColor = isWildfire
    ? "rgba(245, 166, 35, 0.25)"
    : "rgba(96, 165, 250, 0.25)";

  const borderColor = isWildfire ? "#f5a62344" : "#60a5fa44";
  const accentColor = isWildfire ? "#f5a623" : "#60a5fa";

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "#132638",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 0 24px ${glowColor}`,
      }}
    >
      {/* Headline + date badge */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2
          style={{
            fontFamily: "DynaPuff, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: "#e2e8f0",
            lineHeight: 1.2,
          }}
        >
          {headline}
        </h2>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold"
          style={{
            background: `${accentColor}22`,
            color: accentColor,
            border: `1px solid ${accentColor}66`,
            fontFamily: "DynaPuff, sans-serif",
          }}
        >
          {dateLabel}
        </span>
      </div>

      {/* Phenomenon sentence */}
      <p
        className="mt-3"
        style={{
          fontFamily: "DynaPuff, sans-serif",
          fontSize: 14,
          color: "#94a3b8",
          lineHeight: 1.6,
        }}
      >
        {scenario.phenomenon}
      </p>

      {/* Stat pills */}
      <div className="mt-4 flex flex-wrap gap-3">
        {stats.map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}44`,
            }}
          >
            <span>{icon}</span>
            <span
              style={{
                fontFamily: "DynaPuff, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: accentColor,
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Expandable TEKS connection */}
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="succession-teks-connection"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:opacity-80"
        style={{
          background: "#0d1e2c",
          color: "#00d4aa",
          border: "1px solid #00d4aa44",
          fontFamily: "DynaPuff, sans-serif",
        }}
      >
        <span>Why does this matter?</span>
        <span
          style={{
            display: "inline-block",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div
          id="succession-teks-connection"
          className="mt-3 rounded-xl p-4"
          style={{
            background: "#0d1e2c",
            border: "1px solid #1e3a52",
          }}
        >
          <p
            className="mb-2"
            style={{
              fontFamily: "DynaPuff, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#00d4aa",
            }}
          >
            TEKS Connection
          </p>
          <p
            style={{
              fontFamily: "DynaPuff, sans-serif",
              fontSize: 13,
              color: "#94a3b8",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#e2e8f0" }}>
              B.6D — Secondary Succession:
            </strong>{" "}
            This event is a textbook example of{" "}
            <em>secondary succession</em> — the process by which an ecosystem
            recovers after a major disturbance that removes existing organisms
            but leaves the soil intact. Unlike primary succession, secondary
            succession starts with a foundation of remaining soil, allowing
            recovery to begin faster.
          </p>
          <p
            className="mt-2"
            style={{
              fontFamily: "DynaPuff, sans-serif",
              fontSize: 13,
              color: "#94a3b8",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#e2e8f0" }}>
              B.11A — Matter &amp; Energy Cycling Reset:
            </strong>{" "}
            The disturbance disrupted the local matter and energy cycles —
            carbon stored in biomass was released, nutrient cycling halted, and
            food webs collapsed. As succession proceeds, photosynthesis restores
            carbon storage, decomposers rebuild soil nutrients, and energy
            pyramids are reconstructed from the ground up.
          </p>
        </div>
      )}
    </div>
  );
}
