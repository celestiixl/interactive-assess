"use client";

import * as React from "react";

export function FigureZoom({ src, alt }: { src: string; alt?: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full overflow-hidden rounded-xl border bg-muted/20 hover:bg-muted/30"
        title="Click to zoom"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ""} className="h-auto w-full" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="mx-auto h-full max-w-6xl overflow-auto rounded-2xl bg-background p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium">Figure</div>
              <button
                className="rounded-xl border px-3 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt ?? ""} className="h-auto w-full" />
          </div>
        </div>
      ) : null}
    </>
  );
}
