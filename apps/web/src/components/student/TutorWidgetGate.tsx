"use client";

import { useTutorPermissions } from "@/hooks/useTutorPermissions";
import { TutorWidget } from "@/components/student/TutorWidget";
import type { TutorWidgetProps } from "@/components/student/TutorWidget";

type TutorWidgetGateProps = Omit<TutorWidgetProps, "lessonSlug" | "studentId"> & {
  lessonSlug?: string;
  studentId?: string;
};

/**
 * Thin client wrapper that reads tutor permissions and conditionally
 * renders the TutorWidget. Used in server component layouts that cannot
 * call hooks directly.
 */
export function TutorWidgetGate(props: TutorWidgetGateProps) {
  const { tutorEnabled } = useTutorPermissions();
  if (!tutorEnabled) return null;
  return <TutorWidget {...props} />;
}
