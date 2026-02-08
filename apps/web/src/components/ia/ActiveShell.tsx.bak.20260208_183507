"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "./AppShell";

function activeFromPath(path: string | null) {
  const p = path || "";
  if (p.startsWith("/teacher")) return "teacher";
  if (p.startsWith("/student/assessment/items")) return "items";
  if (p.startsWith("/student/assessment")) return "student_lab";
  if (p.startsWith("/practice")) return "practice";
  if (p.startsWith("/assessment")) return "assessment";
  return undefined;
}

export function ActiveShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeKey = activeFromPath(pathname);
  return <AppShell activeKey={activeKey as any}>{children}</AppShell>;
}
