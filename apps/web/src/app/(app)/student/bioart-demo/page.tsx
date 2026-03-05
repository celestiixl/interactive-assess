"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BIOART_ICONS,
  getIconsByCategory,
  type BioArtIcon,
} from "@/data/bioartIcons";
import SpecimenGrid from "@/components/student/SpecimenGrid";
import type { Segment } from "@/types/segment";
import { PageContent, PageBanner } from "@/components/ui";

// ── Category config ────────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  BioArtIcon["category"],
  { label: string; color: string; bg: string; border: string }
> = {
  cell: {
    label: "Cells",
    color: "text-blue-800",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  structure: {
    label: "Cell Structures",
    color: "text-violet-800",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  biomolecule: {
    label: "Biomolecules",
    color: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  organism: {
    label: "Organisms",
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  process: {
    label: "Processes",
    color: "text-cyan-800",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  genetics: {
    label: "Genetics",
    color: "text-rose-800",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
};

const CATEGORY_ORDER: BioArtIcon["category"][] = [
  "cell",
  "structure",
  "biomolecule",
  "organism",
  "process",
  "genetics",
];

// ── Demo segments for the live SpecimenGrid preview ────────────────────────────
// Each label is chosen to trigger a specific ORGANISMS match in SpecimenGrid.

const DEMO_SEGMENTS: Segment[] = [
  { key: "bacteria-prokaryote", label: "Bacteria & prokaryote cells", value: 0.9, group: "cells" },
  { key: "cell-membrane-transport", label: "Cell membrane transport", value: 0.78, group: "cells" },
  { key: "mitochondria-respiration", label: "Mitochondria & respiration", value: 0.82, group: "cells" },
  { key: "chloroplast-structure", label: "Chloroplast structure", value: 0.6, group: "cells" },
  { key: "nucleus-dna-storage", label: "Nucleus & DNA storage", value: 0.55, group: "cells" },
  { key: "ribosome-translation", label: "Ribosome translation", value: 0.72, group: "cells" },
  { key: "cell-biology-amoeba", label: "Cell biology & amoeba", value: 0.4, group: "cells" },
  { key: "enzyme-catalysis", label: "Enzyme catalysis", value: 0.88, group: "biomolecule" },
  { key: "protein-amino-acids", label: "Protein & amino acid chains", value: 0.65, group: "biomolecule" },
  { key: "carbohydrate-glucose", label: "Carbohydrate & glucose metabolism", value: 0.51, group: "biomolecule" },
  { key: "lipid-phospholipid", label: "Lipid & phospholipid membranes", value: 0.44, group: "biomolecule" },
  { key: "dna-helix-replication", label: "DNA double helix replication", value: 0.95, group: "genetics" },
  { key: "rna-transcription", label: "RNA & transcription", value: 0.7, group: "genetics" },
  { key: "gene-expression-codon", label: "Gene expression & protein synthesis", value: 0.58, group: "genetics" },
  { key: "dna-mutation-frameshift", label: "DNA mutation & frameshift", value: 0.3, group: "genetics" },
  { key: "genetic-heredity", label: "Genetic heredity", value: 0.62, group: "genetics" },
  { key: "photosynthesis-light", label: "Photosynthesis light reactions", value: 0.76, group: "energy" },
  { key: "energy-fungi-decomp", label: "Energy & fungi decomposition", value: 0.45, group: "energy" },
  { key: "virus-bacteriophage", label: "Virus & bacteriophage", value: 0.38, group: "organism" },
  { key: "zebrafish-dev-cycle", label: "Zebrafish development cycle", value: 0.55, group: "organism" },
  { key: "natural-selection-adapt", label: "Natural selection & adaptation", value: 0.79, group: "organism" },
  { key: "ecosystem-predator-prey", label: "Ecosystem predator-prey", value: 0.64, group: "organism" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function IconCard({ icon }: { icon: BioArtIcon }) {
  const meta = CATEGORY_META[icon.category];
  return (
    <div
      className={`rounded-2xl border ${meta.border} ${meta.bg} p-4 flex flex-col gap-2`}
    >
      {/* Emoji + label */}
      <div className="flex items-center gap-3">
        <span className="text-4xl leading-none">{icon.emoji}</span>
        <div>
          <div className="font-semibold text-slate-900 text-sm leading-tight">
            {icon.label}
          </div>
          <span
            className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${meta.border} ${meta.bg} ${meta.color}`}
          >
            {meta.label}
          </span>
        </div>
      </div>

      {/* TEKS tags */}
      {icon.teks.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {icon.teks.map((t) => (
            <span
              key={t}
              className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-mono text-slate-700"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* BioArt source link */}
      {icon.bioartId && (
        <a
          href={`https://bioart.niaid.nih.gov/bioart/${icon.bioartId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-blue-600 hover:underline"
        >
          NIH BioArt #{icon.bioartId} ↗
        </a>
      )}

      {/* Match keywords */}
      <div className="text-[10px] text-slate-500">
        <span className="font-semibold">Matches: </span>
        {icon.matchKeywords.join(", ")}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function BioArtDemoPage() {
  const [activeCategory, setActiveCategory] = useState<
    BioArtIcon["category"] | "all"
  >("all");
  const [showSpecimenGrid, setShowSpecimenGrid] = useState(true);

  const displayed =
    activeCategory === "all"
      ? BIOART_ICONS
      : getIconsByCategory(activeCategory);

  return (
    <main className="ia-vh-page flex h-dvh flex-col overflow-hidden text-slate-900">
      <PageBanner
        title="BioArt Icon Registry — Demo"
        subtitle={`${BIOART_ICONS.length} biology icons mapped to FBISD TEKS • Public domain from NIH BioArt (bioart.niaid.nih.gov)`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/student/dashboard"
            className="rounded-2xl bg-white/20 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/25"
          >
            ← Dashboard
          </Link>
          <a
            href="https://bioart.niaid.nih.gov/discover?sort=date_desc&page=2"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-white/20 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/25"
          >
            NIH BioArt Source ↗
          </a>
        </div>
      </PageBanner>

      <PageContent className="flex-1 min-h-0 py-4">
        <div className="ia-vh-scroll h-full min-h-0 overflow-y-auto pr-1 space-y-8">

          {/* ── Stats bar ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {CATEGORY_ORDER.map((cat) => {
              const icons = getIconsByCategory(cat);
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setActiveCategory((prev) =>
                      prev === cat ? "all" : cat,
                    )
                  }
                  className={`rounded-2xl border p-3 text-center transition hover:shadow-md cursor-pointer ${
                    activeCategory === cat
                      ? `${meta.bg} ${meta.border} ring-2 ring-offset-1`
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="text-2xl font-bold tabular-nums text-slate-900">
                    {icons.length}
                  </div>
                  <div className={`mt-0.5 text-xs font-semibold ${meta.color}`}>
                    {meta.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Filter pills ───────────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                activeCategory === "all"
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              All ({BIOART_ICONS.length})
            </button>
            {CATEGORY_ORDER.map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = getIconsByCategory(cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    setActiveCategory((prev) =>
                      prev === cat ? "all" : cat,
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    activeCategory === cat
                      ? `${meta.bg} ${meta.border} ${meta.color} ring-1 ring-current`
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {meta.label} ({count})
                </button>
              );
            })}
          </div>

          {/* ── Icon grid ──────────────────────────────────────────────────── */}
          <section>
            <h2 className="mb-3 text-base font-bold text-slate-900">
              {activeCategory === "all"
                ? `All Icons (${BIOART_ICONS.length})`
                : `${CATEGORY_META[activeCategory].label} (${displayed.length})`}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayed.map((icon) => (
                <IconCard key={icon.label} icon={icon} />
              ))}
            </div>
          </section>

          {/* ── Live SpecimenGrid preview ───────────────────────────────────── */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Live Specimen Grid Preview
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uses {DEMO_SEGMENTS.length} demo segments — each label triggers a different
                  organism from the new ORGANISMS registry. Segments ≥ 75% are
                  "Discovered!".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSpecimenGrid((v) => !v)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                {showSpecimenGrid ? "Hide" : "Show"}
              </button>
            </div>

            {showSpecimenGrid && (
              <>
                {/* Legend */}
                <div className="mb-4 flex flex-wrap gap-3 text-xs">
                  {[
                    { dot: "bg-emerald-400", label: "Discovered (≥ 75%)" },
                    { dot: "bg-blue-400", label: "Researching (40–74%)" },
                    { dot: "bg-slate-400", label: "Unknown (< 40%)" },
                  ].map(({ dot, label }) => (
                    <span key={label} className="flex items-center gap-1.5">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
                      <span className="text-slate-600">{label}</span>
                    </span>
                  ))}
                </div>
                <SpecimenGrid segments={DEMO_SEGMENTS} />
              </>
            )}
          </section>

          {/* ── Before / After comparison ──────────────────────────────────── */}
          <section>
            <h2 className="mb-3 text-base font-bold text-slate-900">
              Before vs After
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Before */}
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                <div className="mb-3 text-sm font-bold text-red-800">
                  Before — 7 hardcoded entries
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: "🦠", name: "Amoeba" },
                    { icon: "🐟", name: "Zebrafish" },
                    { icon: "🌿", name: "Elodea" },
                    { icon: "🪰", name: "Fruit Fly" },
                    { icon: "🐦", name: "Finch" },
                    { icon: "🐺", name: "Wolf" },
                    { icon: "🍄", name: "Mushroom" },
                  ].map(({ icon, name }) => (
                    <div
                      key={name}
                      className="flex flex-col items-center gap-1 rounded-xl border border-red-200 bg-white p-2 text-center"
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="text-[9px] text-slate-600">{name}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-red-700">
                  Single keyword per entry. No TEKS mapping. No category or BioArt attribution.
                </p>
              </div>

              {/* After */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="mb-3 text-sm font-bold text-emerald-800">
                  After — 22 deduplicated entries (+ 25-entry registry)
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { icon: "🧫", name: "E. coli" },
                    { icon: "🫧", name: "Cell Membrane" },
                    { icon: "⚡", name: "Mitochondria" },
                    { icon: "🌿", name: "Chloroplast" },
                    { icon: "🔮", name: "Nucleus" },
                    { icon: "🔵", name: "Ribosome" },
                    { icon: "🦠", name: "Amoeba" },
                    { icon: "⚗️", name: "Enzyme" },
                    { icon: "🔗", name: "Protein" },
                    { icon: "🍬", name: "Carbohydrate" },
                    { icon: "💧", name: "Lipid" },
                    { icon: "🧬", name: "DNA" },
                    { icon: "🧶", name: "RNA" },
                    { icon: "📖", name: "Gene Expr." },
                    { icon: "🔄", name: "Mutation" },
                    { icon: "🪰", name: "Fruit Fly" },
                    { icon: "🪴", name: "Elodea" },
                    { icon: "🍄", name: "Mushroom" },
                    { icon: "🦠", name: "Virus" },
                    { icon: "🐟", name: "Zebrafish" },
                    { icon: "🐦", name: "Finch" },
                    { icon: "🐺", name: "Wolf" },
                  ].map(({ icon, name }) => (
                    <div
                      key={name}
                      className="flex flex-col items-center gap-1 rounded-xl border border-emerald-200 bg-white p-2 text-center"
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="text-[9px] text-slate-600">{name}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-emerald-700">
                  Multi-keyword arrays. TEKS codes per icon. BioArt source IDs where available.
                  Category groupings and helper functions included.
                </p>
              </div>
            </div>
          </section>

          {/* ── Attribution footer ─────────────────────────────────────────── */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <span className="font-semibold">Attribution: </span>
            Icons sourced from the{" "}
            <a
              href="https://bioart.niaid.nih.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              NIH BioArt Source
            </a>{" "}
            by the National Institute of Allergy and Infectious Diseases (NIAID).
            Most images are in the public domain. See{" "}
            <a
              href="https://bioart.niaid.nih.gov/faqs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              bioart.niaid.nih.gov/faqs
            </a>{" "}
            for license details. Emoji fallbacks are used in this demo; original
            SVG/PNG illustrations can be downloaded from the BioArt site.
          </section>
        </div>
      </PageContent>
    </main>
  );
}
