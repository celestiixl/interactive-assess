"use client";

import React, { useMemo, useState } from "react";
import { LEARNING_UNITS } from "@/lib/learningHubContent";

export type DonutSegment = {
  key: string; // e.g. "B.7C" or "B.5A"
  label: string;
  value: number; // 0..100 (or sometimes 0..1)
  weight?: number;
  group?: string; // e.g. "B.7" or "B.5"
};

type RingArc = {
  key: string;
  label: string;
  weight: number;
  value: number;
  color: string;
};

type UnitSummary = {
  key: string;
  label: string;
  teksCount: number;
  masteryPct: number;
  masteredCount: number;
  learnedCount: number;
  remainingCount: number;
  weakestTeks: string[];
  color: string;
};

function polarToXY(cx: number, cy: number, r: number, a: number) {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number,
) {
  const large = end - start > Math.PI ? 1 : 0;
  const p1 = polarToXY(cx, cy, rOuter, start);
  const p2 = polarToXY(cx, cy, rOuter, end);
  const p3 = polarToXY(cx, cy, rInner, end);
  const p4 = polarToXY(cx, cy, rInner, start);

  return [
    `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`,
    `L ${p3.x.toFixed(3)} ${p3.y.toFixed(3)}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x.toFixed(3)} ${p4.y.toFixed(3)}`,
    "Z",
  ].join(" ");
}

