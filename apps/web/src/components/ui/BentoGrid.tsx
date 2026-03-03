import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Span variants for individual bento cells.
 *   1x1 – default single cell
 *   2x1 – spans 2 columns
 *   1x2 – spans 2 rows
 *   2x2 – spans 2 cols × 2 rows
 *   3x1 – spans 3 columns (full-width in a 3-col grid)
 */
export type BentoSpan = "1x1" | "2x1" | "1x2" | "2x2" | "3x1";

export interface BentoCellProps {
  children: React.ReactNode;
  span?: BentoSpan;
  className?: string;
}

const colSpan: Record<BentoSpan, string> = {
  "1x1": "",
  "2x1": "col-span-2",
  "1x2": "",
  "2x2": "col-span-2",
  "3x1": "col-span-3",
};

const rowSpan: Record<BentoSpan, string> = {
  "1x1": "",
  "2x1": "",
  "1x2": "row-span-2",
  "2x2": "row-span-2",
  "3x1": "",
};

/** A single cell inside a BentoGrid. Accepts `span` to control column/row spanning. */
export function BentoCell({
  children,
  span = "1x1",
  className,
}: BentoCellProps) {
  return (
    <div className={cx(colSpan[span], rowSpan[span], "min-w-0", className)}>
      {children}
    </div>
  );
}

export interface BentoGridProps {
  children: React.ReactNode;
  /** Number of columns at the largest breakpoint (default 3) */
  cols?: 2 | 3 | 4;
  className?: string;
}

const colClass: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * BentoGrid – a responsive CSS grid container.
 *
 * Usage:
 * ```tsx
 * <BentoGrid cols={3} className="gap-4">
 *   <BentoCell span="2x1">…wide card…</BentoCell>
 *   <BentoCell>…regular card…</BentoCell>
 * </BentoGrid>
 * ```
 */
export default function BentoGrid({
  children,
  cols = 3,
  className,
}: BentoGridProps) {
  return (
    <div
      className={cx(
        "grid auto-rows-fr gap-4",
        colClass[cols] ?? colClass[3],
        className
      )}
    >
      {children}
    </div>
  );
}
