"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { BackLink } from "@/components/nav/BackLink";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import { PageBanner, PageContent } from "@/components/ui";

// ── Types ──────────────────────────────────────────────────────────────────
type SimMode =
  | "hardy-weinberg"
  | "genetic-drift"
  | "natural-selection"
  | "bottleneck";

interface RunSeries {
  data: number[];
  color: string;
}

// ── Color tokens (dark-mode aware, matches BioSpark theme) ───────────────
const C = {
  bg: "#0f1117",
  surface: "#1a1d27",
  border: "#2a2d3e",
  accent1: "#6366f1", // indigo — allele A1
  accent2: "#f59e0b", // amber  — allele A2
  accent3: "#10b981", // emerald — fitness/expected line
  text: "#e2e8f0",
  muted: "#64748b",
  danger: "#ef4444",
  success: "#22c55e",
};

// Palette for multiple replicate runs
const RUN_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
];

// ── Hardy-Weinberg expected genotype frequencies ──────────────────────────
function hwExpected(p: number) {
  const q = 1 - p;
  return { AA: p * p, Aa: 2 * p * q, aa: q * q };
}

// ── Simulate one generation (Wright-Fisher model) ─────────────────────────
function nextGen(
  p: number,
  N: number,
  selCoeff: number,
  dominance: number,
  bottleneck: boolean,
  isMutation: boolean,
  muRate: number,
): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;

  const q = 1 - p;
  // natural selection: compute mean fitness
  const wAA = 1;
  const wAa = 1 - dominance * selCoeff;
  const waa = 1 - selCoeff;
  const wBar = p * p * wAA + 2 * p * q * wAa + q * q * waa;
  let p2 = wBar === 0 ? p : (p * p * wAA + p * q * wAa) / wBar;

  // mutation pressure (bidirectional)
  if (isMutation) {
    p2 = p2 * (1 - muRate) + (1 - p2) * muRate;
  }

  // bottleneck: reduce effective population size to 10% this generation
  const effectiveN = bottleneck ? Math.max(2, Math.floor(N * 0.1)) : N;

  // genetic drift: binomial sampling (2N allele draws)
  const alleles = effectiveN * 2;
  let heads = 0;
  for (let i = 0; i < alleles; i++) {
    if (Math.random() < p2) heads++;
  }
  return heads / alleles;
}

// ── Simulate a full run ───────────────────────────────────────────────────
function simulateRun(
  p0: number,
  N: number,
  generations: number,
  selCoeff: number,
  dominance: number,
  mode: SimMode,
  isMutation: boolean,
  muRate: number,
  bottleneckGen: number,
): number[] {
  const data: number[] = [p0];
  let p = p0;

  // Hardy-Weinberg: no drift or selection — just flat deterministic
  if (mode === "hardy-weinberg") {
    for (let g = 1; g <= generations; g++) {
      data.push(p);
    }
    return data;
  }

  for (let g = 1; g <= generations; g++) {
    const isBottleneckGen =
      mode === "bottleneck" && g === bottleneckGen;
    p = nextGen(
      p,
      N,
      mode === "natural-selection" ? selCoeff : 0,
      dominance,
      isBottleneckGen,
      isMutation,
      muRate,
    );
    data.push(p);
    if (p <= 0 || p >= 1) break; // allele fixed or lost
  }
  return data;
}

