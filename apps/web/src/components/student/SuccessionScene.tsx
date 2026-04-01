"use client";

import type { SuccessionStage } from "@/types/succession";

interface SuccessionSceneProps {
  stage: SuccessionStage;
  disturbanceType: "wildfire" | "flood" | "drought";
  animated: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

/** Interpolate between two hex colors by t (0–1) */
function lerpHex(c1: string, c2: string, t: number): string {
  const parse = (h: string) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);
  const r = Math.round(lerp(r1, r2, t));
  const g = Math.round(lerp(g1, g2, t));
  const b = Math.round(lerp(b1, b2, t));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

/** Loblolly pine silhouette (tall triangle) */
function PineTree({
  x,
  baseY,
  height,
  opacity,
}: {
  x: number;
  baseY: number;
  height: number;
  opacity: number;
}) {
  const trunkH = height * 0.15;
  const trunkW = height * 0.06;
  return (
    <g opacity={opacity} style={{ transition: "opacity 0.6s ease" }}>
      {/* trunk */}
      <rect
        x={x - trunkW / 2}
        y={baseY - trunkH}
        width={trunkW}
        height={trunkH}
        fill="#5c3b1a"
      />
      {/* canopy layers */}
      <polygon
        points={`${x},${baseY - trunkH - height * 0.85} ${x - height * 0.22},${baseY - trunkH - height * 0.2} ${x + height * 0.22},${baseY - trunkH - height * 0.2}`}
        fill="#1a4a1a"
      />
      <polygon
        points={`${x},${baseY - trunkH - height * 0.6} ${x - height * 0.3},${baseY - trunkH} ${x + height * 0.3},${baseY - trunkH}`}
        fill="#1f5c1f"
      />
    </g>
  );
}

/** Bald cypress silhouette with knee roots */
function CypressTree({
  x,
  baseY,
  height,
  opacity,
}: {
  x: number;
  baseY: number;
  height: number;
  opacity: number;
}) {
  return (
    <g opacity={opacity} style={{ transition: "opacity 0.6s ease" }}>
      {/* trunk — slightly flared at base */}
      <path
        d={`M${x - 4},${baseY} L${x - 3},${baseY - height * 0.7} L${x + 3},${baseY - height * 0.7} L${x + 4},${baseY}`}
        fill="#5c3b1a"
      />
      {/* knee roots */}
      <path
        d={`M${x - 12},${baseY} Q${x - 10},${baseY - 10} ${x - 8},${baseY}`}
        stroke="#5c3b1a"
        strokeWidth="2"
        fill="none"
      />
      <path
        d={`M${x + 12},${baseY} Q${x + 10},${baseY - 10} ${x + 8},${baseY}`}
        stroke="#5c3b1a"
        strokeWidth="2"
        fill="none"
      />
      {/* canopy — broad oval */}
      <ellipse
        cx={x}
        cy={baseY - height * 0.78}
        rx={height * 0.28}
        ry={height * 0.36}
        fill="#2a6a2a"
      />
    </g>
  );
}

/** Small shrub shape */
function Shrub({
  x,
  baseY,
  size,
  opacity,
}: {
  x: number;
  baseY: number;
  size: number;
  opacity: number;
}) {
  return (
    <ellipse
      cx={x}
      cy={baseY - size * 0.4}
      rx={size * 0.6}
      ry={size * 0.4}
      fill="#2d5a1b"
      opacity={opacity}
      style={{ transition: "opacity 0.6s ease" }}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function SuccessionScene({
  stage,
  disturbanceType,
  animated,
}: SuccessionSceneProps) {
  const { canopyCover, soilHealth, biodiversityIndex } = stage;

  // Sky gradient colors
  const skyTop =
    canopyCover < 0.1
      ? disturbanceType === "wildfire"
        ? "#3a2010"
        : "#1a2a3a"
      : lerpHex("#1a2a40", "#0a2a5a", canopyCover);
  const skyBottom =
    canopyCover < 0.1
      ? disturbanceType === "wildfire"
        ? "#7a4020"
        : "#1a3550"
      : lerpHex("#0d3055", "#0a4080", canopyCover);

  // Ground color: charred → brown → rich green
  const groundColor =
    soilHealth < 0.15
      ? "#1a1008"
      : soilHealth < 0.35
        ? lerpHex("#2a1a08", "#5c3b1a", (soilHealth - 0.15) / 0.2)
        : lerpHex("#5c3b1a", "#3a7a20", (soilHealth - 0.35) / 0.65);

  // Soil health bar color
  const soilBarColor = lerpHex("#8B4513", "#2d5a1b", soilHealth);

  // Tree count and size based on canopy
  const treeCount = Math.round(canopyCover * 9);
  const treeHeightBase = 40 + canopyCover * 80;

  // Shrub count
  const shrubCount =
    canopyCover > 0.1 ? Math.round((biodiversityIndex - 0.1) * 6) : 0;

  // Whether to show sun
  const showSun = canopyCover < 0.5;

  // Smoke particles at stage 0 (wildfire)
  const showSmoke =
    disturbanceType === "wildfire" && canopyCover < 0.05 && soilHealth < 0.15;

  const GROUND_Y = 240;
  const SOIL_BAR_H = 6;

  // Deterministic tree x positions based on index
  const treePositions = Array.from({ length: 9 }, (_, i) => {
    const slots = [60, 120, 180, 240, 300, 360, 420, 480, 540];
    return slots[i] + ((i * 37) % 25) - 12;
  });

  const shrubPositions = [80, 160, 250, 340, 430, 520];

  return (
    <svg
      viewBox="0 0 600 280"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Ecosystem scene: ${stage.name} — canopy cover ${Math.round(canopyCover * 100)}%, soil health ${Math.round(soilHealth * 100)}%`}
      role="img"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBottom} />
        </linearGradient>
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={groundColor} />
          <stop
            offset="100%"
            stopColor={lerpHex(groundColor, "#0a0a0a", 0.4)}
          />
        </linearGradient>
        {/* Smoke filter */}
        {showSmoke && (
          <filter id="smokeBlur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        )}
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="600" height={GROUND_Y} fill="url(#skyGrad)" />

      {/* Sun */}
      {showSun && (
        <g
          opacity={lerp(1, 0.2, canopyCover * 2)}
          style={{ transition: animated ? "opacity 0.6s ease" : "none" }}
        >
          <circle
            cx={disturbanceType === "flood" ? 500 : 80}
            cy={50}
            r={22}
            fill={disturbanceType === "wildfire" ? "#f5a623" : "#fde68a"}
            opacity={0.85}
          />
          {/* Sun rays (wildfire = orange, normal = yellow) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const sx = (disturbanceType === "flood" ? 500 : 80) + Math.cos(rad) * 28;
            const sy = 50 + Math.sin(rad) * 28;
            const ex = (disturbanceType === "flood" ? 500 : 80) + Math.cos(rad) * 36;
            const ey = 50 + Math.sin(rad) * 36;
            return (
              <line
                key={angle}
                x1={sx}
                y1={sy}
                x2={ex}
                y2={ey}
                stroke={disturbanceType === "wildfire" ? "#f5a623" : "#fde68a"}
                strokeWidth="2"
                opacity={0.7}
              />
            );
          })}
        </g>
      )}

      {/* Smoke particles at stage 0 wildfire */}
      {showSmoke && (
        <g filter="url(#smokeBlur)" opacity={0.55}>
          {[100, 200, 300, 400, 500].map((sx, i) => (
            <ellipse
              key={i}
              cx={sx}
              cy={80 - i * 12}
              rx={18 + i * 4}
              ry={12 + i * 3}
              fill="#888888"
              opacity={0.4 - i * 0.05}
            />
          ))}
        </g>
      )}

      {/* Water (flood only, early stages) */}
      {disturbanceType === "flood" && canopyCover < 0.15 && (
        <rect
          x="0"
          y={GROUND_Y - 20}
          width="600"
          height="20"
          fill="#1e4a8a"
          opacity={lerp(0.8, 0, canopyCover / 0.15)}
          style={{ transition: animated ? "opacity 0.6s ease" : "none" }}
        />
      )}

      {/* Ground */}
      <rect
        x="0"
        y={GROUND_Y}
        width="600"
        height="34"
        fill="url(#groundGrad)"
        style={{
          transition: animated ? "fill 0.6s ease" : "none",
        }}
      />

      {/* Shrubs (understory) */}
      {shrubPositions.slice(0, Math.max(0, shrubCount)).map((sx, i) => (
        <Shrub
          key={i}
          x={sx}
          baseY={GROUND_Y}
          size={12 + (i % 3) * 4}
          opacity={canopyCover > 0.1 ? 1 : 0}
        />
      ))}

      {/* Trees */}
      {treePositions.slice(0, treeCount).map((tx, i) => {
        const treeH = treeHeightBase * (0.8 + (i % 3) * 0.13);
        return disturbanceType === "flood" ? (
          <CypressTree
            key={i}
            x={tx}
            baseY={GROUND_Y}
            height={treeH}
            opacity={1}
          />
        ) : (
          <PineTree
            key={i}
            x={tx}
            baseY={GROUND_Y}
            height={treeH}
            opacity={1}
          />
        );
      })}

      {/* Soil health bar at bottom */}
      <rect
        x="0"
        y={274 - SOIL_BAR_H}
        width={600 * soilHealth}
        height={SOIL_BAR_H}
        fill={soilBarColor}
        rx="2"
        style={{ transition: animated ? "width 0.6s ease, fill 0.6s ease" : "none" }}
      />
      <rect
        x="0"
        y={274 - SOIL_BAR_H}
        width="600"
        height={SOIL_BAR_H}
        fill="none"
        stroke="#334155"
        strokeWidth="1"
        rx="2"
      />

      {/* Soil health label */}
      <text
        x="6"
        y="278"
        fontFamily="DynaPuff, sans-serif"
        fontSize="9"
        fill="#94a3b8"
      >
        Soil Health
      </text>
      <text
        x="594"
        y="278"
        fontFamily="DynaPuff, sans-serif"
        fontSize="9"
        fill="#94a3b8"
        textAnchor="end"
      >
        {Math.round(soilHealth * 100)}%
      </text>
    </svg>
  );
}
