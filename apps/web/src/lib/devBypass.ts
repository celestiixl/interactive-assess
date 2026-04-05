"use client";

import { useEffect } from "react";
import { useStudentAuth } from "@/lib/studentAuth";
import type { StudentProfile } from "@/lib/studentAuth";
import { useTeacherAuth } from "@/lib/teacherAuth";
import type { Teacher } from "@/lib/teacherAuth";

const IS_DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS === "true";

// Matches the StudentProfile interface in studentAuth.ts
const DEV_STUDENT: StudentProfile = {
  id: "dev-student-001",
  displayName: "Dev Student",
  period: 2,
};

// Matches the Teacher interface in teacherAuth.ts
const DEV_TEACHER: Teacher = {
  name: "Ms. Daphnie (Dev)",
  email: "dev@biospark.local",
  school: "Willowridge High School",
};

/**
 * Dev-only hook that seeds both the student and teacher Zustand sessions
 * when NEXT_PUBLIC_DEV_BYPASS=true, so every page is accessible without
 * logging in. Only runs on the client; no-ops in production where the
 * env var is unset.
 *
 * Pass enabled=false to skip seeding (e.g. on /admin or /beta routes).
 */
export function useDevBypass(enabled = true) {
  useEffect(() => {
    if (!IS_DEV_BYPASS || !enabled) return;

    // Only seed if there is no existing student session
    try {
      const studentRaw = localStorage.getItem("biospark:student:session");
      const studentParsed = studentRaw ? JSON.parse(studentRaw) : null;
      if (!studentParsed?.state?.student) {
        useStudentAuth.setState({ student: DEV_STUDENT });
      }
    } catch {
      useStudentAuth.setState({ student: DEV_STUDENT });
    }

    // Only seed if there is no existing teacher session
    try {
      const teacherRaw = localStorage.getItem("ia-teacher-auth");
      const teacherParsed = teacherRaw ? JSON.parse(teacherRaw) : null;
      if (!teacherParsed?.state?.teacher) {
        useTeacherAuth.setState({ teacher: DEV_TEACHER });
      }
    } catch {
      useTeacherAuth.setState({ teacher: DEV_TEACHER });
    }
  }, [enabled]);
}
