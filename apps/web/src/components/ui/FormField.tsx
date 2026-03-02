import * as React from "react";
import { cn } from "@/lib/cn";

export function FormField({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)} htmlFor={htmlFor}>
      <span className="text-sm font-medium text-text">{label}</span>
      {children}
      {error ? (
        <span className="inline-flex items-center gap-1 text-xs text-error">
          <span aria-hidden>⚠</span>
          {error}
        </span>
      ) : null}
    </label>
  );
}
