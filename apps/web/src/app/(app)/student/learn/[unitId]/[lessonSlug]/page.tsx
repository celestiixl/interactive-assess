import { notFound } from "next/navigation";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { getLessonBySlug, getUnitById } from "@/lib/learningHubContent";
import LessonExperience from "@/components/student/LessonExperience";

type LessonPageProps = {
  params: Promise<{ unitId: string; lessonSlug: string }>;
};

export default async function LearningLessonPage({ params }: LessonPageProps) {
  const { unitId, lessonSlug } = await params;
  const unit = getUnitById(unitId);
  if (!unit) notFound();

  const lesson = getLessonBySlug(unit, lessonSlug);
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
      <ThemeToggle />
    </>
  );
}