function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ar = (pa >> 16) & 255,
    ag = (pa >> 8) & 255,
    ab = pa & 255;
  const br = (pb >> 16) & 255,
    bg = (pb >> 8) & 255,
    bb = pb & 255;

  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(rr)}${toHex(rg)}${toHex(rb)}`;
}

function toPct(v: number) {
  if (!Number.isFinite(v)) return 0;
  if (v >= 0 && v <= 1) return v * 100;
  return Math.max(0, Math.min(100, v));
}

const UNIT_BASE_COLORS: Record<string, string> = {
  "B.5": "#2563eb",
  "B.7": "#db2777",
  "B.11": "#06b6d4",
};

const PRACTICE_LABELS: Record<string, string> = {
  "B.5": "Unit 1: Biomolecules and Cells",
  "B.7": "Unit 2: Nucleic Acids and Protein Synthesis",
  "B.11": "Unit 1: Energy Conversions and Enzymes",
};

function clusterKeyFromSegmentKey(key: string) {
  const m = key.match(/^([A-Z]\.[0-9]+)/);
  return m ? m[1] : key;
}

function colorForMastery(groupKey: string, masteryPct: number) {
  const base = UNIT_BASE_COLORS[groupKey] ?? "#2563eb";
  const toned = mixHex(base, "#e2e8f0", ((100 - masteryPct) / 100) * 0.72);
  return toned;
}

function unitTitleMap() {
  const map: Record<string, string> = {};
  for (const unit of LEARNING_UNITS) {
    const prefixes = new Set(
      unit.teks.map((teks) => clusterKeyFromSegmentKey(teks)),
    );
    prefixes.forEach((prefix) => {
      if (!map[prefix]) {
        map[prefix] = `${prefix} • ${unit.title}`;
      }
    });
  }
  return map;
}

function masteryBand(value: number) {
  if (value >= 75) return "mastered";
  if (value >= 40) return "learned";
  return "remaining";
}

function clampPct(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export default function MasteryDonut({
  segments,
  size = 360,
}: {
  segments: DonutSegment[];
  size?: number;
}) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const {
    arcs,
    overall,
    hoverText,
    units,
    masteredCount,
    learnedCount,
    remainingCount,
  } = useMemo(() => {
    const titles = unitTitleMap();
    const norm = segments.map((s) => ({
      ...s,
      value: toPct(s.value),
      weight: typeof s.weight === "number" ? s.weight : 1,
      group:
        s.group ??
        (s.key.includes(".") ? s.key.split(".").slice(0, 2).join(".") : s.key),
    }));

    const totW = norm.reduce((a, s) => a + (s.weight ?? 1), 0);
    const totS = norm.reduce((a, s) => a + s.value * (s.weight ?? 1), 0);
    const overall = totW > 0 ? totS / totW : 0;

    const byGroup = new Map<string, DonutSegment[]>();
    for (const s of norm) {
      const g = clusterKeyFromSegmentKey(s.group ?? s.key);
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g)?.push(s);
    }

    const units: UnitSummary[] = Array.from(byGroup.entries())
      .map(([groupKey, rows]) => {
        const teksCount = rows.length;
        const weighted = rows.reduce(
          (acc, row) => {
            const weight = row.weight ?? 1;
            acc.sum += row.value * weight;
            acc.weight += weight;
            return acc;
          },
          { sum: 0, weight: 0 },
        );

        const masteryPct =
          weighted.weight > 0 ? Math.round(weighted.sum / weighted.weight) : 0;

        const sortedWeakest = rows
          .slice()
          .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
          .slice(0, 2)
          .map((row) => row.key);

        const counts = rows.reduce(
          (acc, row) => {
            const band = masteryBand(row.value ?? 0);
            acc[band] += 1;
            return acc;
          },
          { mastered: 0, learned: 0, remaining: 0 },
        );

        return {
          key: groupKey,
          label:
            titles[groupKey] ??
            PRACTICE_LABELS[groupKey] ??
            `${groupKey} • Unit`,
          teksCount,
          masteryPct,
          masteredCount: counts.mastered,
          learnedCount: counts.learned,
          remainingCount: counts.remaining,
          weakestTeks: sortedWeakest,
          color: colorForMastery(groupKey, masteryPct),
        };
      })
      .sort((a, b) => {
        const an = Number(a.key.replace(/^([A-Z]\.)/, ""));
        const bn = Number(b.key.replace(/^([A-Z]\.)/, ""));
        if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
        return a.key.localeCompare(b.key);
      });

    const arcs: RingArc[] = units.map((unit) => ({
      key: unit.key,
      label: unit.label,
      weight: unit.teksCount,
      value: unit.masteryPct,
      color: unit.color,
    }));

    const counts = norm.reduce(
      (acc, row) => {
        const band = masteryBand(row.value ?? 0);
        acc[band] += 1;
        return acc;
      },
      { mastered: 0, learned: 0, remaining: 0 },
    );

    const hoverText = (key: string | null) => {
      if (!key) return null;
      const it = units.find((x) => x.key === key);
      if (it) {
        return `${it.label} • ${it.masteryPct}% mastery`;
      }
      return null;
    };

    return {
      arcs,
      overall,
      hoverText,
      units,
      masteredCount: counts.mastered,
      learnedCount: counts.learned,
      remainingCount: counts.remaining,
    };
  }, [segments]);

  const cx = size / 2;
  const cy = size / 2;

  // Donut encoding:
  // - angular span (left-to-right) = TEKS/sub-TEKS weight
  // - radial growth (in/out) = mastery percentage
  const rInner = size * 0.23;
  const minThickness = size * 0.12;
  const maxThickness = size * 0.21;
  const minOuter = rInner + minThickness;
  const maxOuter = rInner + maxThickness;

  function radiusForMastery(value: number) {
    const pct = clampPct(value) / 100;
    return minOuter + pct * (maxOuter - minOuter);
  }

  function renderRing(data: RingArc[]) {
    const total = data.reduce((a, x) => a + x.weight, 0) || 1;
    let ang = -Math.PI / 2;

    return data.map((a) => {
      const span = (a.weight / total) * Math.PI * 2;
      const start = ang;
      const end = ang + span;
      ang = end;
      const rOuter = radiusForMastery(a.value);

      const isHover = hoverKey === a.key;
      const dim = hoverKey ? (isHover ? 1 : 0.32) : 1;

      return (
        <path
          key={a.key}
          d={arcPath(cx, cy, rOuter, rInner, start, end)}
          fill={a.color}
          opacity={dim}
          onMouseEnter={() => setHoverKey(a.key)}
          onMouseLeave={() => setHoverKey(null)}
          style={{
            transition: "opacity 140ms ease, filter 140ms ease",
            filter: isHover
              ? "drop-shadow(0px 10px 16px rgba(0,0,0,0.18))"
              : "none",
            cursor: "pointer",
          }}
        />
      );
    });
  }

  const centerPct = Math.round(overall);

  const totalCount = masteredCount + learnedCount + remainingCount;
  const masteredWidth = totalCount ? (masteredCount / totalCount) * 100 : 0;
  const learnedWidth = totalCount ? (learnedCount / totalCount) * 100 : 0;
  const remainingWidth = totalCount ? (remainingCount / totalCount) * 100 : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-85">
          <div className="h-3 overflow-hidden rounded-full bg-white/5">
            <div className="flex h-full w-full">
              <div
                className="bg-cyan-500"
                style={{ width: `${masteredWidth}%` }}
              />
              <div
                className="bg-cyan-300"
                style={{ width: `${learnedWidth}%` }}
              />
              <div
                className="bg-bs-text-muted"
                style={{ width: `${remainingWidth}%` }}
              />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-bs-text-sub">
            <span>Mastered: {masteredCount}</span>
            <span>Learned: {learnedCount}</span>
            <span>Remaining: {remainingCount}</span>
          </div>
        </div>

        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={maxOuter} fill="none" stroke="#e2e8f0" />
          <circle cx={cx} cy={cy} r={minOuter} fill="none" stroke="#cbd5e1" />
          {renderRing(arcs)}
          <circle cx={cx} cy={cy} r={rInner - 8} fill="white" />

          <text
            x={cx}
            y={cy + 2}
            textAnchor="middle"
            fontSize="48"
            fill="#0f172a"
            fontWeight={800}
          >
            {centerPct}%
          </text>
          <text
            x={cx}
            y={cy + 32}
            textAnchor="middle"
            fontSize="14"
            fill="#64748b"
            fontWeight={600}
          >
            overall mastery
          </text>
        </svg>

        <div className="-mt-4 text-center text-sm text-bs-text-sub">
          {hoverText(hoverKey)}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-3">
        <div className="mb-2 text-sm font-semibold text-bs-text">
          Color key by unit + TEKS
        </div>
        <div className="max-h-90 space-y-2 overflow-y-auto pr-1">
          {units.map((unit) => {
            const isHover = hoverKey === unit.key;
            return (
              <button
                type="button"
                key={unit.key}
                onMouseEnter={() => setHoverKey(unit.key)}
                onMouseLeave={() => setHoverKey(null)}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                  isHover
                    ? "border-[var(--bs-border)] bg-[var(--bs-raised)]"
                    : "border-[var(--bs-border)] bg-bs-surface hover:bg-[var(--bs-raised)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: unit.color }}
                    />
                    <span className="truncate text-sm font-semibold text-bs-text">
                      {unit.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-bs-text-sub">
                    {unit.masteryPct}%
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-bs-text-sub">
                  {unit.teksCount} TEKS • {unit.masteredCount} mastered •{" "}
                  {unit.remainingCount} need support
                </div>
                {unit.weakestTeks.length > 0 ? (
                  <div className="mt-1 text-[11px] text-bs-text-sub">
                    Focus: {unit.weakestTeks.join(" • ")}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
