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
      <div className="mx-auto w-full max-w-350 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-bs-text">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-bs-text-sub">{subtitle}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
