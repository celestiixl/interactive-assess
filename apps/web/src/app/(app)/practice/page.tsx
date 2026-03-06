"use client";

import { AppShell } from "@/components/ia/AppShell";
import AccommodationsButton from "@/components/student/AccommodationsButton";

import InlineChoice from "@/components/items/InlineChoice";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ItemRenderer from "@/components/ItemRenderer";
import AssignmentNav from "@/components/AssignmentNav";
import ProgressBar from "@/components/ui/ProgressBar";
import ResultsDrawer from "@/components/student/ResultsDrawer";
import { StudentSplitLayout } from "@/components/student/StudentSplitLayout";
import { useSupports } from "@/components/student/supportsStore";
import { BilingualText } from "@/components/student/BilingualText";

import type { Item } from "@/types/item";
import { bioInteractives } from "@/data/bio9_interactives";
import { bio9Items } from "@/data/biology9";
import { STAAR_BIO } from "@/data/staar_bio";
import { updateRecord } from "@/lib/spacedRepetition";

export const dynamic = "force-dynamic";

type Status = "unseen" | "correct" | "wrong";

function clampQuality(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, Math.round(n)));
}

function qualityFromScore(score: number, max: number): number {
  if (!Number.isFinite(max) || max <= 0) return 0;
  const pct = Math.max(0, Math.min(1, score / max));
  return clampQuality(pct * 5);
}

function normalizeTeksId(raw: string): string {
  const base = String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  return base.replace(/^([A-Z]+\.\d+)\.([A-Z0-9]+)$/i, "$1$2");
}

function extractTeksIds(item: any): string[] {
  if (!Array.isArray(item?.teks)) return [];
  return Array.from(
    new Set(
      item.teks
        .map((t: unknown) => normalizeTeksId(String(t || "")))
        .filter(Boolean),
    ),
  );
}

