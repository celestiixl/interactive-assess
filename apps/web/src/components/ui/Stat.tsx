import * as React from "react";
import { cn } from "@/lib/cn";

export function Stat({
  label,
  value,
  color,
  className,
}: {
  label: string;
  value: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-bs-raised p-3", className)}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-bs-text-muted">
        {label}
      </div>
      <div
        className="mt-1 font-mono text-[18px] font-bold"
        style={{ color: color ?? "var(--bs-text)" }}
      >
        {value}
      </div>
    </div>
  );
}
