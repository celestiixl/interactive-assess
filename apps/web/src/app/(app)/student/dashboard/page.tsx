import DashboardClient from "@/components/student/DashboardClient";
import { LEARNING_UNITS } from "@/lib/learningHubContent";
import { MOCK_STUDENT_ASSIGNMENTS } from "@/lib/studentAssignments";

export default function StudentDashboard() {
  const firstUnit = LEARNING_UNITS[0];
  const firstLesson = firstUnit?.lessons[0] ?? null;
  const secondLesson = firstUnit?.lessons[1] ?? null;

  const dueAssignment = (() => {
    const asgn = MOCK_STUDENT_ASSIGNMENTS.find(
      (a) => a.status === "not_started" && a.dueDate != null,
    );
    if (!asgn) return null;
    return {
      title: asgn.title,
      dueDate: asgn.dueDate!,
      questionCount: asgn.totalItems,
    };
  })();

  return (
    <DashboardClient
      studentName="Student"
      currentLesson={firstLesson}
      currentUnitId={firstUnit?.id ?? null}
      nextLesson={secondLesson}
      nextUnitId={firstUnit?.id ?? null}
      weakestTeks={null}
      weakestTeksTitle={null}
      recentLesson={null}
      dueAssignment={dueAssignment}
      xp={0}
      streakDays={0}
      weeklyStreak={[false, false, false, false, false, false, false]}
      masteryPercent={0}
    />
  );
}
