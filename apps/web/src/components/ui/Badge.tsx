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
};

export function Badge({ className, ...props }: BadgeProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-text",
        className,
      )}
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
      ? "bg-teks-rc1"
      : normalized === "RC2"
        ? "bg-teks-rc2"
        : normalized === "RC3"
          ? "bg-teks-rc3"
          : normalized === "RC4"
            ? "bg-teks-rc4"
            : normalized === "RC5"
              ? "bg-teks-rc5"
              : normalized === "RC6"
                ? "bg-teks-rc6"
                : "bg-teks-rc2";

  return (
    <Badge
      aria-label={aria}
      className={cn("border-transparent text-white", toneClass, className)}
      title={aria}
    >
      {normalized}
      <span className="sr-only">{aria}</span>
    </Badge>
  );
}
