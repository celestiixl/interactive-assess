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
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "sm" | "elevated" | "bordered" | "accent";
  accentColor?: "teal" | "blue" | "purple" | "orange" | "green" | "pink";
  animate?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const basePadding = variant === "sm" ? "p-5" : "p-6";
  const tone =
    variant === "elevated"
      ? "border border-border bg-surface-1 shadow-lg"
      : variant === "bordered"
        ? "border-2 border-border bg-surface-1 shadow-sm"
        : variant === "accent"
          ? "border border-border bg-surface-1 shadow-md"
          : "border border-border bg-surface-1 shadow-md";

  const accentTone =
    accentColor === "teal"
      ? "border-l-teks-rc1"
      : accentColor === "blue"
        ? "border-l-teks-rc2"
        : accentColor === "purple"
          ? "border-l-teks-rc3"
          : accentColor === "orange"
            ? "border-l-teks-rc4"
            : accentColor === "green"
              ? "border-l-teks-rc5"
              : accentColor === "pink"
                ? "border-l-teks-rc6"
                : "border-l-brand-purple";

  return (
    <motion.div
      initial={animate && !shouldReduceMotion ? { opacity: 0, y: 12 } : undefined}
      animate={animate && !shouldReduceMotion ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
      className={cn(
        "rounded-2xl",
        basePadding,
        tone,
        variant === "accent" ? cn("border-l-4", accentTone) : null,
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
