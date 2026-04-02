import type { ReactNode } from "react";
import { TutorWidgetGate } from "@/components/student/TutorWidgetGate";

/**
 * Layout wrapper for all student-facing pages.
 * Injects the floating AI tutor widget gated by permission settings.
 * Does NOT apply to /auth/** or /teacher/** routes.
 */
export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <TutorWidgetGate />
    </>
  );
}