// ── Mini line chart (pure canvas, responsive) ─────────────────────────────
function LineChart({
  series,
  height = 200,
  yLabel = "Allele freq (p)",
  generations,
  showHW,
  p0,
}: {
  series: RunSeries[];
  height?: number;
  yLabel?: string;
  generations: number;
  showHW: boolean;
  p0: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.floor(w));
    });
    ro.observe(el);
    setWidth(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(dpr, dpr);

    const pad = { top: 14, right: 16, bottom: 36, left: 48 };
    const W = width - pad.left - pad.right;
    const H = height - pad.top - pad.bottom;

    // background
    ctx.fillStyle = C.surface;
    ctx.fillRect(0, 0, width, height);

    // grid lines & y-axis labels
    ctx.strokeStyle = C.border;
    ctx.lineWidth = 0.6;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (H / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + W, y);
      ctx.stroke();
      ctx.fillStyle = C.muted;
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText((1 - i / 4).toFixed(2), pad.left - 6, y + 4);
    }

    const maxLen = generations + 1;

    // Hardy-Weinberg expected (dotted line at p0)
    if (showHW && p0 > 0 && p0 < 1) {
      ctx.beginPath();
      ctx.strokeStyle = C.accent3;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      const hy = pad.top + H - p0 * H;
      ctx.moveTo(pad.left, hy);
      ctx.lineTo(pad.left + W, hy);
      ctx.stroke();
      ctx.setLineDash([]);
      // label
      ctx.fillStyle = C.accent3;
      ctx.font = "9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`HW p=${p0.toFixed(2)}`, pad.left + 4, hy - 4);
    }

    // draw each run series
    series.forEach(({ data, color }) => {
      if (data.length < 1) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.globalAlpha = series.length > 3 ? 0.7 : 1;
      data.forEach((v, i) => {
        const x = pad.left + (i / (maxLen - 1)) * W;
        const y = pad.top + H - v * H;
        if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
      });
      ctx.stroke();
      ctx.globalAlpha = 1;

      // terminal dot
      const last = data[data.length - 1];
      const lx = pad.left + ((data.length - 1) / (maxLen - 1)) * W;
      const ly = pad.top + H - last * H;
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    // axes labels
    ctx.fillStyle = C.muted;
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`Generation (0–${generations})`, pad.left + W / 2, height - 6);
    ctx.save();
    ctx.translate(12, pad.top + H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
  }, [series, width, height, yLabel, generations, showHW, p0]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        aria-label={yLabel + " chart"}
        role="img"
        className="rounded-xl"
      />
    </div>
  );
}

