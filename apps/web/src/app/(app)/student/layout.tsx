"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useStudentAuth } from "@/lib/studentAuth";
import { TutorWidgetGate } from "@/components/student/TutorWidgetGate";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";

/**
 * Layout wrapper for all student-facing pages.
 * Guards against unauthenticated access — redirects to /student/login.
 * Also injects the floating AI tutor widget gated by permission settings
 * and the student floating navigation dock.
 */
export default function StudentLayout({ children }: { children: ReactNode }) {
  const { student } = useStudentAuth();
  const router = useRouter();

  useEffect(() => {
    if (!student) {
      router.replace("/student/login");
    }
  }, [student, router]);

  // Render nothing until the client store has hydrated to avoid authenticated-content flash.
  if (!student) return null;

  return (
    <>
      {children}
      <StudentFloatingDock />
      <TutorWidgetGate />
    </>
  );
}

