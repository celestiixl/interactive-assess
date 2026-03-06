import { notFound } from "next/navigation";
import StudentFloatingDock from "@/components/student/StudentFloatingDock";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { getLessonBySlug, getUnitById } from "@/lib/learningHubContent";
import LessonExperience from "@/components/student/LessonExperience";

export default function Unit3DisruptionsStubPage() {
  const unit = getUnitById("unit-3");
  if (!unit) notFound();

  const lesson = getLessonBySlug(unit, "disruptions-cell-cycle");
  if (!lesson) notFound();

  const lessonIndex = unit.lessons.findIndex((entry) => entry.id === lesson.id);
  const previousLesson = lessonIndex > 0 ? unit.lessons[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex < unit.lessons.length - 1
      ? unit.lessons[lessonIndex + 1]
      : null;

  return (
    <>
      <LessonExperience
        unit={unit}
        lesson={lesson}
        previousLesson={previousLesson}
        nextLesson={nextLesson}
      />
      <StudentFloatingDock />
      <ThemeToggle />
    </>
  );
}
