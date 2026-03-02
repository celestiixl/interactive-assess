import * as React from "react";
import MasteryDonut, { type DonutSegment } from "@/components/student/MasteryDonut";

export function MasteryRing({ segments }: { segments: DonutSegment[] }) {
  return (
    <div className="relative isolate rounded-2xl bg-surface-1 p-4">
      <div className="pointer-events-none absolute inset-0 -z-10 mx-auto my-auto h-56 w-56 rounded-full bg-[rgb(var(--color-brand-purple)/0.28)] blur-3xl" />
      <MasteryDonut segments={segments} />
      <p className="mt-3 text-center text-sm text-text-muted">
        Hover a slice to see category name and mastery.
      </p>
    </div>
  );
}
