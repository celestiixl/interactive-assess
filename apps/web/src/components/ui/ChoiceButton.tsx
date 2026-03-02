"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type ChoiceState = "idle" | "selected" | "correct" | "incorrect";

export function ChoiceButton({
  id,
  label,
  text,
  children,
  checked,
  state = "idle",
  onSelect,
  roleType = "radio",
  className,
}: {
  id: string;
  label: string;
  text?: string;
  children?: React.ReactNode;
  checked: boolean;
  state?: ChoiceState;
  onSelect: (id: string) => void;
  roleType?: "radio" | "checkbox";
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  const toneClass =
    state === "correct"
      ? "border-success bg-success/15"
      : state === "incorrect"
        ? "border-error bg-error/15"
        : checked
          ? "border-[rgb(var(--color-brand-purple))] bg-[rgb(var(--color-brand-purple)/0.12)]"
          : "border-border bg-surface-1 hover:bg-surface-3";

  return (
    <motion.button
      type="button"
      role={roleType}
      aria-checked={checked}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(id);
        }
      }}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm text-text transition-colors focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-brand-purple))]",
        toneClass,
        className,
      )}
      animate={
        shouldReduceMotion || state !== "incorrect"
          ? undefined
          : { x: [0, -3, 3, -2, 2, 0] }
      }
      transition={{ duration: 0.2 }}
    >
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface-2 text-xs font-bold">
          {label}
        </span>
        <span>{children ?? text}</span>
      </span>
      <span aria-hidden className="text-base">
        {state === "correct" ? "✓" : state === "incorrect" ? "✕" : checked ? "●" : "○"}
      </span>
    </motion.button>
  );
}