// ── Slider control ────────────────────────────────────────────────────────
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  disabled?: boolean;
}) {
  const fmt = format ?? ((v: number) => v.toString());
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300">{label}</label>
        <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-xs text-slate-200">
          {fmt(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={label}
      />
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────
function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={label}
        />
        <div
          className={`h-5 w-9 rounded-full transition-colors ${
            checked ? "bg-indigo-500" : "bg-slate-600"
          } ${disabled ? "opacity-40" : ""}`}
        />
        <div
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-xs font-semibold text-slate-300">{label}</span>
    </label>
  );
}

// ── Main simulation component ─────────────────────────────────────────────
export default function PopulationGeneticsSimPage() {
  // sim params
  const [mode, setMode] = useState<SimMode>("genetic-drift");
  const [p0, setP0] = useState(0.5);
  const [N, setN] = useState(100);
  const [generations, setGenerations] = useState(100);
  const [selCoeff, setSelCoeff] = useState(0.1);
  const [dominance, setDominance] = useState(0.5);
  const [isMutation, setIsMutation] = useState(false);
  const [muRate, setMuRate] = useState(0.001);
  const [replicates, setReplicates] = useState(5);
  const [bottleneckGen, setBottleneckGen] = useState(50);

  // results
  const [runSeries, setRunSeries] = useState<RunSeries[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [fixationCount, setFixationCount] = useState(0);
  const [lossCount, setLossCount] = useState(0);

  const hw = hwExpected(p0);

  const runSimulation = useCallback(() => {
    setIsRunning(true);
    const series: RunSeries[] = [];
    let fixed = 0;
    let lost = 0;

    for (let r = 0; r < replicates; r++) {
      const data = simulateRun(
        p0,
        N,
        generations,
        selCoeff,
        dominance,
        mode,
        isMutation,
        muRate,
        bottleneckGen,
      );
      const lastP = data[data.length - 1];
      if (lastP >= 1) fixed++;
      if (lastP <= 0) lost++;
      series.push({ data, color: RUN_COLORS[r % RUN_COLORS.length] });
    }

    setRunSeries(series);
    setFixationCount(fixed);
    setLossCount(lost);
    setIsRunning(false);
  }, [p0, N, generations, selCoeff, dominance, mode, isMutation, muRate, replicates, bottleneckGen]);

  const handleReset = () => {
    setRunSeries([]);
    setFixationCount(0);
    setLossCount(0);
  };

  // run automatically when params change (debounced)
  useEffect(() => {
    const id = setTimeout(() => runSimulation(), 200);
    return () => clearTimeout(id);
  }, [runSimulation]);

  const modeLabels: Record<SimMode, { label: string; desc: string }> = {
    "hardy-weinberg": {
      label: "Hardy-Weinberg",
      desc: "No drift, no selection — ideal equilibrium. p stays constant.",
    },
    "genetic-drift": {
      label: "Genetic Drift",
      desc: "Random sampling causes allele frequencies to wander. Smaller N → faster fixation/loss.",
    },
    "natural-selection": {
      label: "Natural Selection",
      desc: "Differential fitness (s, h) shapes allele frequency change over time.",
    },
    bottleneck: {
      label: "Bottleneck",
      desc: "Population crashes at a chosen generation, amplifying drift effects.",
    },
  };

  return (
    <main className="ia-vh-page flex min-h-dvh flex-col text-slate-900 dark:text-slate-100">
      <BackLink href="/student/dashboard" label="Back to dashboard" />
      <PageBanner
        title="Population Genetics Simulator"
        subtitle="Explore allele frequency dynamics: Hardy-Weinberg, genetic drift, natural selection, and bottleneck events."
      >
      </PageBanner>

      <PageContent className="py-6">
        <div className="mx-auto max-w-6xl">
          {/* TEKS tag */}
          <div className="mb-4 flex flex-wrap gap-2">
            {["B.5B", "B.7A", "B.7C"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
              >
                {t}
              </span>
            ))}
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Interactive Model
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            {/* ── Controls panel ── */}
            <aside
              className="rounded-2xl p-5 text-slate-200"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}
            >
              {/* Mode selector */}
              <div className="mb-5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Simulation Mode
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(modeLabels) as SimMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                        mode === m
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {modeLabels[m].label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {modeLabels[mode].desc}
                </p>
              </div>

              <div className="space-y-4">
                {/* Initial frequency */}
                <Slider
                  label="Initial freq p₀"
                  value={p0}
                  min={0.01}
                  max={0.99}
                  step={0.01}
                  onChange={setP0}
                  format={(v) => v.toFixed(2)}
                />

                {/* Population size */}
                <Slider
                  label="Population size (N)"
                  value={N}
                  min={10}
                  max={1000}
                  step={10}
                  onChange={setN}
                  disabled={mode === "hardy-weinberg"}
                  format={(v) => v.toLocaleString()}
                />

                {/* Generations */}
                <Slider
                  label="Generations"
                  value={generations}
                  min={20}
                  max={500}
                  step={10}
                  onChange={setGenerations}
                  format={(v) => v.toString()}
                />

                {/* Replicates */}
                <Slider
                  label="Replicates"
                  value={replicates}
                  min={1}
                  max={8}
                  step={1}
                  onChange={setReplicates}
                  disabled={mode === "hardy-weinberg"}
                  format={(v) => v.toString()}
                />

                {/* Selection params */}
                <div
                  className={`space-y-4 transition-opacity ${
                    mode === "natural-selection"
                      ? "opacity-100"
                      : "pointer-events-none opacity-30"
                  }`}
                >
                  <Slider
                    label="Selection coeff (s)"
                    value={selCoeff}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={setSelCoeff}
                    format={(v) => v.toFixed(2)}
                  />
                  <Slider
                    label="Dominance (h)"
                    value={dominance}
                    min={0}
                    max={1}
                    step={0.05}
                    onChange={setDominance}
                    format={(v) =>
                      v === 0
                        ? "0 (recessive)"
                        : v === 0.5
                          ? "0.5 (additive)"
                          : v === 1
                            ? "1 (dominant)"
                            : v.toFixed(2)
                    }
                  />
                </div>

                {/* Bottleneck generation */}
                {mode === "bottleneck" && (
                  <Slider
                    label="Bottleneck at generation"
                    value={bottleneckGen}
                    min={1}
                    max={generations - 1}
                    step={1}
                    onChange={setBottleneckGen}
                    format={(v) => `gen ${v}`}
                  />
                )}

                {/* Mutation toggle */}
                <div className="border-t border-slate-700 pt-3">
                  <Toggle
                    label="Mutation pressure"
                    checked={isMutation}
                    onChange={setIsMutation}
                    disabled={mode === "hardy-weinberg"}
                  />
                  {isMutation && (
                    <div className="mt-3">
                      <Slider
                        label="Mutation rate (μ)"
                        value={muRate}
                        min={0.0001}
                        max={0.05}
                        step={0.0001}
                        onChange={setMuRate}
                        format={(v) => v.toExponential(2)}
                      />
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 border-t border-slate-700 pt-3">
                  <button
                    type="button"
                    onClick={runSimulation}
                    disabled={isRunning}
                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                    aria-label="Re-run simulation"
                  >
                    ↺ Re-run
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-600"
                    aria-label="Reset simulation"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </aside>

            {/* ── Chart + stats panel ── */}
            <section className="flex flex-col gap-5">
              {/* Main chart */}
              <div
                className="rounded-2xl p-4"
                style={{ background: C.surface, border: `1px solid ${C.border}` }}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-200">
                    Allele Frequency Over Time
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <span
                        className="inline-block h-2.5 w-5 rounded-sm"
                        style={{ background: C.accent1 }}
                      />
                      Replicate runs
                    </span>
                    {mode !== "hardy-weinberg" && (
                      <span className="flex items-center gap-1">
                        <span
                          className="inline-block h-1 w-5 rounded-sm border-t-2 border-dashed"
                          style={{ borderColor: C.accent3 }}
                        />
                        HW equilibrium
                      </span>
                    )}
                  </div>
                </div>
                <LineChart
                  series={runSeries}
                  height={220}
                  yLabel="Allele freq (p)"
                  generations={generations}
                  showHW={mode !== "hardy-weinberg"}
                  p0={p0}
                />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    label: "Initial p₀",
                    value: p0.toFixed(3),
                    sub: "allele A freq",
                    color: "indigo",
                  },
                  {
                    label: "HW: AA",
                    value: hw.AA.toFixed(3),
                    sub: `p² = ${(p0 * p0).toFixed(3)}`,
                    color: "violet",
                  },
                  {
                    label: "HW: Aa",
                    value: hw.Aa.toFixed(3),
                    sub: `2pq = ${(2 * p0 * (1 - p0)).toFixed(3)}`,
                    color: "amber",
                  },
                  {
                    label: "HW: aa",
                    value: hw.aa.toFixed(3),
                    sub: `q² = ${((1 - p0) * (1 - p0)).toFixed(3)}`,
                    color: "emerald",
                  },
                ].map(({ label, value, sub, color }) => {
                  const valueColorClass =
                    color === "indigo"
                      ? "text-indigo-400"
                      : color === "violet"
                        ? "text-violet-400"
                        : color === "amber"
                          ? "text-amber-400"
                          : "text-emerald-400";
                  return (
                  <div
                    key={label}
                    className="rounded-2xl p-4"
                    style={{
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                    }}
                  >
                    <div className="text-xs font-semibold text-slate-400">
                      {label}
                    </div>
                    <div
                      className={`mt-1 text-xl font-bold ${valueColorClass}`}
                    >
                      {value}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-slate-500">
                      {sub}
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Drift outcomes */}
              {mode !== "hardy-weinberg" && runSeries.length > 0 && (
                <div
                  className="grid grid-cols-3 gap-3 rounded-2xl p-4"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-400">
                      Runs
                    </div>
                    <div className="mt-1 text-2xl font-bold text-slate-200">
                      {replicates}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">
                      A fixed (p→1)
                    </div>
                    <div className="mt-1 text-2xl font-bold text-indigo-400">
                      {fixationCount}
                    </div>
                    <div className="text-xs text-slate-500">
                      {((fixationCount / replicates) * 100).toFixed(0)}% of runs
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400">
                      A lost (p→0)
                    </div>
                    <div className="mt-1 text-2xl font-bold text-amber-400">
                      {lossCount}
                    </div>
                    <div className="text-xs text-slate-500">
                      {((lossCount / replicates) * 100).toFixed(0)}% of runs
                    </div>
                  </div>
                </div>
              )}

              {/* Concept explainer */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div className="mb-3 text-sm font-semibold text-slate-200">
                  What am I seeing?
                </div>
                {mode === "hardy-weinberg" && (
                  <div className="space-y-2 text-sm text-slate-400">
                    <p>
                      Under the <strong className="text-slate-200">Hardy-Weinberg principle</strong>, allele
                      frequencies stay constant across generations when:
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>Population is infinitely large (no genetic drift)</li>
                      <li>Random mating occurs</li>
                      <li>No mutation, migration, or selection</li>
                    </ul>
                    <p>
                      Genotype frequencies follow: <code className="text-indigo-300">p²</code> (AA),{" "}
                      <code className="text-amber-300">2pq</code> (Aa), <code className="text-emerald-300">q²</code> (aa)
                    </p>
                    <p className="text-xs text-slate-500">
                      TEKS B.5B — Compare/contrast cell types; this model underpins population-level genetics (B.7A, B.7C).
                    </p>
                  </div>
                )}
                {mode === "genetic-drift" && (
                  <div className="space-y-2 text-sm text-slate-400">
                    <p>
                      <strong className="text-slate-200">Genetic drift</strong> is random change in allele frequency
                      caused by chance sampling each generation (Wright-Fisher model).
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>
                        Small N → large sampling variance → faster fixation or loss
                      </li>
                      <li>
                        Probability of fixation ≈ <em>p₀</em> (initial frequency)
                      </li>
                      <li>
                        Expected time to fixation ≈ 4N generations
                      </li>
                    </ul>
                    <p className="text-xs text-slate-500">
                      TEKS B.7C — Changes in DNA and their significance.
                    </p>
                  </div>
                )}
                {mode === "natural-selection" && (
                  <div className="space-y-2 text-sm text-slate-400">
                    <p>
                      <strong className="text-slate-200">Natural selection</strong> favors alleles that increase
                      fitness. The <em>selection coefficient s</em> measures the fitness cost on the{" "}
                      <em>aa</em> genotype.
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>
                        <code className="text-slate-200">h = 0</code>: A is recessive (aa is deleterious)
                      </li>
                      <li>
                        <code className="text-slate-200">h = 0.5</code>: additive dominance
                      </li>
                      <li>
                        <code className="text-slate-200">h = 1</code>: A is fully dominant over a
                      </li>
                    </ul>
                    <p>Mean fitness: <code className="text-indigo-300">w̄ = p²·1 + 2pq·(1−hs) + q²·(1−s)</code></p>
                    <p className="text-xs text-slate-500">
                      TEKS B.7A — Nucleotide sequence specifies traits; B.7C — DNA changes and their significance.
                    </p>
                  </div>
                )}
                {mode === "bottleneck" && (
                  <div className="space-y-2 text-sm text-slate-400">
                    <p>
                      A <strong className="text-slate-200">population bottleneck</strong> is a sharp reduction in
                      population size. The surviving individuals carry only a subset of alleles.
                    </p>
                    <ul className="ml-4 list-disc space-y-1">
                      <li>
                        Effective population drops to ~10% of N at the bottleneck generation
                      </li>
                      <li>
                        Genetic diversity is reduced; rare alleles are often lost
                      </li>
                      <li>
                        Examples: cheetahs, northern elephant seals, human founder effects
                      </li>
                    </ul>
                    <p className="text-xs text-slate-500">
                      TEKS B.7C — Changes in DNA and their significance; B.5B — endosymbiotic theory context.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </PageContent>

      <StudentFloatingDock />
    </main>
  );
}
