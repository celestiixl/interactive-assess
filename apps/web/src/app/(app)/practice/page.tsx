"use client";

import { AppShell } from "@/components/ia/AppShell";
import AccommodationsButton from "@/components/student/AccommodationsButton";

import InlineChoice from "@/components/items/InlineChoice";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ItemRenderer from "@/components/ItemRenderer";
import AssignmentNav from "@/components/AssignmentNav";
import ProgressBar from "@/components/ui/ProgressBar";
import { ExamBar } from "@/components/student/ExamBar";
import ResultsDrawer from "@/components/student/ResultsDrawer";
import { StudentSplitLayout } from "@/components/student/StudentSplitLayout";
import { useSupports } from "@/components/student/supportsStore";
import { BilingualText } from "@/components/student/BilingualText";

import type { Item } from "@/types/item";
import { bioInteractives } from "@/data/bio9_interactives";
import { bio9Items } from "@/data/biology9";
import { STAAR_BIO } from "@/data/staar_bio";

export const dynamic = "force-dynamic";

type Status = "unseen" | "correct" | "wrong";

export default function PracticeByCategory() {
  const [checkedThisItem, setCheckedThisItem] = useState(false);
  const [attemptsById, setAttemptsById] = useState<Record<string, number>>({});

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

  const statusByIndex: Record<number, Status> = useMemo(() => {
    const map: Record<number, Status> = {};
    mergedItems.forEach((_, i) => (map[i] = "unseen")); // (wire attempts later)
    return map;
  }, [mergedItems]);

  const percent = 0; // (hook up real progress later)
  const safeIndex = Math.max(0, Math.min(current, mergedItems.length - 1));
  const safeItem = mergedItems[safeIndex];

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
    <AppShell activeKey="practice">
      <div className="ia-container py-6 space-y-6 text-[15px] leading-normal">
        <div className="sticky top-0 z-50 /90 backdrop-blur border-b border-slate-200">
          <div className="sticky top-0 z-50 /90 backdrop-blur border-b border-slate-200 flex items-center justify-between">
            <ExamBar
              title={`Practice • ${rcParam || rcLabels[0]}`}
              metaLeft={`Item ${safeIndex + 1} of ${mergedItems.length || 0}`}
              mode={mode}
              onModeChange={setMode}
              onToggleFlag={() => setFlagged((v) => !v)}
              flagged={flagged}
            />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-5 pb-10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="ml-auto flex items-center gap-2">
              <AccommodationsButton compact={true} label="Accommodations" />
            </div>
            <h1 className="text-2xl font-bold">
              Practice: {rcParam || rcLabels[0]}
            </h1>
            <ProgressBar percent={percent} label="Assignment progress" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
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
                className="rounded-md border bg-white/0 px-2 py-1"
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

          {/* RC picker */}
          <div className="flex flex-wrap gap-2">
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

          {/* Nav + Item */}
          {mergedItems.length === 0 ? (
            <div className="p-4 border rounded bg-neutral-50">
              No items for this category yet.
            </div>
          ) : (
            <StudentSplitLayout
              leftTitle="Question"
              rightTitle="Your Work"
              left={
                <div className="space-y-3">
                  <div className="text-sm text-slate-500">
                    TEKS:{" "}
                    {Array.isArray(safeItem?.teks)
                      ? safeItem.teks.join(", ")
                      : "—"}
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Prompt
                    </div>
                    <BilingualText
                      text={
                        (safeItem as any)?.prompt ??
                        (safeItem as any)?.stem ??
                        "No prompt found for this item yet."
                      }
                      showSupport={effectiveShowSupport}
                      supportLanguage={supports.state.supportLanguage}
                      classNameEn="mt-2 text-sm text-slate-700 whitespace-pre-wrap"
                      classNameSupport="mt-1 text-xs text-slate-500 italic whitespace-pre-wrap"
                    />
                  </div>
                </div>
              }
              right={
                <div className="space-y-3">
                  <AssignmentNav
                    total={mergedItems.length}
                    current={safeIndex}
                    statusByIndex={statusByIndex}
                    onSelect={setCurrent}
                  />

                  {!safeItem ? (
                    <div className="p-4 border rounded bg-neutral-50">
                      Couldn&apos;t load this item. Try another one.
                    </div>
                  ) : (
                    <ItemRenderer
                      checkSignal={checkSignal}
                      item={safeItem as any}
                      onChecked={(r) => {
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
                          allowed === Infinity
                            ? Infinity
                            : Math.max(0, allowed - usedNow);

                        const timeSeconds = Math.max(
                          0,
                          Math.round(
                            (Date.now() - questionStartRef.current) / 1000,
                          ),
                        );

                        const correct = r.score === r.max;

                        // Explanation gating:
                        // - Exam: never show
                        // - Learn + unlimited: show anytime
                        // - Learn + numbered: show only after attempts are used up
                        const canShowExplanation =
                          mode === "learn" &&
                          (correct ||
                            allowed === Infinity ||
                            usedNow >= allowed);

                        setLastResult({
                          score: r.score,
                          max: r.max,
                          correct,
                          timeSeconds,
                          attemptsLeft,
                          canShowExplanation,
                        });

                        setCheckedThisItem(true);
                        setDrawerOpen(true);
                      }}
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
                      onClick={() => {
                        if (!checkedThisItem) {
                          // Prefer clicking the item's own Check button if it exists:
                          const btn = document.querySelector(
                            'button[data-check-button="true"]',
                          ) as HTMLButtonElement | null;
                          if (btn) {
                            btn.click();
                            return;
                          }
                          // Otherwise signal the item to check itself:
                          setCheckSignal((n) => n + 1);
                          return;
                        }

                        // After checking, allow moving forward
                        if (safeIndex < mergedItems.length - 1) {
                          setCurrent(
                            Math.min(mergedItems.length - 1, safeIndex + 1),
                          );
                        }
                      }}
                      disabled={
                        !safeItem ||
                        (checkedThisItem &&
                          safeIndex === mergedItems.length - 1)
                      }
                    >
                      {checkedThisItem
                        ? safeIndex === mergedItems.length - 1
                          ? "Done"
                          : "Continue"
                        : "Check Answer"}
                    </button>
                  </div>
                </div>
              }
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
