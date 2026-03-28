import * as React from "react";

export type Tone =
  | "neutral"
  | "teal"
  | "emerald"
  | "amber"
  | "violet"
  | "slate"
  | "white";

export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm " +
    "leading-none select-none";

  // Light mode is the primary look right now (clean, airy).
  // Dark mode classes are still included but not the focus.
  const tones: Record<Tone, string> = {
    neutral: "border-[var(--bs-border)] bg-bs-surface text-bs-text",
    teal: "border-teal-200 bg-teal-50 text-bs-teal shadow-[0_0_0_1px_rgba(20,184,166,0.08)]",
    emerald:
      "border-emerald-200 bg-[rgba(74,222,128,0.06)] text-[#4ade80] shadow-[0_0_0_1px_rgba(16,185,129,0.08)]",
    amber:
      "border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.06)] text-bs-amber shadow-[0_0_0_1px_rgba(245,158,11,0.10)]",
    violet:
      "border-violet-200 bg-violet-50 text-violet-900 shadow-[0_0_0_1px_rgba(139,92,246,0.10)]",
    slate:
      "border-[var(--bs-border)] bg-bs-surface text-bs-text shadow-[0_0_0_1px_rgba(148,163,184,0.10)]",
    white: "border-[var(--bs-border)] bg-[rgba(19,38,56,0.2)] text-white",
  };

  return (
    <span className={`${base} ${tones[tone]} ${className}`}>{children}</span>
  );
}

export function IconPill({
  tone = "slate",
  className = "",
  title,
}: {
  tone?: Tone;
  className?: string;
  title?: string;
}) {
  const dot: Record<Tone, string> = {
    neutral: "bg-bs-text-muted",
    teal: "bg-bs-teal",
    emerald: "bg-[#4ade80]",
    amber: "bg-bs-amber",
    violet: "bg-violet-500",
    slate: "bg-bs-text-muted",
    white: "bg-bs-surface",
  };

  return (
    <span
      title={title}
      className={
        "inline-flex items-center justify-center rounded-full border border-[var(--bs-border)] bg-bs-surface px-2.5 py-1 text-xs font-semibold shadow-sm " +
        className
      }
    >
      <span className={`h-2 w-2 rounded-full ${dot[tone]} opacity-80`} />
    </span>
  );
}
