import * as React from "react";

export function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-[var(--bs-border)] bg-bs-surface shadow-[0_16px_45px_rgba(2,6,23,0.06)] " +
        className
      }
    >
      {children}
    </div>
  );
}
