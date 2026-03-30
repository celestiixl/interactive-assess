"use client";

import React, { useState } from "react";
import { getTeksEntry, teksLabel } from "@/lib/teks";

export default function TeksTooltip({ code }: { code: string }) {
  if (!code) return null;
  const entry = getTeksEntry(code);
  const label = teksLabel(code);
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        tabIndex={0}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="cursor-help underline decoration-dotted"
      >
        {code}
      </span>

      {open && (
        <div className="absolute z-50 w-80 left-1/2 -translate-x-1/2 mt-2 rounded-lg border bg-bs-surface p-3 text-sm text-bs-text shadow-lg">
          <div className="font-semibold">{label}</div>
          {entry?.strand && (
            <div className="mt-1 text-xs text-bs-text-sub">{entry.strand}</div>
          )}
          {entry?.description && (
            <div className="mt-2 text-xs text-bs-text-sub">
              {entry.description}
            </div>
          )}
        </div>
      )}
    </span>
  );
}
