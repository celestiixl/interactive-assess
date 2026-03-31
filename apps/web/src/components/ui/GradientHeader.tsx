import * as React from "react";
import { cn } from "@/lib/cn";

export function GradientHeader({
  title,
  subtitle,
  gradientClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  gradientClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-100 border-b border-bs-border bg-bs-surface/95 backdrop-blur-md",
        gradientClassName,
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-350 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-baseline gap-3">
          <h1 className="truncate text-xl font-semibold tracking-tight text-bs-text">
            {title}
          </h1>
          {subtitle ? (
            <p className="hidden truncate text-sm text-bs-text-sub sm:block">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
