"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-gradient text-white shadow-md hover:brightness-105",
        secondary:
          "border border-border bg-surface-1 text-text shadow-sm hover:bg-surface-3",
        ghost: "text-text hover:bg-surface-3",
        danger: "bg-error text-white shadow-sm hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof motion.button>, "className">,
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
