"use client";

import * as React from "react";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

export function AppShell({
  activeKey,
  children,
}: {
  activeKey?: "assessment" | "student_lab" | "items" | "practice" | "teacher";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]">
      <div className="ia-header w-full">
        <div className="mx-auto max-w-screen-2xl px-6 py-5 flex items-center">
          <Topbar />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]">
        <aside>
          <Sidebar activeKey={activeKey} />
        </aside>
        <main className="space-y-6">
          <div className="relative min-h-dvh">
            <div className="relative z-10 px-6 pb-16 pt-8">
              <div className="mx-auto max-w-350">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
