"use client";

import React, { useState, useMemo } from "react";
import TeksTooltip from "@/components/common/TeksTooltip";
import Link from "next/link";
import type { Item } from "@/lib/itemBank/schema";
import { filterItems } from "@/lib/itemBank/filter";

// ── Visual metadata ────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; color: string }> = {
  multiple_choice: {
    label: "MC",
    color: "border-blue-200 bg-blue-50 text-blue-700",
  },
  multi_select: {
    label: "Multi-Select",
    color: "border-violet-200 bg-violet-50 text-violet-700",
  },
  card_sort: {
    label: "Card Sort",
    color: "border-teal-200 bg-teal-50 text-teal-700",
  },
  diagram_label: {
    label: "Diagram",
    color: "border-orange-200 bg-orange-50 text-orange-700",
  },
  evidence_pair: {
    label: "Evidence",
    color: "border-pink-200 bg-pink-50 text-pink-700",
  },
  numeric_response: {
    label: "Numeric",
    color: "border-slate-300 bg-slate-100 text-slate-600",
  },
};

const DIFF_META: Record<string, { label: string; color: string; bar: string }> =
  {
    easy: {
      label: "Easy",
      color: "border-emerald-200 bg-emerald-50 text-emerald-700",
      bar: "bg-emerald-400",
    },
    medium: {
      label: "Medium",
      color: "border-amber-200 bg-amber-50 text-amber-700",
      bar: "bg-amber-400",
    },
    hard: {
      label: "Hard",
      color: "border-rose-200 bg-rose-50 text-rose-700",
      bar: "bg-rose-400",
    },
  };

// ── Reusable primitives ────────────────────────────────────────────────────────

