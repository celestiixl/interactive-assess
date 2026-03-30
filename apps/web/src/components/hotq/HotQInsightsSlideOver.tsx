"use client";

import * as React from "react";
import HotQuestionTeacherInsights from "@/components/hotq/HotQuestionTeacherInsights";
import { formatUSDate } from "@/lib/dateFormat";

export default function HotQInsightsSlideOver() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full border bg-transparent px-4 py-3 shadow-lg hover:shadow-xl transition flex items-center gap-2"
        aria-label="Open Hot Question insights"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-bs-teal text-white text-sm font-semibold">
          HQ
        </span>
        <span className="text-sm font-semibold text-bs-text">
          Hot Q Insights
        </span>
        <span className="text-xs text-bs-text-sub hidden md:inline">
          View response breakdown
        </span>
      </button>

      {/* Backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={() => setOpen(false)}
        />
      ) : null}

      {/* Slide-over panel */}
      <div
        className={[
          "fixed top-0 right-0 z-50 h-full w-full max-w-md bg-transparent shadow-2xl transition-transform",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-bs-text">
              Hot Question Insights
            </div>
            <div className="text-xs text-bs-text-sub truncate">
              Today’s question breakdown
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-[var(--bs-raised)]"
          >
            Close
          </button>
        </div>

        <div className="p-4 overflow-auto h-[calc(100%-64px)]">
          {/* Reuse the insights component, but we want it un-framed inside panel */}
          <div className="rounded-3xl border bg-transparent p-0 shadow-none">
            {/* HotQuestionTeacherInsights is a <details>. Force it open-looking by wrapping styling is ok */}
            <HotQuestionTeacherInsights />
          </div>
        </div>
      </div>
    </>
  );
}
