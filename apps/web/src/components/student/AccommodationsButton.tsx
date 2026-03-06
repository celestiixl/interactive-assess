"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  applyAccToDocument,
  DEFAULT_ACC,
  loadAcc,
  saveAcc,
  type Supports,
} from "@/lib/accommodations";

type Props = {
  label?: string;
  compact?: boolean;
  className?: string;
};

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left"
    >
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {desc ? (
          <div className="mt-1 text-xs text-slate-600">{desc}</div>
        ) : null}
      </div>
      <div
        className={[
          "h-6 w-11 rounded-full border transition",
          checked ? "bg-slate-900" : "bg-slate-200",
        ].join(" ")}
      >
        <div
          className={[
            "mt-0.5 h-5 w-5 rounded-full bg-transparent shadow transition",
            checked ? "translate-x-5" : "translate-x-0.5",
          ].join(" ")}
        />
      </div>
    </button>
  );
}

export default function SupportsButton({
  label = "Supports",
  compact = false,
  className,
}: Props) {
  // Hydration-safe: start with defaults, then load after mount
  const [open, setOpen] = useState(false);
  const [acc, setAcc] = useState<Supports>(DEFAULT_ACC);
  const [hydrated, setHydrated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const a = loadAcc();
    setAcc(a);
    applyAccToDocument(a);
    setHydrated(true);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!hydrated) return;
    saveAcc(acc);
    applyAccToDocument(acc);
  }, [acc, hydrated]);

  const buttonText = useMemo(() => {
    if (!hydrated) return label;
    const enabledCount =
      (acc.largeText ? 1 : 0) +
      (acc.highContrast ? 1 : 0) +
      (acc.focusMode ? 1 : 0) +
      (acc.reduceChoices === 2 ? 1 : 0) +
      (acc.tts ? 1 : 0) +
      (acc.ttsVoice !== "auto" ? 1 : 0) +
      (acc.ttsSpeed === "slow" ? 1 : 0) +
      (acc.lang === "es" ? 1 : 0);
    return enabledCount ? `${label} (${enabledCount})` : label;
  }, [acc, hydrated, label]);

  return (
    <>
      <button
        type="button"
        aria-label="Open accommodations settings"
        onClick={() => setOpen(true)}
        className={[
          "ia-pill",
          compact ? "px-3 py-1.5 text-xs" : "",
          className || "",
        ].join(" ")}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 text-slate-700"
        >
          <path
            fill="currentColor"
            d="M7 3h2v18H7V3Zm8 0h2v18h-2V3ZM3 7h4v2H3V7Zm14 0h4v2h-4V7ZM3 15h4v2H3v-2Zm14 0h4v2h-4v-2ZM9 11h6v2H9v-2Z"
          />
        </svg>
        <span>{buttonText}</span>
      </button>

      {open && mounted
        ? createPortal(
            <div className="fixed inset-0 z-9999 flex items-end justify-center overflow-y-auto overscroll-contain bg-black/40 p-2 sm:items-center sm:p-4">
              <div className="my-2 w-full max-w-xl max-h-[92dvh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-slate-900">
                      Supports
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      These are optional supports you can turn on for yourself.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full border bg-transparent px-3 py-1.5 text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold text-slate-800">
                      Language
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAcc((p) => ({ ...p, lang: "en" }))}
                        className={[
                          "rounded-full border px-3 py-1.5 text-sm font-semibold",
                          acc.lang === "en"
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900",
                        ].join(" ")}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => setAcc((p) => ({ ...p, lang: "es" }))}
                        className={[
                          "rounded-full border px-3 py-1.5 text-sm font-semibold",
                          acc.lang === "es"
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900",
                        ].join(" ")}
                      >
                        Español
                      </button>
                    </div>
                  </div>

                  <ToggleRow
                    title="Large text"
                    desc="Bigger font + spacing across the app."
                    checked={acc.largeText}
                    onChange={(v) => setAcc((p) => ({ ...p, largeText: v }))}
                  />
                  <ToggleRow
                    title="High contrast"
                    desc="Stronger contrast for readability."
                    checked={acc.highContrast}
                    onChange={(v) => setAcc((p) => ({ ...p, highContrast: v }))}
                  />
                  <ToggleRow
                    title="Focus mode"
                    desc="Reduce distractions (hides XP/streak/specimen flair where possible)."
                    checked={acc.focusMode}
                    onChange={(v) => setAcc((p) => ({ ...p, focusMode: v }))}
                  />

                  <ToggleRow
                    title="Read aloud"
                    desc="Enable text-to-speech controls where available."
                    checked={acc.tts}
                    onChange={(v) => setAcc((p) => ({ ...p, tts: v }))}
                  />

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Read aloud voice
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Choose voice style for text-to-speech.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAcc((p) => ({ ...p, ttsVoice: "auto" }))
                        }
                        className={[
                          "rounded-full border px-3 py-1.5 text-sm font-semibold",
                          acc.ttsVoice === "auto"
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900",
                        ].join(" ")}
                      >
                        Auto
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAcc((p) => ({ ...p, ttsVoice: "female" }))
                        }
                        className={[
                          "rounded-full border px-3 py-1.5 text-sm font-semibold",
                          acc.ttsVoice === "female"
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900",
                        ].join(" ")}
                      >
                        Natural female
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAcc((p) => ({ ...p, ttsVoice: "male" }))
                        }
                        className={[
                          "rounded-full border px-3 py-1.5 text-sm font-semibold",
                          acc.ttsVoice === "male"
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900",
                        ].join(" ")}
                      >
                        Natural male
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Read aloud speed
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Slower speed can improve clarity for dense passages.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAcc((p) => ({ ...p, ttsSpeed: "normal" }))
                        }
                        className={[
                          "rounded-full border px-3 py-1.5 text-sm font-semibold",
                          acc.ttsSpeed === "normal"
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900",
                        ].join(" ")}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAcc((p) => ({ ...p, ttsSpeed: "slow" }))
                        }
                        className={[
                          "rounded-full border px-3 py-1.5 text-sm font-semibold",
                          acc.ttsSpeed === "slow"
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900",
                        ].join(" ")}
                      >
                        Slower
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">
                      Reduce answer choices
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Hide two distractors on supported multiple-choice
                      questions.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAcc((p) => ({ ...p, reduceChoices: 0 }))
                        }
                        className={[
                          "rounded-full border px-3 py-1.5 text-sm font-semibold",
                          acc.reduceChoices === 0
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900",
                        ].join(" ")}
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAcc((p) => ({ ...p, reduceChoices: 2 }))
                        }
                        className={[
                          "rounded-full border px-3 py-1.5 text-sm font-semibold",
                          acc.reduceChoices === 2
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900",
                        ].join(" ")}
                      >
                        Reduce by 2
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAcc(DEFAULT_ACC)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold"
                  >
                    Reset accommodations
                  </button>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  Note: This is not an official IEP/504 manager; it’s
                  student-facing supports you can toggle on/off.
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
