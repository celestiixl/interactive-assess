"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full font-bold transition-all duration-180 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-bs-teal text-[#04231f] shadow-[0_0_0_rgba(0,0,0,0)] hover:-translate-y-px hover:shadow-[var(--bs-teal-glow)]",
        secondary:
          "border border-bs-border bg-transparent text-bs-text hover:-translate-y-px hover:border-bs-teal/60 hover:text-bs-teal",
        ghost:
          "bg-transparent text-bs-teal hover:-translate-y-px hover:bg-[var(--bs-teal-dim)]",
        danger:
          "border border-bs-coral/60 bg-bs-coral text-[#2b0b0b] hover:-translate-y-px hover:brightness-105",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof motion.button>, "className">,
    VariantProps<typeof buttonVariants> {
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
