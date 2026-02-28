"use client";

import * as React from "react";

export function ScratchNotes({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border bg-muted/10 p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        Scratch Notes
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px] w-full resize-y rounded-xl border bg-background p-3 text-sm outline-none"
        placeholder="Jot ideas, evidence, vocab..."
      />
    </div>
  );
}
