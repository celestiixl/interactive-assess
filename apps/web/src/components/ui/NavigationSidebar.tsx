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
    <nav
      className={cn("space-y-2", className)}
      aria-label="Assessment navigation"
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative block overflow-hidden rounded-xl border px-3 py-2.5 transition",
              active
                ? "border-bs-teal/60 bg-[var(--bs-teal-dim)]"
                : "border-bs-border bg-bs-surface hover:bg-bs-raised",
            )}
          >
            <AnimatePresence>
              {active ? (
                <motion.span
                  initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={
                    shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }
                  }
                  exit={
                    shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -6 }
                  }
                  className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-bs-teal shadow-[0_0_20px_rgba(0,212,170,0.65)]"
                />
              ) : null}
            </AnimatePresence>
            <div className="pl-2">
              <div className="text-sm font-semibold text-bs-text">
                {item.label}
              </div>
              {item.description ? (
                <div className="text-xs text-bs-text-muted">
                  {item.description}
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
