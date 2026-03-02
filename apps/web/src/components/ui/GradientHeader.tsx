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
    <div className={cn("bg-brand-gradient", gradientClassName)}>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">{title}</h1>
            {subtitle ? <p className="mt-2 text-white/90">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
