"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  normalizeTeksCategory,
  teksCategoryDescription,
} from "@/lib/teksColors";

type BadgeProps = {
  className?: string;
  children?: React.ReactNode;
  title?: string;
  "aria-label"?: string;
  color?: string;
};

function hexToRgba(hex: string, alpha: number) {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return undefined;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function Badge({ className, color, ...props }: BadgeProps) {
  const shouldReduceMotion = useReducedMotion();
  const style = color
    ? {
        backgroundColor: hexToRgba(color, 0.13),
        borderColor: hexToRgba(color, 0.27),
      }
    : undefined;

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-(--bs-teal)/30 bg-(--bs-teal-dim) px-2.5 py-1 text-[11px] font-semibold text-bs-text",
        className,
      )}
      style={style}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
      transition={{ duration: 0.16 }}
      {...props}
    />
  );
}

export function TeksTag({
  category,
  description,
  className,
}: {
  category: string;
  description?: string;
  className?: string;
}) {
  const normalized = normalizeTeksCategory(category) ?? category;
  const aria = description ?? teksCategoryDescription(category);
  const toneClass =
    normalized === "RC1"
      ? "bg-bs-teal/25 border-bs-teal/60 text-bs-teal"
      : normalized === "RC2"
        ? "bg-bs-amber/20 border-bs-amber/60 text-bs-amber"
        : normalized === "RC3"
          ? "bg-bs-info/20 border-bs-info/60 text-bs-info"
          : normalized === "RC4"
            ? "bg-bs-violet/20 border-bs-violet/60 text-bs-violet"
            : normalized === "RC5"
              ? "bg-bs-success/20 border-bs-success/60 text-bs-success"
              : normalized === "RC6"
                ? "bg-bs-coral/20 border-bs-coral/60 text-bs-coral"
                : "bg-bs-amber/20 border-bs-amber/60 text-bs-amber";

  return (
    <Badge
      aria-label={aria}
      className={cn("border", toneClass, className)}
      title={aria}
    >
      {normalized}
      <span className="sr-only">{aria}</span>
    </Badge>
  );
}
