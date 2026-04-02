import type { ReactNode } from "react";
import { TutorWidgetGate } from "@/components/student/TutorWidgetGate";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";

/**
 * Layout wrapper for all student-facing pages.
 * Injects the floating AI tutor widget gated by permission settings.
 * Also injects the student floating navigation dock.
 * Does NOT apply to /auth/** or /teacher/** routes.
 */
export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <StudentFloatingDock />
      <TutorWidgetGate />
    </>
  );
}
