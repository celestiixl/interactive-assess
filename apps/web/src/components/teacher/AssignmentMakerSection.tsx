"use client";

import { useTeacherAuth } from "@/lib/teacherAuth";
import AssignmentMakerClient from "./AssignmentMakerClient";

/**
 * Client-side section wrapper for the New Assignment page.
 * Reads the authenticated teacher's ID from Zustand and passes it down.
 */
export default function AssignmentMakerSection() {
  const { teacher } = useTeacherAuth();

  if (!teacher) {
    return (
      <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-8 text-center text-sm text-bs-text-sub shadow-sm">
        Loading...
      </div>
    );
  }

  return <AssignmentMakerClient teacherId={teacher.email} />;
}
