import { notFound } from "next/navigation";
import { getLessonBySlug, getUnitById } from "@/lib/learningHubContent";
import { FlashcardDeck } from "@/components/student/FlashcardDeck";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { BackLink } from "@/components/nav/BackLink";

type FlashcardsPageProps = {
  params: Promise<{ unitId: string; lessonSlug: string }>;
};

export default async function FlashcardsPage({ params }: FlashcardsPageProps) {
  const { unitId, lessonSlug } = await params;

  const unit = getUnitById(unitId);
  if (!unit) notFound();

  const lesson = getLessonBySlug(unit, lessonSlug);
  if (!lesson) notFound();

  return (
    <>
      <BackLink href={`/student/learn/${unitId}/${lessonSlug}`} label="Back to lesson" />
      <main className="ia-vh-page relative min-h-dvh px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-xl">
          {/* Header */}
          <h1 className="mb-1 font-sans text-[24px] font-semibold text-bs-text">
            {lesson.title} — Vocabulary
          </h1>
          <p className="mb-8 font-sans text-sm text-bs-text-sub">
            Content-specific terms only
          </p>

          {/* Flashcard deck */}
          <FlashcardDeck lesson={lesson} />
        </div>
      </main>
      <ThemeToggle />
    </>
  );
}
