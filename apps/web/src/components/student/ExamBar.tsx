"use client";

import * as React from "react";

export function ExamBar({
  title,
  metaLeft,
  mode,
  onModeChange,
  onOpenNotes,
  onToggleFlag,
  flagged,
}: {
  title: string;
  metaLeft?: string;
  mode: "learn" | "exam";
  onModeChange?: (m: "learn" | "exam") => void;
  onOpenNotes?: () => void;
  onToggleFlag?: () => void;
  flagged?: boolean;
}) {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/0/85 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {title}
            </div>
            {metaLeft ? (
              <div className="text-xs text-slate-500">{metaLeft}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle mode={mode} onChange={onModeChange} />
            <ToolButton label="Notes" onClick={onOpenNotes} />
            <ToolButton
              label={flagged ? "Flagged" : "Flag"}
              onClick={onToggleFlag}
              active={!!flagged}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "learn" | "exam";
  onChange?: (m: "learn" | "exam") => void;
}) {
  return (
    <div className="flex rounded-xl border border-slate-200 bg-white/0 p-1">
      <button
        onClick={() => onChange?.("learn")}
        className={[
          "rounded-lg px-3 py-1.5 text-xs",
          mode === "learn"
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-50",
        ].join(" ")}
      >
        Learn
      </button>
      <button
        onClick={() => onChange?.("exam")}
        className={[
          "rounded-lg px-3 py-1.5 text-xs",
          mode === "exam"
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-50",
        ].join(" ")}
      >
        Exam
      </button>
    </div>
  );
}

function ToolButton({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2 text-xs hover:bg-slate-50",
        active
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-slate-200 bg-white/0 text-slate-700",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
