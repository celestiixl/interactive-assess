"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export function NavigationSidebar({
  items,
  className,
}: {
  items: Array<{ href: string; label: string; description?: string }>;
  className?: string;
}) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <nav className={cn("space-y-2", className)} aria-label="Assessment navigation">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative block overflow-hidden rounded-xl border px-3 py-2.5 transition",
              active
                ? "border-[rgb(var(--color-brand-purple)/0.5)] bg-[rgb(var(--color-brand-purple)/0.12)]"
                : "border-border bg-surface-1 hover:bg-surface-3",
            )}
          >
            <AnimatePresence>
              {active ? (
                <motion.span
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
                  className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-[rgb(var(--color-brand-purple))] shadow-[0_0_20px_rgb(var(--color-brand-purple)/0.65)]"
                />
              ) : null}
            </AnimatePresence>
            <div className="pl-2">
              <div className="text-sm font-semibold text-text">{item.label}</div>
              {item.description ? (
                <div className="text-xs text-text-muted">{item.description}</div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
