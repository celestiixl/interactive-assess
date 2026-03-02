"use client";

import * as React from "react";
import { animate, useReducedMotion } from "framer-motion";
import Card from "./Card";

export default function StatCard({
  label,
  value,
  icon,
  cta,
  children,
  className,
}: {
  label?: string;
  value?: number | string;
  icon?: React.ReactNode;
  cta?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = React.useState<string | number>(
    typeof value === "number" ? 0 : value ?? "",
  );

  React.useEffect(() => {
    if (typeof value !== "number") {
      setDisplayValue(value ?? "");
      return;
    }
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.8,
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value, shouldReduceMotion]);

  return (
    <Card variant="elevated" className={className} animate>
      {label || value !== undefined ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-text">{label}</div>
            {icon}
          </div>
          <div className="text-2xl font-semibold tracking-tight text-text">{displayValue}</div>
          {cta ? <div className="pt-1">{cta}</div> : null}
        </div>
      ) : null}
      {children}
    </Card>
  );
}
