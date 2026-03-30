"use client";

import * as React from "react";

export function StudentSplitLayout({
  leftTitle = "Question",
  rightTitle = "Your Work",
  left,
  right,
  footer,
}: {
  leftTitle?: string;
  rightTitle?: string;
  left: React.ReactNode;
  right: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      {/* LEFT */}
      <section className="min-h-0 overflow-hidden rounded-2xl border border-[var(--bs-border)] bg-bs-surface shadow-sm ring-1 ring-slate-100">
        <div className="flex h-[calc(100dvh-260px)] min-h-140 flex-col">
          <header className="shrink-0 border-b border-[var(--bs-border)] bg-sky-50 px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-bs-text">
              <span
                className="h-2 w-2 rounded-full bg-sky-500"
                aria-hidden="true"
              />
              {leftTitle}
            </div>
            <div className="text-xs text-bs-text-sub">
              Read, zoom, annotate, reference
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-auto bg-bs-surface p-4 pb-6">
            {left}
          </div>
        </div>
      </section>

      {/* RIGHT */}
      <section className="min-h-0 overflow-hidden rounded-2xl border border-[var(--bs-border)] bg-bs-surface shadow-sm ring-1 ring-slate-100">
        <div className="flex h-[calc(100dvh-260px)] min-h-140 flex-col">
          <header className="shrink-0 border-b border-[var(--bs-border)] bg-[rgba(74,222,128,0.06)] px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-bs-text">
              <span
                className="h-2 w-2 rounded-full bg-[#4ade80]"
                aria-hidden="true"
              />
              {rightTitle}
            </div>
            <div className="text-xs text-bs-text-sub">
              Answer, sort, draft, submit
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-auto bg-bs-surface p-4 pb-6">
            {right}
          </div>

          {footer ? (
            <footer className="shrink-0 border-t border-[var(--bs-border)] px-4 py-3">
              {footer}
            </footer>
          ) : null}
        </div>
      </section>
    </div>
  );
}
