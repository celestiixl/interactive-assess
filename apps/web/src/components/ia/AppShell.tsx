"use client";

import * as React from "react";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

export function AppShell({
  activeKey,
  children,
  fullBleed = false,
}: {
  activeKey?: "assessment" | "student_lab" | "items" | "practice" | "teacher";
  children: React.ReactNode;
  fullBleed?: boolean;
}) {
  const headerClass = fullBleed
    ? "w-full px-2 py-4 flex items-center"
    : "mx-auto max-w-screen-2xl px-6 py-5 flex items-center";
  const bodyClass = fullBleed
    ? "grid w-full grid-cols-1 gap-3 px-2 py-3 lg:grid-cols-[220px_minmax(0,1fr)]"
    : "mx-auto grid w-full max-w-screen-2xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]";

  return (
    <div className="min-h-dvh bg-bs-bg text-bs-text">
      <div className="sticky top-0 z-100 w-full border-b border-bs-border bg-bs-surface/95 backdrop-blur-md">
        <div className={headerClass}>
          <Topbar />
        </div>
      </div>
      <div className={bodyClass}>
        <aside>
          <Sidebar activeKey={activeKey} />
        </aside>
        <main className="space-y-6">
          <div className="relative min-h-dvh">
            <div
              className={
                fullBleed
                  ? "relative z-10 pb-8 pt-1"
                  : "relative z-10 px-6 pb-16 pt-8"
              }
            >
              <div className={fullBleed ? "w-full" : "mx-auto max-w-350"}>
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
