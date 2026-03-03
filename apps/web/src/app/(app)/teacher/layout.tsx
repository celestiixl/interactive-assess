"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTeacherAuth } from "@/lib/teacherAuth";

/**
 * Guards all /teacher/* routes.
 * Redirects to /teacher/login when no teacher session exists.
 */
export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { teacher } = useTeacherAuth();
  const router = useRouter();

  useEffect(() => {
    if (!teacher) {
      router.replace("/teacher/login");
    }
  }, [teacher, router]);

  // Render nothing until the client store has hydrated to avoid authenticated-content flash.
  if (!teacher) return null;

  return <>{children}</>;
}
