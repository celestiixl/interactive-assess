"use client";

/**
 * GenomeBrowser – Interactive sequence and annotation navigator.
 * Aligned with FBISD Biology Unit 2: Nucleic Acids & Protein Synthesis.
 * TEKS: B.7A (DNA components, sequence specifies traits), B.7C (DNA changes).
 */

import { useRef, useState, useCallback, useEffect } from "react";
import type {
  DemoSequence,
  GenomeAnnotation,
  AnnotationType,
} from "@/data/genomeBrowserData";
import {
  ANNOTATION_COLORS,
  ANNOTATION_LABEL,
  BASE_COLORS,
} from "@/data/genomeBrowserData";

// ── Constants ─────────────────────────────────────────────────────────────────

const RULER_HEIGHT = 28;
const SEQ_TRACK_HEIGHT = 32;
const ANNOTATION_TRACK_HEIGHT = 26;
const ANNOTATION_TRACK_GAP = 6;
const TRACK_LABEL_W = 80;
const MIN_BP_VISIBLE = 10;
const MAX_ZOOM_FACTOR = 4; // how many times we can zoom in each step

// ── Helpers ───────────────────────────────────────────────────────────────────

function complement(base: string): string {
  return { A: "T", T: "A", C: "G", G: "C" }[base] ?? "N";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Assign annotations to non-overlapping rows. */
function layoutAnnotations(
  annotations: GenomeAnnotation[],
): (GenomeAnnotation & { row: number })[] {
  const rows: number[] = []; // rows[i] = end position of last annotation in row i

  return annotations.map((ann) => {
    let row = 0;
    while (rows[row] !== undefined && rows[row] >= ann.start) {
      row++;
    }
    rows[row] = ann.end;
    return { ...ann, row };
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BaseCell({
  base,
  width,
  showText,
}: {
  base: string;
  width: number;
  showText: boolean;
}) {
  const color = BASE_COLORS[base] ?? "#94a3b8";
  return (
    <div
      className="flex items-center justify-center shrink-0 font-mono font-bold text-white select-none"
      style={{
        width,
        height: SEQ_TRACK_HEIGHT,
        backgroundColor: color,
        fontSize: Math.max(8, Math.min(14, width * 0.7)),
      }}
    >
      {showText ? base : null}
    </div>
  );
}

interface AnnotationBarProps {
  ann: GenomeAnnotation & { row: number };
  viewStart: number;
  viewEnd: number;
  pixelsPerBp: number;
  isSelected: boolean;
  onClick: (ann: GenomeAnnotation) => void;
}

function AnnotationBar({
  ann,
  viewStart,
  viewEnd,
  pixelsPerBp,
  isSelected,
  onClick,
}: AnnotationBarProps) {
  const visStart = Math.max(ann.start, viewStart);
  const visEnd = Math.min(ann.end, viewEnd);
  if (visStart > visEnd) return null;

  const left = (visStart - viewStart) * pixelsPerBp;
  const width = Math.max(2, (visEnd - visStart + 1) * pixelsPerBp);
  const top = ann.row * (ANNOTATION_TRACK_HEIGHT + ANNOTATION_TRACK_GAP);
  const color = ANNOTATION_COLORS[ann.type] ?? "#6366f1";

  return (
    <button
      type="button"
      aria-label={`Annotation: ${ann.label}`}
      className="absolute rounded cursor-pointer transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
      style={{
        left,
        top,
        width,
        height: ANNOTATION_TRACK_HEIGHT,
        backgroundColor: color,
        opacity: isSelected ? 1 : 0.85,
        outline: isSelected ? `2px solid ${color}` : undefined,
        outlineOffset: isSelected ? 2 : undefined,
        zIndex: isSelected ? 10 : 1,
      }}
      onClick={() => onClick(ann)}
    >
      {width > 30 && (
        <span
          className="px-1 text-white font-semibold truncate block"
          style={{ fontSize: Math.min(11, width / ann.label.length + 1) }}
        >
          {ann.label}
        </span>
      )}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GenomeBrowser({ sequence }: { sequence: DemoSequence }) {
  const seqLen = sequence.sequence.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(700);

  const [viewStart, setViewStart] = useState(1);
  const [viewEnd, setViewEnd] = useState(Math.min(80, seqLen));
  const [showComplement, setShowComplement] = useState(false);
  const [selectedAnn, setSelectedAnn] = useState<GenomeAnnotation | null>(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState<AnnotationType | "all">("all");

  // Measure container width on mount and resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 700;
      setContainerWidth(Math.max(300, w));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const bpVisible = viewEnd - viewStart + 1;
  const sequenceWidth = containerWidth - TRACK_LABEL_W;
  const pixelsPerBp = sequenceWidth / bpVisible;

  // ── Navigation ────────────────────────────────────────────────────────────

  const zoomIn = useCallback(() => {
    const center = Math.round((viewStart + viewEnd) / 2);
    const newHalf = Math.max(
      Math.floor(MIN_BP_VISIBLE / 2),
      Math.floor(bpVisible / (MAX_ZOOM_FACTOR * 1.5)),
    );
    const newStart = clamp(center - newHalf, 1, seqLen);
    const newEnd = clamp(center + newHalf, newStart, seqLen);
    setViewStart(newStart);
    setViewEnd(newEnd);
  }, [viewStart, viewEnd, bpVisible, seqLen]);

  const zoomOut = useCallback(() => {
    const center = Math.round((viewStart + viewEnd) / 2);
    const newHalf = Math.min(
      Math.floor(seqLen / 2),
      Math.floor((bpVisible * MAX_ZOOM_FACTOR * 1.5) / 2),
    );
    const newStart = clamp(center - newHalf, 1, seqLen);
    const newEnd = clamp(center + newHalf, newStart, seqLen);
    setViewStart(newStart);
    setViewEnd(newEnd);
  }, [viewStart, viewEnd, bpVisible, seqLen]);

  const panLeft = useCallback(() => {
    const step = Math.max(1, Math.floor(bpVisible / 4));
    const newStart = Math.max(1, viewStart - step);
    setViewStart(newStart);
    setViewEnd(newStart + bpVisible - 1);
  }, [viewStart, bpVisible]);

  const panRight = useCallback(() => {
    const step = Math.max(1, Math.floor(bpVisible / 4));
    const newEnd = Math.min(seqLen, viewEnd + step);
    setViewEnd(newEnd);
    setViewStart(newEnd - bpVisible + 1);
  }, [viewEnd, bpVisible, seqLen]);

  const resetView = useCallback(() => {
    setViewStart(1);
    setViewEnd(Math.min(80, seqLen));
    setSelectedAnn(null);
  }, [seqLen]);

  const jumpToAnnotation = useCallback(
    (ann: GenomeAnnotation) => {
      const pad = Math.max(5, Math.floor((ann.end - ann.start + 1) * 0.3));
      const newStart = clamp(ann.start - pad, 1, seqLen);
      const newEnd = clamp(ann.end + pad, 1, seqLen);
      setViewStart(newStart);
      setViewEnd(newEnd);
      setSelectedAnn(ann);
    },
    [seqLen],
  );

  // ── Derived data ───────────────────────────────────────────────────────────

  const visibleSequence = sequence.sequence.slice(viewStart - 1, viewEnd);

  const filteredAnnotations = sequence.annotations.filter(
    (a) =>
      a.end >= viewStart &&
      a.start <= viewEnd &&
      (activeTypeFilter === "all" || a.type === activeTypeFilter),
  );

  const laidOut = layoutAnnotations(filteredAnnotations);
  const numRows = laidOut.reduce((m, a) => Math.max(m, a.row + 1), 0);
  const annotationAreaHeight =
    numRows * (ANNOTATION_TRACK_HEIGHT + ANNOTATION_TRACK_GAP) + ANNOTATION_TRACK_GAP;

  // Ruler tick interval
  const tickInterval = (() => {
    const intervals = [1, 2, 5, 10, 20, 25, 50, 100];
    const targetTicks = Math.floor(sequenceWidth / 60);
    const step = Math.ceil(bpVisible / targetTicks);
    return intervals.find((i) => i >= step) ?? 100;
  })();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Pan/Zoom */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            aria-label="Pan left"
            disabled={viewStart <= 1}
            onClick={panLeft}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            ◀ Pan
          </button>
          <button
            type="button"
            aria-label="Pan right"
            disabled={viewEnd >= seqLen}
            onClick={panRight}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            Pan ▶
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            aria-label="Zoom in"
            disabled={bpVisible <= MIN_BP_VISIBLE}
            onClick={zoomIn}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            🔍+
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            disabled={bpVisible >= seqLen}
            onClick={zoomOut}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            🔍−
          </button>
        </div>

        <button
          type="button"
          onClick={resetView}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={() => setShowComplement((v) => !v)}
          className={`rounded-xl border px-3 py-1.5 text-sm font-semibold shadow-sm transition ${
            showComplement
              ? "border-indigo-300 bg-indigo-50 text-indigo-800"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {showComplement ? "Hide" : "Show"} Complement
        </button>

        {/* Position indicator */}
        <div className="ml-auto rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-600">
          Viewing bp {viewStart}–{viewEnd} &nbsp;|&nbsp; {bpVisible} bp &nbsp;|&nbsp; {pixelsPerBp.toFixed(1)} px/bp
        </div>
      </div>

      {/* ── Track area ────────────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm"
      >
        {/* Ruler row */}
        <div className="flex" style={{ height: RULER_HEIGHT }}>
          <div
            className="shrink-0 flex items-center justify-end pr-2 text-[10px] font-semibold text-slate-400 border-r border-slate-200"
            style={{ width: TRACK_LABEL_W }}
          >
            Position
          </div>
          <div className="relative flex-1 bg-slate-50 border-b border-slate-200 overflow-hidden">
            {/* Tick marks */}
            {Array.from({ length: Math.ceil(bpVisible / tickInterval) + 1 }).map((_, i) => {
              const pos =
                Math.ceil(viewStart / tickInterval) * tickInterval + i * tickInterval;
              if (pos > viewEnd || pos < viewStart) return null;
              const x = (pos - viewStart) * pixelsPerBp;
              return (
                <div key={pos} className="absolute top-0 flex flex-col items-center" style={{ left: x }}>
                  <div className="w-px h-2 bg-slate-400" />
                  <span className="text-[9px] font-mono text-slate-500 mt-0.5 whitespace-nowrap">
                    {pos}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sense strand row */}
        <div className="flex">
          <div
            className="shrink-0 flex items-center justify-end pr-2 text-[10px] font-semibold text-slate-400 border-r border-slate-200"
            style={{ width: TRACK_LABEL_W, minHeight: SEQ_TRACK_HEIGHT }}
          >
            5′→3′
          </div>
          <div className="flex overflow-hidden" style={{ height: SEQ_TRACK_HEIGHT }}>
            {visibleSequence.split("").map((base, i) => (
              <BaseCell
                key={i}
                base={base}
                width={pixelsPerBp}
                showText={pixelsPerBp >= 12}
              />
            ))}
          </div>
        </div>

        {/* Complement strand row */}
        {showComplement && (
          <div className="flex border-t border-slate-100">
            <div
              className="shrink-0 flex items-center justify-end pr-2 text-[10px] font-semibold text-slate-400 border-r border-slate-200"
              style={{ width: TRACK_LABEL_W, minHeight: SEQ_TRACK_HEIGHT }}
            >
              3′←5′
            </div>
            <div className="flex overflow-hidden" style={{ height: SEQ_TRACK_HEIGHT }}>
              {visibleSequence.split("").map((base, i) => (
                <BaseCell
                  key={i}
                  base={complement(base)}
                  width={pixelsPerBp}
                  showText={pixelsPerBp >= 12}
                />
              ))}
            </div>
          </div>
        )}

        {/* Annotation tracks */}
        <div className="flex border-t border-slate-100">
          <div
            className="shrink-0 flex items-start justify-end pr-2 pt-2 text-[10px] font-semibold text-slate-400 border-r border-slate-200"
            style={{ width: TRACK_LABEL_W, minHeight: annotationAreaHeight }}
          >
            Features
          </div>
          <div
            className="relative flex-1 overflow-hidden"
            style={{ height: Math.max(32, annotationAreaHeight) }}
          >
            {laidOut.map((ann) => (
              <AnnotationBar
                key={ann.id}
                ann={ann}
                viewStart={viewStart}
                viewEnd={viewEnd}
                pixelsPerBp={pixelsPerBp}
                isSelected={selectedAnn?.id === ann.id}
                onClick={setSelectedAnn}
              />
            ))}
            {laidOut.length === 0 && (
              <div className="flex h-full items-center justify-center text-xs text-slate-400 italic">
                No features in view — pan or zoom out to see annotations
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Type filter pills ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-slate-500">Filter:</span>
        <button
          type="button"
          onClick={() => setActiveTypeFilter("all")}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            activeTypeFilter === "all"
              ? "bg-slate-900 border-slate-900 text-white"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          All ({sequence.annotations.length})
        </button>
        {(
          [
            "gene",
            "promoter",
            "tatabox",
            "exon",
            "intron",
            "utr",
            "start_codon",
            "stop_codon",
            "mutation",
            "regulatory",
          ] as AnnotationType[]
        )
          .filter((t) => sequence.annotations.some((a) => a.type === t))
          .map((t) => {
            const count = sequence.annotations.filter((a) => a.type === t).length;
            const color = ANNOTATION_COLORS[t];
            return (
              <button
                key={t}
                type="button"
                onClick={() =>
                  setActiveTypeFilter((prev) => (prev === t ? "all" : t))
                }
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  activeTypeFilter === t
                    ? "ring-1 ring-current"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
                style={
                  activeTypeFilter === t
                    ? {
                        backgroundColor: color + "22",
                        borderColor: color,
                        color,
                      }
                    : {}
                }
              >
                {ANNOTATION_LABEL[t]} ({count})
              </button>
            );
          })}
      </div>

      {/* ── Annotation detail panel ───────────────────────────────────────── */}
      {selectedAnn ? (
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{
            borderColor: ANNOTATION_COLORS[selectedAnn.type] + "66",
            backgroundColor: ANNOTATION_COLORS[selectedAnn.type] + "11",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: ANNOTATION_COLORS[selectedAnn.type] }}
                >
                  {ANNOTATION_LABEL[selectedAnn.type]}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedAnn.label}
                </h3>
              </div>
              <p className="mt-1 text-xs font-mono text-slate-500">
                Position {selectedAnn.start}–{selectedAnn.end} &nbsp;·&nbsp;
                {selectedAnn.end - selectedAnn.start + 1} bp &nbsp;·&nbsp;
                Strand {selectedAnn.strand}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close detail panel"
              onClick={() => setSelectedAnn(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
            {selectedAnn.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {selectedAnn.teks.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-mono text-slate-700"
              >
                {t}
              </span>
            ))}
            <button
              type="button"
              onClick={() => jumpToAnnotation(selectedAnn)}
              className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Jump to Feature ↗
            </button>
          </div>

          {/* Sequence excerpt */}
          {selectedAnn.end - selectedAnn.start <= 50 && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                Sequence ({selectedAnn.end - selectedAnn.start + 1} bp)
              </div>
              <div className="flex flex-wrap gap-0.5 font-mono text-xs">
                {sequence.sequence
                  .slice(selectedAnn.start - 1, selectedAnn.end)
                  .split("")
                  .map((base, i) => (
                    <span
                      key={i}
                      className="font-bold"
                      style={{ color: BASE_COLORS[base] ?? "#94a3b8" }}
                    >
                      {base}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500 text-center">
          Click any annotation bar above to see its biological description and TEKS alignment.
        </div>
      )}

      {/* ── Feature index ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">All Features</h3>
          <span className="text-xs text-slate-400">{sequence.annotations.length} annotations</span>
        </div>
        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
          {sequence.annotations.map((ann) => (
            <button
              key={ann.id}
              type="button"
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-slate-50 transition ${
                selectedAnn?.id === ann.id ? "bg-slate-50" : ""
              }`}
              onClick={() => jumpToAnnotation(ann)}
            >
              <span
                className="shrink-0 h-3 w-3 rounded-full"
                style={{ backgroundColor: ANNOTATION_COLORS[ann.type] }}
              />
              <span className="flex-1 text-xs font-semibold text-slate-800 truncate">
                {ann.label}
              </span>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {ann.start}–{ann.end}
              </span>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold text-white"
                style={{ backgroundColor: ANNOTATION_COLORS[ann.type] }}
              >
                {ANNOTATION_LABEL[ann.type]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
