"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export default function Card({
  children,
  className,
  variant = "default",
  accentColor,
  animate = false,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "sm" | "elevated" | "bordered" | "accent";
  accentColor?: "teal" | "blue" | "purple" | "orange" | "green" | "pink";
  animate?: boolean;
  glow?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const basePadding = variant === "sm" ? "p-5" : "p-6";
  const tone =
    variant === "elevated"
      ? "border border-bs-border bg-bs-surface shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      : variant === "bordered"
        ? "border-2 border-bs-border bg-bs-surface shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
        : variant === "accent"
          ? "border border-bs-border bg-bs-surface shadow-[0_6px_16px_rgba(0,0,0,0.28)]"
          : "border border-bs-border bg-bs-surface shadow-[0_6px_16px_rgba(0,0,0,0.28)]";

  const accentTone =
    accentColor === "teal"
      ? "border-l-bs-teal"
      : accentColor === "blue"
        ? "border-l-bs-info"
        : accentColor === "purple"
          ? "border-l-bs-violet"
          : accentColor === "orange"
            ? "border-l-bs-amber"
            : accentColor === "green"
              ? "border-l-bs-success"
              : accentColor === "pink"
                ? "border-l-bs-coral"
                : "border-l-bs-teal";

  return (
    <motion.div
      initial={
        animate && !shouldReduceMotion ? { opacity: 0, y: 12 } : undefined
      }
      animate={
        animate && !shouldReduceMotion ? { opacity: 1, y: 0 } : undefined
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
      className={cn(
        "rounded-2xl",
        basePadding,
        tone,
        variant === "accent" ? cn("border-l-4", accentTone) : null,
        glow || animate
          ? "shadow-[0_4px_16px_rgba(0,0,0,0.4),var(--bs-teal-glow)]"
          : null,
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
