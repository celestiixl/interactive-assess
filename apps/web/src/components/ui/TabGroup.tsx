"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export function TabGroup<T extends string>({
  value,
  onValueChange,
  items,
  className,
}: {
  value: T;
  onValueChange: (next: T) => void;
  items: Array<{ value: T; label: string; description?: string }>;
  className?: string;
}) {
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.value === value),
  );

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn("grid gap-2 md:grid-cols-5", className)}
    >
      {items.map((item, index) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                const next = items[(currentIndex + 1) % items.length];
                if (next) onValueChange(next.value);
              }
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                const prev = items[(currentIndex - 1 + items.length) % items.length];
                if (prev) onValueChange(prev.value);
              }
            }}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "rounded-xl border px-3 py-2 text-left text-sm transition",
              active
                ? "border-[rgb(var(--color-brand-purple))] bg-[rgb(var(--color-brand-purple)/0.10)] text-text"
                : "border-border bg-surface-1 text-text hover:bg-surface-3",
            )}
          >
            <span
              className={cn(
                "block border-l-2 pl-2 font-semibold",
                active ? "border-[rgb(var(--color-brand-purple))]" : "border-transparent",
              )}
            >
              {item.label}
            </span>
            {item.description ? (
              <span className="mt-0.5 block text-xs text-text-muted">{item.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
