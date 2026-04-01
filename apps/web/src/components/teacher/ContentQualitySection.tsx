"use client";

import { useTeacherAuth } from "@/lib/teacherAuth";
import ContentQualityClient from "./ContentQualityClient";

/**
 * Client-side section wrapper for the content quality page.
 * Reads the authenticated teacher's ID from Zustand and passes it to
 * ContentQualityClient.
 */
export default function ContentQualitySection() {
  const { teacher } = useTeacherAuth();

  if (!teacher) {
    return (
      <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-8 text-center text-sm text-bs-text-sub shadow-sm">
        Loading...
      </div>
    );
  }

  return <ContentQualityClient teacherId={teacher.email} />;
}