export default function PracticeByCategory() {
  const [checkedThisItem, setCheckedThisItem] = useState(false);
  const [attemptsById, setAttemptsById] = useState<Record<string, number>>({});
  const [statusByIndex, setStatusByIndex] = useState<Record<number, Status>>(
    {},
  );

  const supports = useSupports();
  const router = useRouter();
  const [rcParam, setRcParam] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setRcParam(params.get("rc") || "");
  }, []);

  const questionStartRef = useRef<number>(0);

  const confettiFiredForRef = useRef<string | null>(null);
  // Reporting category labels (from your STAAR map)
  const rcLabels = useMemo<string[]>(() => Object.keys(STAAR_BIO), []);

  // If no rc in URL, push first one
  useEffect(() => {
    if (!rcParam && rcLabels.length) {
      router.replace(`/practice?rc=${encodeURIComponent(rcLabels[0])}`);
    }
  }, [rcParam, rcLabels, router]);

  // Filter predicate by RC: match any TEKS whose code includes rc
  const matchRC = (it: any, rc: string) =>
    !rc ||
    (Array.isArray(it.teks) &&
      it.teks.some((t: string) => t.toLowerCase().includes(rc.toLowerCase())));

  // Merge base items + interactives for the selected RC

  // Build merged items using TEKS sets for the selected RC
  const mergedItems: Item[] = useMemo(() => {
    const rc = rcParam || rcLabels[0] || "";

    // Try to read TEKS list from STAAR_BIO[rc]
    let teksList: string[] = [];
    const entry: any = (STAAR_BIO as any)[rc];
    if (entry) {
      if (Array.isArray(entry.teks)) teksList = entry.teks;
      else if (Array.isArray(entry.TEKS)) teksList = entry.TEKS;
      else if (entry.teksIncluded && Array.isArray(entry.teksIncluded))
        teksList = entry.teksIncluded;
    }

    // Fallback mapping (matches your dashboard cards)
    if (!teksList.length) {
      const FB: Record<string, string[]> = {
        "RC1 • Cell Structure & Function": [
          "BIO.5.A",
          "BIO.5.B",
          "BIO.5.C",
          "BIO.5.D",
        ],
        "RC2 • Mechanisms of Genetics": [
          "BIO.6.A",
          "BIO.6.B",
          "BIO.7.A",
          "BIO.7.B",
          "BIO.7.C",
          "BIO.7.D",
          "BIO.8.A",
          "BIO.8.B",
        ],
        "RC3 • Biological Evolution & Classification": [
          "BIO.9.A",
          "BIO.9.B",
          "BIO.10.A",
          "BIO.10.B",
          "BIO.10.C",
          "BIO.10.D",
        ],
        "RC4 • Biological Processes & Systems": [
          "BIO.11.A",
          "BIO.11.B",
          "BIO.12.A",
          "BIO.12.B",
          "BIO.13.A",
          "BIO.13.B",
          "BIO.13.C",
          "BIO.13.D",
        ],
      };
      teksList = FB[rc] ?? [];
    }

    const teksSet = new Set(teksList.map((t) => t.toUpperCase()));
    const inRC = (it: any) =>
      Array.isArray(it.teks) &&
      it.teks.some((t: string) => teksSet.has(String(t).toUpperCase()));

    const base = (bio9Items as any[]).filter(inRC) as Item[];
    const extra = (bioInteractives as any[]).filter(inRC) as Item[];
    return [...base, ...extra];
  }, [rcParam, rcLabels]);

  const [current, setCurrent] = useState(0);
  const [lastResult, setLastResult] = useState<null | {
    score: number;
    max: number;
    correct: boolean;
    timeSeconds: number;
    attemptsLeft: number;
    canShowExplanation: boolean;
  }>(null);

  const [inlineChoiceResponse, setInlineChoiceResponse] = useState<
    Record<string, string>
  >({});
  const [checkSignal, setCheckSignal] = useState(0);
  const [mode, setMode] = useState<"learn" | "exam">("learn");
  const effectiveShowSupport = mode === "learn" && supports.state.showSupport;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flagged, setFlagged] = useState(false);
  useEffect(() => {
    // reset index when category changes
    setCurrent(0);
  }, [rcParam]);

  useEffect(() => {
    setStatusByIndex({});
  }, [rcParam, mergedItems.length]);

  const percent = useMemo(() => {
    if (!mergedItems.length) return 0;
    const seen = Object.values(statusByIndex).filter(
      (s) => s !== "unseen",
    ).length;
    return Math.round((seen / mergedItems.length) * 100);
  }, [statusByIndex, mergedItems.length]);
  const completedCount = useMemo(
    () => Object.values(statusByIndex).filter((s) => s !== "unseen").length,
    [statusByIndex],
  );
  const correctCount = useMemo(
    () => Object.values(statusByIndex).filter((s) => s === "correct").length,
    [statusByIndex],
  );
  const safeIndex = Math.max(0, Math.min(current, mergedItems.length - 1));
  const safeItem = mergedItems[safeIndex];
  const isHotspotItem = (safeItem as any)?.kind === "hotspot";

  function handleItemChecked(r: { score: number; max: number }) {
    if (!safeItem) return;

    const id = String((safeItem as any)?.id ?? safeIndex);
    const itemAttempts = (safeItem as any)?.attempts;

    // Exam mode: always 1 attempt. Unlimited only allowed in Learn.
    const allowed =
      mode === "exam"
        ? 1
        : itemAttempts === "unlimited"
          ? Infinity
          : typeof itemAttempts === "number"
            ? Math.max(1, itemAttempts)
            : 2;

    const usedPrev = attemptsById[id] ?? 0;
    const usedNow = usedPrev + 1;
    setAttemptsById((prev) => ({ ...prev, [id]: usedNow }));

    const attemptsLeft =
      allowed === Infinity ? Infinity : Math.max(0, allowed - usedNow);

    const timeSeconds = Math.max(
      0,
      Math.round((Date.now() - questionStartRef.current) / 1000),
    );

    const correct = r.score === r.max;
    const quality = qualityFromScore(r.score, r.max);
    const teksIds = extractTeksIds(safeItem);

    if (teksIds.length) {
      try {
        teksIds.forEach((teksId) => {
          updateRecord(teksId, quality);
        });
      } catch {}
    }

    // Explanation gating:
    // - Exam: never show
    // - Learn + unlimited: show anytime
    // - Learn + numbered: show only after attempts are used up
    const canShowExplanation =
      mode === "learn" &&
      (correct || allowed === Infinity || usedNow >= allowed);

    setLastResult({
      score: r.score,
      max: r.max,
      correct,
      timeSeconds,
      attemptsLeft,
      canShowExplanation,
    });

    setStatusByIndex((prev) => ({
      ...prev,
      [safeIndex]: correct ? "correct" : "wrong",
    }));

    setCheckedThisItem(true);
    setDrawerOpen(true);
  }

  function handleCheckOrContinue() {
    if (!checkedThisItem) {
      // Prefer clicking the item's own Check button if it exists.
      const btn = document.querySelector(
        'button[data-check-button="true"]',
      ) as HTMLButtonElement | null;
      if (btn) {
        btn.click();
        return;
      }
      // Otherwise signal the item to check itself.
      setCheckSignal((n) => n + 1);
      return;
    }

    // After checking, allow moving forward.
    if (safeIndex < mergedItems.length - 1) {
      setCurrent(Math.min(mergedItems.length - 1, safeIndex + 1));
    }
  }

  const questionPanel = (
    <div className="space-y-3">
      <div className="text-base text-slate-600">
        TEKS: {Array.isArray(safeItem?.teks) ? safeItem.teks.join(", ") : "—"}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-base font-semibold text-slate-900">Prompt</div>
        <BilingualText
          text={
            (safeItem as any)?.prompt ??
            (safeItem as any)?.stem ??
            "No prompt found for this item yet."
          }
          showSupport={effectiveShowSupport}
          supportLanguage={supports.state.supportLanguage}
          classNameEn="mt-2 text-lg leading-8 text-slate-800 whitespace-pre-wrap"
          classNameSupport="mt-1 text-xs text-slate-500 italic whitespace-pre-wrap"
          glossary={(safeItem as any)?.glossary ?? []}
        />
      </div>
    </div>
  );

  const answerWorkspace = (
    <>
      {!safeItem ? (
        <div className="p-4 border rounded bg-neutral-50">
          Couldn&apos;t load this item. Try another one.
        </div>
      ) : (
        <ItemRenderer
          checkSignal={checkSignal}
          item={safeItem as any}
          onChecked={handleItemChecked}
          mcqOptions={{ hideStem: true, externalControls: true }}
        />
      )}

      <div className="flex justify-between text-sm text-neutral-600">
        <button
          className="rounded-md border px-3 py-1.5 hover:bg-neutral-100 disabled:opacity-50"
          onClick={() => setCurrent(Math.max(0, safeIndex - 1))}
          disabled={safeIndex === 0}
        >
          ← Previous
        </button>
        <button
          className="rounded-md border px-3 py-1.5 hover:bg-neutral-100 disabled:opacity-50"
          onClick={handleCheckOrContinue}
          disabled={
            !safeItem ||
            (checkedThisItem && safeIndex === mergedItems.length - 1)
          }
        >
          {checkedThisItem
            ? safeIndex === mergedItems.length - 1
              ? "Done"
              : "Next"
            : "Next"}
        </button>
      </div>
    </>
  );

  const splitRightPanel = <div className="space-y-3">{answerWorkspace}</div>;

  // Reset per-question state
  useEffect(() => {
    setCheckedThisItem(false);
    questionStartRef.current = Date.now();
  }, [safeIndex, rcParam]);

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [safeIndex]);

  useEffect(() => {
    confettiFiredForRef.current = null;
  }, [safeIndex]);
  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [safeIndex]);

  return (
    <AppShell activeKey="practice" fullBleed>
      <div className="w-full space-y-5 bg-linear-to-b from-slate-50 to-white py-4 text-[15px] leading-normal">
        <div className="w-full px-2 py-4 pb-8 space-y-5 lg:px-3">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-r from-violet-100/70 via-white to-amber-100/70" />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="relative z-10">
                <h1 className="text-2xl font-bold text-slate-900">
                  Practice: {rcParam || rcLabels[0]}
                </h1>
                <div className="mt-1 text-xs text-slate-500">
                  TEKS-aligned item flow with immediate feedback and rationale.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Mode: {mode === "learn" ? "Learn" : "Exam"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Completed: {completedCount}/
                    {Math.max(1, mergedItems.length)}
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Correct: {correctCount}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex flex-wrap items-center justify-end gap-2">
                <div className="flex rounded-xl border border-slate-200 bg-white/70 p-1">
                  <button
                    type="button"
                    onClick={() => setMode("learn")}
                    className={[
                      "rounded-lg px-3 py-1.5 text-xs font-semibold",
                      mode === "learn"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Learn
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("exam")}
                    className={[
                      "rounded-lg px-3 py-1.5 text-xs font-semibold",
                      mode === "exam"
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    Exam
                  </button>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  Notes
                </button>

                <button
                  type="button"
                  onClick={() => setFlagged((v) => !v)}
                  className={[
                    "rounded-xl border px-3 py-2 text-xs",
                    flagged
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white/70 text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {flagged ? "Flagged" : "Flag"}
                </button>

                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  {safeIndex + 1}/{Math.max(1, mergedItems.length)}
                </div>
                <AccommodationsButton compact={true} label="Accommodations" />
              </div>
            </div>

            <div className="relative z-10 mt-4">
              <ProgressBar percent={percent} label="Assignment progress" />
            </div>

            <div className="relative z-10 mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-emerald-600"
                  checked={effectiveShowSupport}
                  disabled={mode !== "learn"}
                  onChange={(e) => supports.setShowSupport(e.target.checked)}
                />
                Show Spanish support
                <span className="text-slate-400">
                  (helper line under English)
                </span>
              </label>

              <div className="flex items-center gap-2 text-sm text-slate-700">
                <span className="text-slate-500">Support language:</span>
                <select
                  className="rounded-md border border-slate-300 bg-white/80 px-2 py-1 text-slate-900"
                  value={supports.state.supportLanguage}
                  onChange={(e) =>
                    supports.setSupportLanguage(e.target.value as any)
                  }
                  disabled={!effectiveShowSupport}
                >
                  <option value="es">Español</option>
                  <option value="vi">Tiếng Việt</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>

            <div className="relative z-10 mt-4 flex flex-wrap gap-2">
              {rcLabels.map((rc) => (
                <button
                  key={rc}
                  onClick={() =>
                    router.replace(`/practice?rc=${encodeURIComponent(rc)}`)
                  }
                  className={`pill ${rc === (rcParam || rcLabels[0]) ? "border-emerald-400 text-emerald-700" : ""}`}
                >
                  {rc}
                </button>
              ))}
            </div>

            <div className="relative z-10 mt-4 rounded-2xl border border-slate-200 bg-white/80 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Question navigator
              </div>
              <AssignmentNav
                total={mergedItems.length}
                current={safeIndex}
                statusByIndex={statusByIndex}
                onSelect={setCurrent}
              />
            </div>
          </div>

          {/* Nav + Item */}
          {mergedItems.length === 0 ? (
            <div className="p-4 border rounded bg-neutral-50">
              No items for this category yet.
            </div>
          ) : isHotspotItem ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
              <header className="border-b border-slate-200 bg-linear-to-r from-sky-50 via-indigo-50 to-emerald-50 px-4 py-3">
                <div className="text-sm font-semibold text-slate-900">
                  Interactive Hotspot
                </div>
                <div className="text-xs text-slate-500">
                  Select regions directly on the image, then check your answer.
                </div>
              </header>
              <div className="grid gap-4 p-4 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  {questionPanel}
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  {answerWorkspace}
                </div>
              </div>
            </section>
          ) : (
            <StudentSplitLayout
              leftTitle="Question"
              rightTitle="Your Work"
              left={questionPanel}
              right={splitRightPanel}
            />
          )}

          <ResultsDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            correct={!!lastResult?.correct}
            score={lastResult?.score ?? 0}
            max={lastResult?.max ?? 0}
            timeSeconds={lastResult?.timeSeconds ?? 0}
            attemptsLeft={lastResult?.attemptsLeft ?? null}
            explanation={
              lastResult?.canShowExplanation && mode === "learn"
                ? ((safeItem as any)?.rationale ??
                  "Explanation goes here (wire to item later).")
                : undefined
            }
            hasNext={safeIndex < mergedItems.length - 1}
            onNext={() => {
              if (safeIndex < mergedItems.length - 1) {
                setDrawerOpen(false);
                setCurrent((i) => Math.min(i + 1, mergedItems.length - 1));
              }
            }}
          />
        </div>

        {(safeItem as any)?.type === "inline_choice" ? (
          <InlineChoice
            item={safeItem as any}
            disabled={mode === "exam" && !!checkedThisItem}
            onChange={(r) => setInlineChoiceResponse(r)}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