function Badge({
  label,
  className = "",
}: {
  label: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold leading-none ${className}`}
    >
      {label}
    </span>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
      <span className="font-medium text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ── Answer breakdown ───────────────────────────────────────────────────────────

function AnswerBreakdown({ item }: { item: Item }) {
  const { answer, choices } = item;

  if (answer.kind === "single" || answer.kind === "multi") {
    const correctIds =
      answer.kind === "single" ? [answer.choiceId] : answer.choiceIds;
    return (
      <div className="space-y-1.5">
        {(choices ?? []).map((c) => {
          const correct = correctIds.includes(c.id);
          return (
            <div
              key={c.id}
              className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${correct ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"}`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${correct ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-slate-500"}`}
              >
                {c.id}
              </span>
              <span
                className={
                  correct ? "font-medium text-emerald-900" : "text-slate-700"
                }
              >
                {c.label}
              </span>
              {correct && (
                <span className="ml-auto shrink-0 text-xs font-bold text-emerald-600">
                  ✓ Correct
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (answer.kind === "numeric") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="text-sm font-medium text-emerald-800">Answer: </span>
        <span className="text-lg font-bold text-emerald-900">
          {answer.value}
        </span>
        {answer.tolerance != null && (
          <span className="ml-2 text-xs text-emerald-700">
            (±{answer.tolerance})
          </span>
        )}
      </div>
    );
  }

  if (answer.kind === "card_sort") {
    return (
      <div className="space-y-2">
        {answer.columns.map((col) => {
          const cards = answer.cards.filter((c) => c.correctColId === col.id);
          if (cards.length === 0) return null;
          return (
            <div
              key={col.id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                {col.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cards.map((c) => (
                  <span
                    key={c.id}
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900"
                  >
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (answer.kind === "diagram_label") {
    const optMap = Object.fromEntries(
      answer.options.map((o) => [o.id, o.label]),
    );
    return (
      <div className="space-y-1.5">
        {answer.blanks.map((b, i) => (
          <div
            key={b.id}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
          >
            <span className="font-semibold text-slate-500">Box {i + 1}</span>
            <span className="text-slate-400">→</span>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
              {optMap[b.correctOptionId]}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (answer.kind === "evidence_pair") {
    const aId = answer.partA.correctChoiceId;
    const bId = answer.partB.correctChoiceId;
    return (
      <div className="space-y-1.5">
        {(choices ?? []).map((c) => {
          const isA = c.id === aId;
          const isB = c.id === bId;
          return (
            <div
              key={c.id}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm ${isA ? "border-teal-200 bg-teal-50" : isB ? "border-violet-200 bg-violet-50" : "border-slate-100 bg-slate-50"}`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${isA ? "border-teal-500 bg-teal-500 text-white" : isB ? "border-violet-500 bg-violet-500 text-white" : "border-slate-300 text-slate-500"}`}
              >
                {c.id}
              </span>
              <span
                className={
                  isA
                    ? "font-medium text-teal-900"
                    : isB
                      ? "font-medium text-violet-900"
                      : "text-slate-700"
                }
              >
                {c.label}
              </span>
              {isA && (
                <span className="ml-auto shrink-0 text-xs font-bold text-teal-700">
                  Part A ✓
                </span>
              )}
              {isB && (
                <span className="ml-auto shrink-0 text-xs font-bold text-violet-700">
                  Part B ✓
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

// ── Item Card ──────────────────────────────────────────────────────────────────

function ItemCard({
  item,
  inDraft,
  onToggleDraft,
}: {
  item: Item;
  inDraft: boolean;
  onToggleDraft: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const type = TYPE_META[item.itemType] ?? {
    label: item.itemType,
    color: "border-slate-200 bg-slate-100 text-slate-600",
  };
  const diff = DIFF_META[item.difficulty] ?? {
    label: item.difficulty,
    color: "border-slate-200 bg-slate-100 text-slate-600",
    bar: "bg-slate-400",
  };

  const answerSummary = (() => {
    const { answer, choices } = item;
    if (answer.kind === "single") return `${choices?.length ?? 0} choices`;
    if (answer.kind === "multi")
      return `${choices?.length ?? 0} choices, ${answer.choiceIds.length} correct`;
    if (answer.kind === "card_sort")
      return `${answer.cards.length} cards · ${answer.columns.length} categories`;
    if (answer.kind === "diagram_label")
      return `${answer.blanks.length} blanks`;
    if (answer.kind === "evidence_pair") return "2-part question";
    if (answer.kind === "numeric") return "Numeric answer";
    return "";
  })();

  return (
    <div
      className={`rounded-2xl border bg-white transition-all ${inDraft ? "border-emerald-300 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" : "border-slate-200 shadow-sm hover:shadow-md"}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Selection checkbox */}
          <button
            type="button"
            onClick={() => onToggleDraft(item.id)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${inDraft ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-emerald-400 hover:bg-emerald-50"}`}
            aria-label={inDraft ? "Remove from draft" : "Add to draft"}
          >
            {inDraft && (
              <svg
                viewBox="0 0 10 8"
                className="h-2.5 w-2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 4l3 3 5-6" />
              </svg>
            )}
          </button>

          <div className="min-w-0 flex-1">
            {/* Title + badges */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="font-semibold text-slate-900 leading-snug">
                {item.title}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <Badge label={type.label} className={type.color} />
                <Badge label={diff.label} className={diff.color} />
                {item.staarStyle && (
                  <Badge
                    label="STAAR"
                    className="border-indigo-200 bg-indigo-50 text-indigo-700"
                  />
                )}
              </div>
            </div>

            {/* TEKS + topic */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              {item.teks.map((t) => (
                <Badge
                  key={t}
                  label={<TeksTooltip code={t} />}
                  className="border-slate-200 bg-slate-100 text-slate-600"
                />
              ))}
              <span className="text-xs text-slate-500">
                {item.topic} · {item.gradeBand}
              </span>
            </div>

            {/* Prompt preview */}
            <p className="mt-2 text-sm text-slate-700 line-clamp-2">
              {item.prompt}
            </p>

            {/* Bottom row */}
            <div className="mt-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{answerSummary}</span>
                {item.misconceptionTags?.length ? (
                  <span className="font-medium text-rose-600">
                    ⚠ {item.misconceptionTags.length} misconception
                    {item.misconceptionTags.length > 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                {expanded ? "Hide" : "Details"}
                <svg
                  viewBox="0 0 16 16"
                  className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
                  fill="currentColor"
                >
                  <path d="M8 10.5 3 5.5h10z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Question */}
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                Question
              </div>
              {item.stimulus.kind !== "none" && (
                <div className="mb-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm italic text-slate-600">
                  {item.stimulus.kind === "text"
                    ? item.stimulus.text
                    : `[${item.stimulus.kind} stimulus]`}
                </div>
              )}
              <p className="text-sm font-medium leading-relaxed text-slate-900 whitespace-pre-line">
                {item.prompt}
              </p>
            </div>

            {/* Answer key */}
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                Answer Key
              </div>
              <AnswerBreakdown item={item} />
            </div>
          </div>

          {/* Misconceptions */}
          {item.misconceptionTags?.length ? (
            <div className="border-t border-slate-100 pt-3">
              <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                Common Misconceptions
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.misconceptionTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700"
                  >
                    {t.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Item ID */}
          <div className="border-t border-slate-100 pt-2">
            <span className="font-mono text-[10px] text-slate-400">
              {item.id}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stat tile ──────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  bar,
  barColor,
}: {
  label: string;
  value: number;
  sub?: string;
  bar?: number; // 0–100
  barColor?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-2xl font-bold tabular-nums text-slate-900">
        {value}
      </div>
      <div className="mt-0.5 text-xs font-medium text-slate-500">{label}</div>
      {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
      {bar != null && (
        <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
          <div
            className={`h-1 rounded-full transition-all ${barColor ?? "bg-emerald-400"}`}
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function ItemBankClient({ items }: { items: Item[] }) {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [diffFilter, setDiffFilter] = useState("");
  const [teksFilter, setTeksFilter] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [staarOnly, setStaarOnly] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [draftCopied, setDraftCopied] = useState(false);

  // Derived filter options
  const topicOptions = useMemo(
    () =>
      [...new Set(items.map((i) => i.topic))]
        .sort()
        .map((t) => ({ value: t, label: t })),
    [items],
  );
  const teksOptions = useMemo(
    () =>
      [...new Set(items.flatMap((i) => i.teks))]
        .sort()
        .map((t) => ({ value: t, label: t })),
    [items],
  );
  const typeOptions = useMemo(
    () =>
      [...new Set(items.map((i) => i.itemType))]
        .sort()
        .map((t) => ({ value: t, label: TYPE_META[t]?.label ?? t })),
    [items],
  );

  // Filtered list
  const filtered = useMemo(
    () =>
      filterItems(items, {
        q,
        type: typeFilter,
        difficulty: diffFilter,
        teks: teksFilter,
        topic: topicFilter,
        staarStyle: staarOnly ? "true" : undefined,
      }),
    [items, q, typeFilter, diffFilter, teksFilter, topicFilter, staarOnly],
  );

  // Stats (always from full set)
  const stats = useMemo(
    () => ({
      total: items.length,
      easy: items.filter((i) => i.difficulty === "easy").length,
      medium: items.filter((i) => i.difficulty === "medium").length,
      hard: items.filter((i) => i.difficulty === "hard").length,
      staar: items.filter((i) => i.staarStyle).length,
      mc: items.filter(
        (i) =>
          i.itemType === "multiple_choice" || i.itemType === "multi_select",
      ).length,
      interactive: items.filter((i) =>
        [
          "card_sort",
          "diagram_label",
          "evidence_pair",
          "numeric_response",
        ].includes(i.itemType),
      ).length,
    }),
    [items],
  );

  // Draft management
  const toggleDraft = (id: string) =>
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const draftItems = useMemo(
    () => items.filter((i) => draft.includes(i.id)),
    [items, draft],
  );

  const copyDraft = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify({ items: draftItems }, null, 2),
    );
    setDraftCopied(true);
    setTimeout(() => setDraftCopied(false), 2500);
  };

  const hasFilter =
    q || typeFilter || diffFilter || teksFilter || topicFilter || staarOnly;

  const clearFilters = () => {
    setQ("");
    setTypeFilter("");
    setDiffFilter("");
    setTeksFilter("");
    setTopicFilter("");
    setStaarOnly(false);
  };

  return (
    <div className={`space-y-5 ${draft.length > 0 ? "pb-28" : ""}`}>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatTile label="Total Items" value={stats.total} />
        <StatTile
          label="Easy"
          value={stats.easy}
          bar={Math.round((stats.easy / stats.total) * 100)}
          barColor="bg-emerald-400"
        />
        <StatTile
          label="Medium"
          value={stats.medium}
          bar={Math.round((stats.medium / stats.total) * 100)}
          barColor="bg-amber-400"
        />
        <StatTile
          label="Hard"
          value={stats.hard}
          bar={Math.round((stats.hard / stats.total) * 100)}
          barColor="bg-rose-400"
        />
        <StatTile
          label="STAAR"
          value={stats.staar}
          bar={Math.round((stats.staar / stats.total) * 100)}
          barColor="bg-indigo-400"
        />
        <StatTile
          label="MC / MS"
          value={stats.mc}
          bar={Math.round((stats.mc / stats.total) * 100)}
          barColor="bg-blue-400"
        />
        <StatTile
          label="Interactive"
          value={stats.interactive}
          bar={Math.round((stats.interactive / stats.total) * 100)}
          barColor="bg-teal-400"
        />
      </div>

      {/* Search + filter bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z"
              />
            </svg>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, prompt, TEKS, topic, misconception…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50 select-none">
            <input
              type="checkbox"
              checked={staarOnly}
              onChange={(e) => setStaarOnly(e.target.checked)}
              className="accent-indigo-600"
            />
            STAAR only
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
          />
          <FilterSelect
            label="Difficulty"
            value={diffFilter}
            onChange={setDiffFilter}
            options={[
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ]}
          />
          <FilterSelect
            label="TEKS"
            value={teksFilter}
            onChange={setTeksFilter}
            options={teksOptions}
          />
          <FilterSelect
            label="Topic"
            value={topicFilter}
            onChange={setTopicFilter}
            options={topicOptions}
          />
          {hasFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-slate-400 underline hover:text-slate-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">
          Showing <strong className="text-slate-900">{filtered.length}</strong>
          {hasFilter && ` of ${items.length}`} items
        </span>
        {draft.length > 0 && (
          <span className="font-semibold text-emerald-700">
            {draft.length} selected
          </span>
        )}
      </div>

      {/* Item list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-14 text-center">
          <div className="text-3xl text-slate-300 mb-3">🔍</div>
          <div className="font-semibold text-slate-600">
            No items match your filters
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 text-sm text-emerald-700 underline hover:text-emerald-900"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              inDraft={draft.includes(item.id)}
              onToggleDraft={toggleDraft}
            />
          ))}
        </div>
      )}

      {/* Draft panel (fixed bottom) */}
      {draft.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-200 bg-white/95 backdrop-blur shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-6xl px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900">
                  {draft.length} item{draft.length > 1 ? "s" : ""} in draft
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {draftItems.map((it) => (
                    <span
                      key={it.id}
                      className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                    >
                      {it.title}
                      <button
                        type="button"
                        onClick={() => toggleDraft(it.id)}
                        className="ml-0.5 font-bold text-emerald-500 hover:text-emerald-900"
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDraft([])}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={copyDraft}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {draftCopied ? "✓ Copied!" : "Copy as JSON"}
                </button>
                <Link
                  href="/teacher/builder"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Open Builder →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
