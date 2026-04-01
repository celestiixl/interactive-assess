import { notFound } from "next/navigation";
import { getLessonBySlug, getUnitById } from "@/lib/learningHubContent";
import { FlashcardDeck } from "@/components/student/FlashcardDeck";
import ThemeToggle from "@/components/ia/ThemeToggle";
import { BackLink } from "@/components/nav/BackLink";

export default function Unit7PlantSystemsB12BFlashcardsPage() {
  const unit = getUnitById("unit-7");
  if (!unit) notFound();

  const lesson = getLessonBySlug(unit, "plant-systems-integration");
  if (!lesson) notFound();

  return (
    <>
      <BackLink href="/student/learn/unit-7/plant-systems-b12b" label="Back to lesson" />
      <main className="ia-vh-page relative min-h-dvh px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-xl">
          <h1 className="mb-1 font-sans text-[24px] font-semibold text-bs-text">
            {lesson.title} - Vocabulary
          </h1>
          <p className="mb-8 font-sans text-sm text-bs-text-sub">
            Content-specific terms only
          </p>

          <FlashcardDeck lesson={lesson} />
        </div>
      </main>
      <ThemeToggle />
    </>
  );
}
