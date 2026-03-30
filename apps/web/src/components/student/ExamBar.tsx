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
    <div className="sticky top-0 z-30 border-b border-[var(--bs-border)] bg-bs-surface/85 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-bs-text">
              {title}
            </div>
            {metaLeft ? (
              <div className="text-xs text-bs-text-sub">{metaLeft}</div>
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
    <div className="flex rounded-xl border border-[var(--bs-border)] bg-bs-surface p-1">
      <button
        onClick={() => onChange?.("learn")}
        className={[
          "rounded-lg px-3 py-1.5 text-xs",
          mode === "learn"
            ? "bg-[var(--bs-raised)] text-bs-text"
            : "text-bs-text-sub hover:bg-[var(--bs-raised)]",
        ].join(" ")}
      >
        Learn
      </button>
      <button
        onClick={() => onChange?.("exam")}
        className={[
          "rounded-lg px-3 py-1.5 text-xs",
          mode === "exam"
            ? "bg-[var(--bs-raised)] text-bs-text"
            : "text-bs-text-sub hover:bg-[var(--bs-raised)]",
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
        "rounded-xl border px-3 py-2 text-xs hover:bg-[var(--bs-raised)]",
        active
          ? "border-emerald-300 bg-[rgba(74,222,128,0.06)] text-[#4ade80]"
          : "border-[var(--bs-border)] bg-bs-surface text-bs-text-sub",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
