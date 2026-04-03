"use client";

import { useState } from "react";
import type {
  MonohybridCrossQuestion,
  DihybridCrossQuestion,
} from "@/lib/punnetScoring";
import {
  computeMonohybridGrid,
  computeDihybridGrid,
} from "@/lib/punnetScoring";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      className={`w-full rounded-bs border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${mono ? "font-mono tracking-widest" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

// ---------------------------------------------------------------------------
// Punnett grid display
// ---------------------------------------------------------------------------

function MonohybridGrid({ q }: { q: MonohybridCrossQuestion }) {
  const grid = computeMonohybridGrid(q.parent1Genotype, q.parent2Genotype);
  const p1 = q.parent1Genotype.split("");
  const p2 = q.parent2Genotype.split("");

  return (
    <div className="overflow-auto">
      <table className="border-collapse text-sm font-mono">
        <thead>
          <tr>
            <th className="w-10 h-10" />
            {p2.map((a, i) => (
              <th
                key={i}
                className="w-14 h-10 text-center text-indigo-300 font-bold text-base"
              >
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              <td className="w-10 h-14 text-center text-indigo-300 font-bold text-base">
                {p1[r]}
              </td>
              {row.map((cell, c) => {
                const isDom = !cell.includes(cell[0].toLowerCase());
                const isHet = cell[0] !== cell[1];
                return (
                  <td
                    key={c}
                    className={`w-14 h-14 border border-slate-600 text-center align-middle font-bold text-base ${
                      isHet
                        ? "bg-indigo-900/40 text-indigo-200"
                        : isDom
                          ? "bg-emerald-900/30 text-emerald-200"
                          : "bg-rose-900/30 text-rose-200"
                    }`}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-900/60 border border-emerald-700" />
          Homozygous dominant
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-indigo-900/60 border border-indigo-700" />
          Heterozygous
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-rose-900/60 border border-rose-700" />
          Homozygous recessive
        </span>
      </div>
    </div>
  );
}

function DihybridGrid({ q }: { q: DihybridCrossQuestion }) {
  const grid = computeDihybridGrid(q.parent1Genotype, q.parent2Genotype);
  const gametes1 = [
    q.parent1Genotype[0] + q.parent1Genotype[2],
    q.parent1Genotype[0] + q.parent1Genotype[3],
    q.parent1Genotype[1] + q.parent1Genotype[2],
    q.parent1Genotype[1] + q.parent1Genotype[3],
  ];
  const gametes2 = [
    q.parent2Genotype[0] + q.parent2Genotype[2],
    q.parent2Genotype[0] + q.parent2Genotype[3],
    q.parent2Genotype[1] + q.parent2Genotype[2],
    q.parent2Genotype[1] + q.parent2Genotype[3],
  ];

  return (
    <div className="overflow-auto">
      <table className="border-collapse text-xs font-mono">
        <thead>
          <tr>
            <th className="w-10 h-10" />
            {gametes2.map((g, i) => (
              <th
                key={i}
                className="w-16 h-10 text-center text-indigo-300 font-bold"
              >
                {g}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              <td className="w-10 h-14 text-center text-indigo-300 font-bold">
                {gametes1[r]}
              </td>
              {row.map((cell, c) => {
                const dominated =
                  cell
                    .split("")
                    .filter((ch) => ch === ch.toUpperCase()).length >= 3;
                return (
                  <td
                    key={c}
                    className={`w-16 h-12 border border-slate-600 text-center align-middle font-bold text-xs ${
                      dominated
                        ? "bg-emerald-900/30 text-emerald-200"
                        : "bg-rose-900/20 text-rose-200"
                    }`}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Follow-up question builder
// ---------------------------------------------------------------------------

type FollowUp = { id: string; prompt: string; correctAnswer: string; points: number };

function FollowUpBuilder({
  items,
  onChange,
}: {
  items: FollowUp[];
  onChange: (items: FollowUp[]) => void;
}) {
  function add() {
    onChange([
      ...items,
      { id: uid(), prompt: "", correctAnswer: "", points: 1 },
    ]);
  }
  function remove(id: string) {
    onChange(items.filter((f) => f.id !== id));
  }
  function update(id: string, patch: Partial<FollowUp>) {
    onChange(items.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  return (
    <div className="space-y-3">
      {items.map((fq, i) => (
        <div
          key={fq.id}
          className="rounded-bs border border-slate-700 bg-slate-800/50 p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              Follow-up {i + 1}
            </span>
            <button
              onClick={() => remove(fq.id)}
              className="text-xs text-rose-400 hover:text-rose-300"
            >
              Remove
            </button>
          </div>
          <Field label="Prompt">
            <Input
              value={fq.prompt}
              onChange={(v) => update(fq.id, { prompt: v })}
              placeholder="e.g. What is the expected phenotype ratio?"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Correct answer">
              <Input
                value={fq.correctAnswer}
                onChange={(v) => update(fq.id, { correctAnswer: v })}
                placeholder="e.g. 3:1"
              />
            </Field>
            <Field label="Points">
              <input
                type="number"
                min={1}
                max={10}
                className="w-full rounded-bs border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                value={fq.points}
                onChange={(e) =>
                  update(fq.id, { points: Number(e.target.value) })
                }
              />
            </Field>
          </div>
        </div>
      ))}
      <button
        onClick={add}
        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <span className="text-base leading-none">+</span> Add follow-up question
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// JSON output panel
// ---------------------------------------------------------------------------

function JsonPanel({ data }: { data: object }) {
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(data, null, 2);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="relative rounded-bs border border-slate-700 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
        <span className="text-xs font-mono text-slate-400">
          Generated question JSON
        </span>
        <button
          onClick={copy}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-auto p-4 text-xs text-emerald-300 leading-relaxed max-h-96">
        {text}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monohybrid form
// ---------------------------------------------------------------------------

const MONO_DEFAULTS: MonohybridCrossQuestion = {
  id: "mono-demo-1",
  type: "monohybrid-cross",
  teks: ["B.7A", "B.7C"],
  learningLevel: "proficient",
  misconceptionTarget: false,
  points: 4,
  parent1Genotype: "Bb",
  parent2Genotype: "Bb",
  traitName: "height",
  dominantPhenotype: "tall",
  recessivePhenotype: "short",
  followUpQuestions: [
    {
      id: "fq-1",
      prompt: "What is the expected phenotype ratio?",
      correctAnswer: "3:1",
      points: 1,
    },
  ],
};

function MonohybridForm() {
  const [q, setQ] = useState<MonohybridCrossQuestion>(MONO_DEFAULTS);
  const [followUps, setFollowUps] = useState<FollowUp[]>(
    MONO_DEFAULTS.followUpQuestions,
  );

  const question: MonohybridCrossQuestion = {
    ...q,
    followUpQuestions: followUps,
  };

  const p1Valid = /^[A-Za-z]{2}$/.test(q.parent1Genotype);
  const p2Valid = /^[A-Za-z]{2}$/.test(q.parent2Genotype);
  const gridReady = p1Valid && p2Valid;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left - form */}
      <div className="space-y-6">
        {/* Parents */}
        <div>
          <SectionTitle
            title="Parent genotypes"
            sub="Enter two alleles per parent, e.g. Bb, BB, bb"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Parent 1">
              <Input
                value={q.parent1Genotype}
                onChange={(v) => setQ({ ...q, parent1Genotype: v.slice(0, 2) })}
                placeholder="Bb"
                mono
              />
            </Field>
            <Field label="Parent 2">
              <Input
                value={q.parent2Genotype}
                onChange={(v) => setQ({ ...q, parent2Genotype: v.slice(0, 2) })}
                placeholder="Bb"
                mono
              />
            </Field>
          </div>
        </div>

        {/* Trait */}
        <div>
          <SectionTitle title="Trait description" />
          <div className="space-y-3">
            <Field label="Trait name">
              <Input
                value={q.traitName}
                onChange={(v) => setQ({ ...q, traitName: v })}
                placeholder="e.g. height"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dominant phenotype">
                <Input
                  value={q.dominantPhenotype}
                  onChange={(v) => setQ({ ...q, dominantPhenotype: v })}
                  placeholder="e.g. tall"
                />
              </Field>
              <Field label="Recessive phenotype">
                <Input
                  value={q.recessivePhenotype}
                  onChange={(v) => setQ({ ...q, recessivePhenotype: v })}
                  placeholder="e.g. short"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div>
          <SectionTitle title="Question metadata" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Learning level">
              <select
                className="w-full rounded-bs border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                value={q.learningLevel}
                onChange={(e) =>
                  setQ({
                    ...q,
                    learningLevel: e.target.value as MonohybridCrossQuestion["learningLevel"],
                  })
                }
              >
                <option value="developing">Developing</option>
                <option value="progressing">Progressing</option>
                <option value="proficient">Proficient</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
            <Field label="Grid points">
              <input
                type="number"
                min={1}
                max={20}
                className="w-full rounded-bs border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                value={q.points}
                onChange={(e) =>
                  setQ({ ...q, points: Number(e.target.value) })
                }
              />
            </Field>
          </div>
        </div>

        {/* Follow-ups */}
        <div>
          <SectionTitle
            title="Follow-up questions"
            sub="Optional questions added after the grid"
          />
          <FollowUpBuilder items={followUps} onChange={setFollowUps} />
        </div>
      </div>

      {/* Right - preview + JSON */}
      <div className="space-y-6">
        {/* Grid preview */}
        <div className="rounded-bs border border-slate-700 bg-slate-900 p-5">
          <SectionTitle title="Live grid preview" />
          {gridReady ? (
            <>
              <p className="text-xs text-slate-400 mb-4">
                <span className="font-mono text-indigo-300">
                  {q.parent1Genotype}
                </span>{" "}
                x{" "}
                <span className="font-mono text-indigo-300">
                  {q.parent2Genotype}
                </span>{" "}
                cross for{" "}
                <span className="text-white font-medium">{q.traitName || "trait"}</span>
                {" "}({q.dominantPhenotype || "dominant"} / {q.recessivePhenotype || "recessive"})
              </p>
              <MonohybridGrid q={question} />
            </>
          ) : (
            <p className="text-sm text-slate-500 italic">
              Enter valid 2-character genotypes above to see the grid.
            </p>
          )}
        </div>

        {/* JSON */}
        <JsonPanel data={question} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dihybrid form
// ---------------------------------------------------------------------------

const DIHYBRID_DEFAULTS: DihybridCrossQuestion = {
  id: "di-demo-1",
  type: "dihybrid-cross",
  teks: ["B.7A", "B.7C"],
  learningLevel: "advanced",
  misconceptionTarget: false,
  points: 16,
  parent1Genotype: "AaBb",
  parent2Genotype: "AaBb",
  trait1Name: "seed shape",
  trait1DominantPhenotype: "round",
  trait1RecessivePhenotype: "wrinkled",
  trait2Name: "seed color",
  trait2DominantPhenotype: "yellow",
  trait2RecessivePhenotype: "green",
  followUpQuestions: [
    {
      id: "fq-di-1",
      prompt: "What is the expected phenotype ratio?",
      correctAnswer: "9:3:3:1",
      points: 2,
    },
  ],
};

function DihybridForm() {
  const [q, setQ] = useState<DihybridCrossQuestion>(DIHYBRID_DEFAULTS);
  const [followUps, setFollowUps] = useState<FollowUp[]>(
    DIHYBRID_DEFAULTS.followUpQuestions,
  );

  const question: DihybridCrossQuestion = {
    ...q,
    followUpQuestions: followUps,
  };

  const p1Valid = /^[A-Za-z]{4}$/.test(q.parent1Genotype);
  const p2Valid = /^[A-Za-z]{4}$/.test(q.parent2Genotype);
  const gridReady = p1Valid && p2Valid;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left - form */}
      <div className="space-y-6">
        {/* Parents */}
        <div>
          <SectionTitle
            title="Parent genotypes"
            sub="Enter four alleles per parent, e.g. AaBb, AABB"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Parent 1">
              <Input
                value={q.parent1Genotype}
                onChange={(v) => setQ({ ...q, parent1Genotype: v.slice(0, 4) })}
                placeholder="AaBb"
                mono
              />
            </Field>
            <Field label="Parent 2">
              <Input
                value={q.parent2Genotype}
                onChange={(v) => setQ({ ...q, parent2Genotype: v.slice(0, 4) })}
                placeholder="AaBb"
                mono
              />
            </Field>
          </div>
        </div>

        {/* Traits */}
        <div>
          <SectionTitle title="Trait 1 (gene A)" />
          <div className="space-y-3">
            <Field label="Trait name">
              <Input
                value={q.trait1Name}
                onChange={(v) => setQ({ ...q, trait1Name: v })}
                placeholder="e.g. seed shape"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dominant phenotype">
                <Input
                  value={q.trait1DominantPhenotype}
                  onChange={(v) => setQ({ ...q, trait1DominantPhenotype: v })}
                  placeholder="e.g. round"
                />
              </Field>
              <Field label="Recessive phenotype">
                <Input
                  value={q.trait1RecessivePhenotype}
                  onChange={(v) => setQ({ ...q, trait1RecessivePhenotype: v })}
                  placeholder="e.g. wrinkled"
                />
              </Field>
            </div>
          </div>
        </div>

        <div>
          <SectionTitle title="Trait 2 (gene B)" />
          <div className="space-y-3">
            <Field label="Trait name">
              <Input
                value={q.trait2Name}
                onChange={(v) => setQ({ ...q, trait2Name: v })}
                placeholder="e.g. seed color"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dominant phenotype">
                <Input
                  value={q.trait2DominantPhenotype}
                  onChange={(v) => setQ({ ...q, trait2DominantPhenotype: v })}
                  placeholder="e.g. yellow"
                />
              </Field>
              <Field label="Recessive phenotype">
                <Input
                  value={q.trait2RecessivePhenotype}
                  onChange={(v) => setQ({ ...q, trait2RecessivePhenotype: v })}
                  placeholder="e.g. green"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div>
          <SectionTitle title="Question metadata" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Learning level">
              <select
                className="w-full rounded-bs border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                value={q.learningLevel}
                onChange={(e) =>
                  setQ({
                    ...q,
                    learningLevel: e.target.value as DihybridCrossQuestion["learningLevel"],
                  })
                }
              >
                <option value="developing">Developing</option>
                <option value="progressing">Progressing</option>
                <option value="proficient">Proficient</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
            <Field label="Grid points">
              <input
                type="number"
                min={1}
                max={32}
                className="w-full rounded-bs border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                value={q.points}
                onChange={(e) =>
                  setQ({ ...q, points: Number(e.target.value) })
                }
              />
            </Field>
          </div>
        </div>

        {/* Follow-ups */}
        <div>
          <SectionTitle
            title="Follow-up questions"
            sub="Optional questions added after the grid"
          />
          <FollowUpBuilder items={followUps} onChange={setFollowUps} />
        </div>
      </div>

      {/* Right - preview + JSON */}
      <div className="space-y-6">
        <div className="rounded-bs border border-slate-700 bg-slate-900 p-5">
          <SectionTitle title="Live 4x4 grid preview" />
          {gridReady ? (
            <>
              <p className="text-xs text-slate-400 mb-4">
                <span className="font-mono text-indigo-300">
                  {q.parent1Genotype}
                </span>{" "}
                x{" "}
                <span className="font-mono text-indigo-300">
                  {q.parent2Genotype}
                </span>{" "}
                - {q.trait1Name || "trait 1"} &amp; {q.trait2Name || "trait 2"}
              </p>
              <DihybridGrid q={question} />
            </>
          ) : (
            <p className="text-sm text-slate-500 italic">
              Enter valid 4-character genotypes above to see the grid.
            </p>
          )}
        </div>

        <JsonPanel data={question} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Tab = "monohybrid" | "dihybrid";

export default function PunnettMakerPage() {
  const [tab, setTab] = useState<Tab>("monohybrid");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl" role="img" aria-label="DNA">
              🧬
            </span>
            <h1 className="text-xl font-bold text-white">
              Punnett Square Question Maker
            </h1>
            <span className="rounded-full bg-indigo-900/60 border border-indigo-700 px-2.5 py-0.5 text-xs text-indigo-300 font-mono">
              B.7A / B.7C
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Build monohybrid or dihybrid cross questions for the item bank.
            The grid preview updates live as you type.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 px-6">
        <div className="max-w-6xl mx-auto flex gap-0">
          {(["monohybrid", "dihybrid"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-selected={tab === t}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-indigo-500 text-indigo-300"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {t === "monohybrid" ? "Monohybrid (2x2)" : "Dihybrid (4x4)"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {tab === "monohybrid" ? <MonohybridForm /> : <DihybridForm />}
      </div>
    </div>
  );
}
