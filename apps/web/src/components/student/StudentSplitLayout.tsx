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
      <section className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
        <div className="flex h-[calc(100dvh-260px)] min-h-140 flex-col">
          <header className="shrink-0 border-b border-slate-200 bg-sky-50 px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span
                className="h-2 w-2 rounded-full bg-sky-500"
                aria-hidden="true"
              />
              {leftTitle}
            </div>
            <div className="text-xs text-slate-500">
              Read, zoom, annotate, reference
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-auto bg-white p-4 pb-6">
            {left}
          </div>
        </div>
      </section>

      {/* RIGHT */}
      <section className="min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
        <div className="flex h-[calc(100dvh-260px)] min-h-140 flex-col">
          <header className="shrink-0 border-b border-slate-200 bg-emerald-50 px-4 py-3">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span
                className="h-2 w-2 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              {rightTitle}
            </div>
            <div className="text-xs text-slate-500">
              Answer, sort, draft, submit
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-auto bg-white p-4 pb-6">
            {right}
          </div>

          {footer ? (
            <footer className="shrink-0 border-t border-slate-200 px-4 py-3">
              {footer}
            </footer>
          ) : null}
        </div>
      </section>
    </div>
  );
}
