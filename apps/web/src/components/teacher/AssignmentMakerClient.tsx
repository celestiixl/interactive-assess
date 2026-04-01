"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  searchPublicBank,
  getPrivateBank,
  addToItemBank,
  type ItemBankEntry,
} from "@/lib/itemBank";
import { filterItems } from "@/lib/itemBank/filter";
import type { Item } from "@/lib/itemBank/schema";
import type {
  Question as AnyQuestion,
  DifferentiationMode,
  MultipleChoiceQuestion,
  ShortResponseQuestion,
} from "@/types/assignments";
import type { LearningLevel } from "@/lib/curriculumPolicy";
import CERBuilder from "./CERBuilder";
import PunnettBuilder from "./PunnettBuilder";
import type {
  MonohybridCrossQuestion,
  DihybridCrossQuestion,
} from "@/lib/punnetScoring";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SourceTab = "public" | "private" | "build";
type BuildType = "mcq" | "cer" | "punnett" | "short" | "dragdrop";

type TrayItem = {
  /** Unique id within the tray (not necessarily the question id) */
  _trayId: string;
  question: AnyQuestion;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function getQuestionText(q: AnyQuestion): string {
  if ("stem" in q) return (q as { stem: string }).stem;
  if ("prompt" in q) return (q as { prompt: string }).prompt;
  return q.id;
}

function getTypeLabel(type: string): string {
  const MAP: Record<string, string> = {
    "multiple-choice": "MCQ",
    "multiple-selection": "Multi",
    "short-response": "Short",
    "drag-drop": "Drag",
    dropdown: "Fill",
    "monohybrid-cross": "Punnett",
    "dihybrid-cross": "Punnett",
  };
  return MAP[type] ?? type;
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  "multiple-choice": "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "multiple-selection": "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "short-response": "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "drag-drop": "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "monohybrid-cross": "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "dihybrid-cross": "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

const TYPE_BADGE_DEFAULT = "border-[var(--bs-border)] bg-[var(--bs-raised)] text-bs-text-sub";

function typeBadgeColor(type: string): string {
  return TYPE_BADGE_COLORS[type] ?? TYPE_BADGE_DEFAULT;
}

/** Convert a public-bank Item to the minimal AnyQuestion needed for the API */
function publicItemToQuestion(item: Item): AnyQuestion {
  const base = {
    id: item.id,
    teks: item.teks,
    learningLevel: "proficient" as LearningLevel,
    misconceptionTarget: Boolean(item.misconceptionTags?.length),
    points: 1,
  };

  if (item.itemType === "multiple_choice" || item.itemType === "multi_select") {
    const choices = (item.choices ?? []).map((c) => ({
      id: c.id,
      text: c.label,
      isCorrect:
        item.answer.kind === "single"
          ? c.id === item.answer.choiceId
          : item.answer.kind === "multi"
            ? item.answer.choiceIds.includes(c.id)
            : false,
    }));
    const q: MultipleChoiceQuestion = {
      ...base,
      type: "multiple-choice",
      stem: item.prompt,
      choices,
    };
    return q;
  }

  const q: ShortResponseQuestion = {
    ...base,
    type: "short-response",
    prompt: item.prompt,
    modelAnswer: "",
    rubric: [{ score: 1, descriptor: "Complete response" }],
  };
  return q;
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

function Badge({ label, className = "" }: { label: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold leading-none ${className}`}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sortable Tray Item
// ---------------------------------------------------------------------------

function SortableTrayItem({
  item,
  index,
  onRemove,
}: {
  item: TrayItem;
  index: number;
  onRemove: (trayId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item._trayId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const q = item.question;
  const text = getQuestionText(q).slice(0, 60);
  const typeLabel = getTypeLabel(q.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-xl border border-[var(--bs-border)] bg-bs-surface p-2.5 shadow-sm"
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="mt-0.5 shrink-0 cursor-grab touch-none text-bs-text-muted hover:text-bs-text-sub focus:outline-none"
        aria-label="Drag to reorder"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
          <circle cx="5" cy="4" r="1.2" />
          <circle cx="11" cy="4" r="1.2" />
          <circle cx="5" cy="8" r="1.2" />
          <circle cx="11" cy="8" r="1.2" />
          <circle cx="5" cy="12" r="1.2" />
          <circle cx="11" cy="12" r="1.2" />
        </svg>
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-bs-text-sub">#{index + 1}</span>
          <Badge label={typeLabel} className={typeBadgeColor(q.type)} />
          {q.teks.slice(0, 2).map((t) => (
            <Badge
              key={t}
              label={t}
              className="border-[var(--bs-border)] bg-[var(--bs-raised)] text-bs-text-sub"
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-bs-text leading-snug line-clamp-2">{text}{text.length === 60 ? "..." : ""}</p>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(item._trayId)}
        className="shrink-0 rounded-full p-0.5 text-bs-text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
        aria-label="Remove from tray"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public / Private bank card
// ---------------------------------------------------------------------------

function QuestionCard({
  previewText,
  typeLabel,
  typeColor,
  teks,
  learningLevel,
  added,
  onAdd,
}: {
  previewText: string;
  typeLabel: string;
  typeColor: string;
  teks: string[];
  learningLevel?: string;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--bs-border)] bg-bs-surface p-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge label={typeLabel} className={typeColor} />
          {teks.slice(0, 3).map((t) => (
            <Badge
              key={t}
              label={t}
              className="border-[var(--bs-border)] bg-[var(--bs-raised)] text-bs-text-sub"
            />
          ))}
          {learningLevel && (
            <Badge
              label={learningLevel}
              className="border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
            />
          )}
        </div>
        <p className="mt-1.5 text-sm text-bs-text-sub leading-snug line-clamp-2">
          {previewText}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={added}
        className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 ${
          added
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
        aria-label={added ? "Already in tray" : "Add to tray"}
      >
        {added ? "✓" : "Add"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MCQ inline builder
// ---------------------------------------------------------------------------

type MCQChoice = { id: string; text: string };

function MCQBuilder({ onSave }: { onSave: (q: AnyQuestion) => void }) {
  const [stem, setStem] = useState("");
  const [teks, setTeks] = useState("");
  const [learningLevel, setLearningLevel] = useState<LearningLevel>("proficient");
  const [choices, setChoices] = useState<MCQChoice[]>([
    { id: "A", text: "" },
    { id: "B", text: "" },
    { id: "C", text: "" },
    { id: "D", text: "" },
  ]);
  const [correctId, setCorrectId] = useState("A");

  const valid = stem.trim() && choices.every((c) => c.text.trim()) && teks.trim();

  function handleSave() {
    if (!valid) return;
    const q: MultipleChoiceQuestion = {
      id: uid("mcq"),
      type: "multiple-choice",
      stem: stem.trim(),
      choices: choices.map((c) => ({
        id: c.id,
        text: c.text.trim(),
        isCorrect: c.id === correctId,
      })),
      teks: teks.split(",").map((t) => t.trim()).filter(Boolean),
      learningLevel,
      misconceptionTarget: false,
      points: 1,
    };
    onSave(q);
    setStem("");
    setTeks("");
    setChoices([
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" },
    ]);
    setCorrectId("A");
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs font-semibold text-bs-text-sub">Question stem *</span>
        <textarea
          value={stem}
          onChange={(e) => setStem(e.target.value)}
          rows={3}
          placeholder="Enter the question text..."
          className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          aria-label="Question stem"
        />
      </label>

      <div>
        <span className="text-xs font-semibold text-bs-text-sub">Choices * (select correct answer)</span>
        <div className="mt-1 space-y-2">
          {choices.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="mcq-correct"
                value={c.id}
                checked={correctId === c.id}
                onChange={() => setCorrectId(c.id)}
                className="accent-emerald-600"
                aria-label={`Mark choice ${c.id} as correct`}
              />
              <span className="shrink-0 text-xs font-bold text-bs-text-sub w-4">{c.id}</span>
              <input
                type="text"
                value={c.text}
                onChange={(e) => setChoices((prev) => prev.map((x) => x.id === c.id ? { ...x, text: e.target.value } : x))}
                placeholder={`Choice ${c.id}`}
                className="flex-1 rounded-lg border border-[var(--bs-border)] bg-[var(--bs-raised)] px-2.5 py-1.5 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                aria-label={`Choice ${c.id} text`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-bs-text-sub">TEKS (e.g. B.5A) *</span>
          <input
            type="text"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            placeholder="B.5A"
            className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label="TEKS code"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-bs-text-sub">Learning level</span>
          <select
            value={learningLevel}
            onChange={(e) => setLearningLevel(e.target.value as LearningLevel)}
            className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label="Learning level"
          >
            <option value="developing">Developing</option>
            <option value="progressing">Progressing</option>
            <option value="proficient">Proficient</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        disabled={!valid}
        onClick={handleSave}
        className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
        aria-label="Add MCQ to tray"
      >
        Add to Tray
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Short Response inline builder
// ---------------------------------------------------------------------------

function ShortResponseBuilderInline({ onSave }: { onSave: (q: AnyQuestion) => void }) {
  const [prompt, setPrompt] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [teks, setTeks] = useState("");
  const [learningLevel, setLearningLevel] = useState<LearningLevel>("proficient");

  const valid = prompt.trim() && teks.trim();

  function handleSave() {
    if (!valid) return;
    const q: ShortResponseQuestion = {
      id: uid("short"),
      type: "short-response",
      prompt: prompt.trim(),
      modelAnswer: modelAnswer.trim(),
      rubric: [{ score: 1, descriptor: "Complete response" }],
      teks: teks.split(",").map((t) => t.trim()).filter(Boolean),
      learningLevel,
      misconceptionTarget: false,
      points: 2,
    };
    onSave(q);
    setPrompt("");
    setModelAnswer("");
    setTeks("");
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-xs font-semibold text-bs-text-sub">Prompt *</span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="Enter the question prompt..."
          className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          aria-label="Short response prompt"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-bs-text-sub">Model answer (optional)</span>
        <textarea
          value={modelAnswer}
          onChange={(e) => setModelAnswer(e.target.value)}
          rows={2}
          placeholder="Expected answer or key rubric points..."
          className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          aria-label="Model answer"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-bs-text-sub">TEKS (e.g. B.5A) *</span>
          <input
            type="text"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            placeholder="B.5A"
            className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label="TEKS code"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-bs-text-sub">Learning level</span>
          <select
            value={learningLevel}
            onChange={(e) => setLearningLevel(e.target.value as LearningLevel)}
            className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label="Learning level"
          >
            <option value="developing">Developing</option>
            <option value="progressing">Progressing</option>
            <option value="proficient">Proficient</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        disabled={!valid}
        onClick={handleSave}
        className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
        aria-label="Add short response to tray"
      >
        Add to Tray
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CER Builder wrapper
// ---------------------------------------------------------------------------

function CERBuilderWrapper({ onSave }: { onSave: (q: AnyQuestion) => void }) {
  const [patchedItem, setPatchedItem] = useState<Record<string, unknown>>({});
  const [teks, setTeks] = useState("B.7B");
  const [learningLevel, setLearningLevel] = useState<LearningLevel>("proficient");

  const handleSave = useCallback(() => {
    const rubric = patchedItem.rubric as { claimPoints?: number; evidencePoints?: number; reasoningPoints?: number } | undefined;
    const totalPoints = rubric
      ? ((rubric.claimPoints ?? 0) + (rubric.evidencePoints ?? 0) + (rubric.reasoningPoints ?? 0)) || 8
      : 8;
    const prompt = (patchedItem.context as string) || "CER Question";
    const q: ShortResponseQuestion = {
      id: uid("cer"),
      type: "short-response",
      prompt,
      modelAnswer: "",
      rubric: [{ score: totalPoints, descriptor: "Complete CER response" }],
      teks: teks.split(",").map((t) => t.trim()).filter(Boolean),
      learningLevel,
      misconceptionTarget: false,
      points: totalPoints,
    };
    onSave(q);
  }, [patchedItem, teks, learningLevel, onSave]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-bs-text-sub">TEKS (e.g. B.7B)</span>
          <input
            type="text"
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            placeholder="B.7B"
            className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label="CER TEKS code"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-bs-text-sub">Learning level</span>
          <select
            value={learningLevel}
            onChange={(e) => setLearningLevel(e.target.value as LearningLevel)}
            className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-bs-surface px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-label="CER learning level"
          >
            <option value="developing">Developing</option>
            <option value="progressing">Progressing</option>
            <option value="proficient">Proficient</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
      </div>

      <CERBuilder item={{}} onPatch={setPatchedItem as (patch: unknown) => void} />

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
        aria-label="Add CER question to tray"
      >
        Add CER to Tray
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Punnett Builder wrapper
// ---------------------------------------------------------------------------

function PunnettBuilderWrapper({ onSave }: { onSave: (q: AnyQuestion) => void }) {
  const handleSave = useCallback(
    (q: MonohybridCrossQuestion | DihybridCrossQuestion) => {
      onSave(q as AnyQuestion);
    },
    [onSave],
  );
  return <PunnettBuilder onSave={handleSave} />;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AssignmentMakerClient({
  teacherId,
}: {
  teacherId: string;
}) {
  const router = useRouter();

  // Metadata
  const [title, setTitle] = useState("");
  const [teksFilter, setTeksFilter] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [differentiationMode, setDifferentiationMode] = useState<DifferentiationMode>("single");

  // Source tab
  const [activeTab, setActiveTab] = useState<SourceTab>("public");

  // Public bank
  const [publicSearch, setPublicSearch] = useState("");
  const publicItems = useMemo<Item[]>(() => searchPublicBank(), []);
  const filteredPublic = useMemo(() => {
    return filterItems(publicItems, { q: publicSearch });
  }, [publicItems, publicSearch]);

  // Private bank
  const [privateEntries, setPrivateEntries] = useState<ItemBankEntry[]>([]);
  const [privateSearch, setPrivateSearch] = useState("");
  useEffect(() => {
    setPrivateEntries(getPrivateBank(teacherId));
  }, [teacherId]);
  const filteredPrivate = useMemo(() => {
    if (!privateSearch.trim()) return privateEntries;
    const q = privateSearch.toLowerCase();
    return privateEntries.filter((e) => {
      const text = getQuestionText(e.question).toLowerCase();
      const teks = e.question.teks.join(" ").toLowerCase();
      return text.includes(q) || teks.includes(q) || e.question.type.toLowerCase().includes(q);
    });
  }, [privateEntries, privateSearch]);

  // Build new
  const [buildType, setBuildType] = useState<BuildType>("mcq");

  // Tray
  const [tray, setTray] = useState<TrayItem[]>([]);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Tray management
  const trayIds = useMemo(() => tray.map((t) => t._trayId), [tray]);
  const inTray = useCallback(
    (questionId: string) => tray.some((t) => t.question.id === questionId),
    [tray],
  );

  const addToTray = useCallback((question: AnyQuestion) => {
    if (tray.some((t) => t.question.id === question.id)) return;
    setTray((prev) => [...prev, { _trayId: uid("tray"), question }]);
  }, [tray]);

  const removeFromTray = useCallback((trayId: string) => {
    setTray((prev) => prev.filter((t) => t._trayId !== trayId));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTray((prev) => {
        const oldIdx = prev.findIndex((t) => t._trayId === active.id);
        const newIdx = prev.findIndex((t) => t._trayId === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  }, []);

  // Builder save handler
  const handleBuilderSave = useCallback(
    (question: AnyQuestion) => {
      addToItemBank(question, undefined, undefined, teacherId);
      addToTray(question);
      // Refresh private bank list
      setPrivateEntries(getPrivateBank(teacherId));
    },
    [teacherId, addToTray],
  );

  // Derive all teks from tray questions
  const derivedTeks = useMemo(() => {
    const all = tray.flatMap((t) => t.question.teks);
    return [...new Set(all)];
  }, [tray]);

  const canSubmit = title.trim() && tray.length > 0;

  // POST to create API
  async function callCreate(status: "draft"): Promise<string | null> {
    const res = await fetch("/api/assignments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-teacher-id": teacherId,
      },
      body: JSON.stringify({
        title: title.trim(),
        goal: "practice",
        mode: "custom",
        questions: tray.map((t) => t.question),
        teks: derivedTeks,
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        differentiationMode,
        periodIds: ["P1"],
        status,
      }),
    });
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      throw new Error(body.error ?? `Server error ${res.status}`);
    }
    const data = (await res.json()) as { assignmentId: string };
    return data.assignmentId;
  }

  async function handleSaveDraft() {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);
    try {
      const assignmentId = await callCreate("draft");
      if (assignmentId) {
        setSuccessMessage("Draft saved successfully.");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save draft.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublish() {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);
    try {
      const assignmentId = await callCreate("draft");
      if (!assignmentId) return;

      const res = await fetch("/api/assignments/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-teacher-id": teacherId,
        },
        body: JSON.stringify({ assignmentId }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `Publish failed ${res.status}`);
      }
      setSuccessMessage("Assignment published! Redirecting...");
      setTimeout(() => {
        router.push("/teacher/assignments");
      }, 1200);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to publish assignment.");
    } finally {
      setSubmitting(false);
    }
  }

  // Tab labels
  const tabItems: { value: SourceTab; label: string }[] = [
    { value: "public", label: "Public Bank" },
    { value: "private", label: "My Questions" },
    { value: "build", label: "Build New" },
  ];

  const buildTypeItems: { value: BuildType; label: string }[] = [
    { value: "mcq", label: "MCQ" },
    { value: "cer", label: "CER" },
    { value: "punnett", label: "Punnett Square" },
    { value: "short", label: "Short Response" },
    { value: "dragdrop", label: "Drag and Drop" },
  ];

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {/* ── Left panel ── */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Assignment metadata */}
        <section className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-bs-text">Assignment Details</h2>

          <label className="block">
            <span className="text-xs font-semibold text-bs-text-sub">Title *</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unit 1 Biomolecules Review"
              className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              aria-label="Assignment title"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-bs-text-sub">TEKS filter (comma-separated)</span>
              <input
                type="text"
                value={teksFilter}
                onChange={(e) => setTeksFilter(e.target.value)}
                placeholder="e.g. B.5A, B.11A"
                className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                aria-label="TEKS filter"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-bs-text-sub">Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                aria-label="Due date"
              />
            </label>
          </div>

          <div>
            <span className="text-xs font-semibold text-bs-text-sub">Differentiation mode</span>
            <div className="mt-1.5 flex items-center gap-1.5 rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-1 w-fit">
              {(["single", "tiered"] as DifferentiationMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDifferentiationMode(mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 ${
                    differentiationMode === mode
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-bs-text-sub hover:bg-bs-surface"
                  }`}
                  aria-pressed={differentiationMode === mode}
                  aria-label={mode === "single" ? "Standard mode" : "Differentiated mode"}
                >
                  {mode === "single" ? "Standard" : "Differentiated"}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Question source tabs */}
        <section className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface shadow-sm">
          {/* Tab bar */}
          <div className="flex border-b border-[var(--bs-border)] px-4 pt-3 gap-1" role="tablist" aria-label="Question source">
            {tabItems.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-t-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  activeTab === tab.value
                    ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
                    : "text-bs-text-sub hover:text-bs-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4" role="tabpanel">
            {/* Public Bank tab */}
            {activeTab === "public" && (
              <div className="space-y-3">
                <input
                  type="search"
                  value={publicSearch}
                  onChange={(e) => setPublicSearch(e.target.value)}
                  placeholder="Search by title, TEKS, topic..."
                  className="w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  aria-label="Search public bank"
                />
                {filteredPublic.length === 0 ? (
                  <p className="py-6 text-center text-sm text-bs-text-sub">No questions found.</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {filteredPublic.map((item) => {
                      const q = publicItemToQuestion(item);
                      return (
                        <QuestionCard
                          key={item.id}
                          previewText={item.prompt.slice(0, 80)}
                          typeLabel={item.itemType.replace("_", " ").toUpperCase().slice(0, 6)}
                          typeColor="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          teks={item.teks}
                          added={inTray(item.id)}
                          onAdd={() => addToTray(q)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* My Questions tab */}
            {activeTab === "private" && (
              <div className="space-y-3">
                <input
                  type="search"
                  value={privateSearch}
                  onChange={(e) => setPrivateSearch(e.target.value)}
                  placeholder="Search your questions..."
                  className="w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] px-3 py-2 text-sm text-bs-text focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  aria-label="Search my questions"
                />
                {filteredPrivate.length === 0 ? (
                  <p className="py-6 text-center text-sm text-bs-text-sub">
                    {privateEntries.length === 0
                      ? "No questions in your private bank yet. Build some in the Build New tab."
                      : "No questions match your search."}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {filteredPrivate.map((entry) => {
                      const q = entry.question;
                      const text = getQuestionText(q);
                      return (
                        <QuestionCard
                          key={entry.id}
                          previewText={text.slice(0, 80)}
                          typeLabel={getTypeLabel(q.type)}
                          typeColor={typeBadgeColor(q.type)}
                          teks={q.teks}
                          learningLevel={q.learningLevel}
                          added={inTray(q.id)}
                          onAdd={() => addToTray(q)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Build New tab */}
            {activeTab === "build" && (
              <div className="space-y-4">
                {/* Question type selector */}
                <div>
                  <span className="text-xs font-semibold text-bs-text-sub">Question type</span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5" role="group" aria-label="Select question type">
                    {buildTypeItems.map((bt) => (
                      <button
                        key={bt.value}
                        type="button"
                        onClick={() => setBuildType(bt.value)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 ${
                          buildType === bt.value
                            ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "border-[var(--bs-border)] bg-[var(--bs-raised)] text-bs-text-sub hover:border-emerald-300"
                        }`}
                        aria-pressed={buildType === bt.value}
                        aria-label={`Build ${bt.label} question`}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Builder */}
                <div className="rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-4">
                  {buildType === "mcq" && (
                    <MCQBuilder onSave={handleBuilderSave} />
                  )}
                  {buildType === "cer" && (
                    <CERBuilderWrapper onSave={handleBuilderSave} />
                  )}
                  {buildType === "punnett" && (
                    <PunnettBuilderWrapper onSave={handleBuilderSave} />
                  )}
                  {buildType === "short" && (
                    <ShortResponseBuilderInline onSave={handleBuilderSave} />
                  )}
                  {buildType === "dragdrop" && (
                    <div className="py-8 text-center">
                      <p className="text-sm font-medium text-bs-text-sub">Drag and Drop builder - Coming soon</p>
                      <p className="mt-1 text-xs text-bs-text-muted">This question type is under development.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Right panel: Assignment Tray ── */}
      <aside className="w-full md:w-80 md:shrink-0 md:sticky md:top-6">
        <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface shadow-sm">
          {/* Tray header */}
          <div className="border-b border-[var(--bs-border)] px-4 py-3">
            <h2 className="text-sm font-bold text-bs-text">
              Assignment ({tray.length} question{tray.length !== 1 ? "s" : ""})
            </h2>
          </div>

          {/* Tray question list */}
          <div className="px-3 py-3 min-h-[120px]">
            {tray.length === 0 ? (
              <p className="py-4 text-center text-sm text-bs-text-sub">No questions added yet.</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={trayIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {tray.map((item, idx) => (
                      <SortableTrayItem
                        key={item._trayId}
                        item={item}
                        index={idx}
                        onRemove={removeFromTray}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[var(--bs-border)] px-4 py-4 space-y-2">
            {/* Error / success messages */}
            {submitError && (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
                {submitError}
              </p>
            )}
            {successMessage && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                {successMessage}
              </p>
            )}

            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSaveDraft}
              className="w-full rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] py-2 text-sm font-semibold text-bs-text shadow-sm hover:bg-bs-surface disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
              aria-label="Save as draft"
            >
              {submitting ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handlePublish}
              className="w-full rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
              aria-label="Publish assignment"
            >
              {submitting ? "Publishing..." : "Publish"}
            </button>

            {!canSubmit && (
              <p className="text-center text-xs text-bs-text-muted">
                {!title.trim() ? "Add a title to enable saving." : "Add at least one question to enable saving."}
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
