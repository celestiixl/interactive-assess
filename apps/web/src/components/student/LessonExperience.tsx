"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import Link from "next/link";
import type {
  ExplanationSection,
  LearningLesson,
  LearningUnit,
  LessonSection,
  QuickCheck,
} from "@/lib/learningHubContent";
import {
  interventionStrategyForTier,
  interventionTierFromCheck,
  type LearningLevel,
} from "@/lib/curriculumPolicy";
import {
  addLessonTime,
  getLessonProgress,
  updateLessonProgress,
} from "@/lib/learningProgress";
import PhenomenonBanner from "@/components/student/PhenomenonBanner";
import { getPhenomenonForLesson } from "@/lib/texasPhenomena";
import LessonNotebook from "@/components/student/LessonNotebook";
import { loadStudentProfile } from "@/lib/studentProfile";
import { speakText, stopSpeaking } from "@/lib/accommodations";
import { useAccommodations } from "@/lib/useAccommodations";

const HOOK_DISMISSED_KEY = "biospark.hook.dismissed.v1";

/** Returns a stable string key for any LessonSection variant. */
function getSectionKey(section: LessonSection, index: number): string {
  if (section.type === "misconception-spotlight")
    return `misconception-${index}-${section.misconception.slice(0, 20)}`;
  if (section.type === "vocabulary-spotlight") return `vocab-spotlight-${index}`;
  if (section.type === "activity") return `activity-${index}-${section.heading}`;
  if ("heading" in section && section.heading) return section.heading;
  return `section-${index}`;
}

/** Returns readable plain text from any LessonSection for TTS / read-aloud. */
function getSectionText(section: LessonSection): string {
  if (!section.type || section.type === "explanation") {
    const s = section as ExplanationSection;
    return `${s.heading}. ${s.body.join(" ")}`;
  }
  if (section.type === "worked-example") {
    return `${section.heading}. ${section.scenario} ${section.steps.join(" ")} ${section.conclusion ?? ""}`;
  }
  if (section.type === "misconception-spotlight") {
    return `Common misconception: ${section.misconception}. Correction: ${section.correction}`;
  }
  if (section.type === "visual-diagram") {
    return `${section.heading}. ${section.description} ${section.elements.map((e) => `${e.label}: ${e.detail}`).join(". ")}`;
  }
  if (section.type === "vocabulary-spotlight") {
    return section.terms.map((t) => `${t.term}: ${t.definition}`).join(". ");
  }
  if (section.type === "activity") {
    return `${section.heading}. ${section.prompt}`;
  }
  return "";
}

type LessonExperienceProps = {
  unit: LearningUnit;
  lesson: LearningLesson;
  previousLesson: LearningLesson | null;
  nextLesson: LearningLesson | null;
};

type CheckQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  teks: string;
  learningLevel: LearningLevel;
  conceptId: string;
  misconceptionTarget?: boolean;
  misconceptionDescription?: string;
};

function buildQuestions(
  unit: LearningUnit,
  lesson: LearningLesson,
): CheckQuestion[] {
  if (Array.isArray(lesson.quickChecks) && lesson.quickChecks.length) {
    return lesson.quickChecks.map((row: QuickCheck) => ({ ...row }));
  }

  const keyTerms = lesson.keyTerms.length ? lesson.keyTerms : ["concept"];
  const firstTerm = keyTerms[0] ?? "concept";
  const secondTerm = keyTerms[1] ?? "evidence";
  const teks = unit.teks[0] ?? "B.5A";
  const conceptId = `${unit.id}-${lesson.slug}`;
  const misconceptionDescription =
    unit.misconceptions[0] ?? "Common misconception";

  return [
    {
      id: "q1",
      question: "Which term is a key focus of this lesson?",
      options: [firstTerm, secondTerm, "None of these", "Random guess"],
      correctAnswer: firstTerm,
      teks,
      learningLevel: "developing",
      conceptId,
      misconceptionTarget: true,
      misconceptionDescription,
    },
    {
      id: "q2",
      question: "What is this lesson format?",
      options: ["Reading", "Lecture", "Notes", "Assessment"],
      correctAnswer: lesson.type,
      teks,
      learningLevel: "progressing",
      conceptId,
    },
    {
      id: "q3",
      question: "How should you unlock the next lesson?",
      options: [
        "Finish reading and score at least 70%",
        "Only click Next",
        "Skip all sections",
        "Close the page",
      ],
      correctAnswer: "Finish reading and score at least 70%",
      teks,
      learningLevel: "proficient",
      conceptId,
    },
  ];
}

export default function LessonExperience({
  unit,
  lesson,
  previousLesson,
  nextLesson,
}: LessonExperienceProps) {
  const { acc } = useAccommodations();
  const {
    completedSections,
    lastSectionId,
    markSectionComplete,
    markLessonComplete: markLessonProgressComplete,
  } = useLessonProgress(lesson.slug);
  // Ref map: section heading → article DOM element (for scroll-restore).
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const questions = useMemo(() => buildQuestions(unit, lesson), [lesson, unit]);
  const [language, setLanguage] = useState<"en" | "es">("en");
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [hookDismissed, setHookDismissed] = useState(false);
  const [sectionChecks, setSectionChecks] = useState<Record<string, boolean>>(
    {},
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  // Lazy-initialize student ID from profile (read-once on mount).
  // StudentProfile has no stable `id` field — `name` is the best available
  // per-device identifier for this local-first v1 prototype.
  const [studentId] = useState<string>(() => {
    try {
      const profile = loadStudentProfile();
      return profile.name || "anonymous";
    } catch {
      return "anonymous";
    }
  });
  const [questionResults, setQuestionResults] = useState<
    Record<string, { correct: boolean }>
  >({});
  const [interventionTier, setInterventionTier] = useState<2 | 3 | null>(null);

  useEffect(() => {
    const saved = getLessonProgress(lesson.id);
    const baseline: Record<string, boolean> = {};
    lesson.sections.forEach((section, idx) => {
      const key = getSectionKey(section, idx);
      baseline[key] = Boolean(saved?.percent === 100);
    });
    setSectionChecks(baseline);
    if (typeof saved?.checkScore === "number") {
      setScore(saved.checkScore);
      setSubmitted(true);
    }

    const start = Date.now();
    return () => {
      const spent = Math.round((Date.now() - start) / 1000);
      addLessonTime(lesson.id, spent);
    };
  }, [lesson.id]);

  // Scroll back to where the student left off once the hook has hydrated
  // and the DOM is fully rendered. requestAnimationFrame ensures refs are
  // populated before we attempt to scroll.
  useEffect(() => {
    if (!lastSectionId) return;
    const rafId = requestAnimationFrame(() => {
      const el = sectionRefs.current[lastSectionId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [lastSectionId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HOOK_DISMISSED_KEY);
      const dismissed: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      setHookDismissed(dismissed.includes(lesson.id));
    } catch {
      setHookDismissed(false);
    }
  }, [lesson.id]);

  function dismissHook() {
    setHookDismissed(true);
    try {
      const raw = localStorage.getItem(HOOK_DISMISSED_KEY);
      const dismissed: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      if (!dismissed.includes(lesson.id)) {
        localStorage.setItem(
          HOOK_DISMISSED_KEY,
          JSON.stringify([...dismissed, lesson.id]),
        );
      }
    } catch {
      // ignore storage errors
    }
  }

  // Merge the persisted completedSections (from useLessonProgress) with any
  // local-session sectionChecks overrides so restored state is reflected
  // reactively without needing a setState-in-effect.
  // When the user explicitly sets a section (including unchecking), that takes
  // precedence over the persisted value; otherwise fall back to completedSections.
  const effectiveSectionChecks = useMemo(() => {
    const merged: Record<string, boolean> = {};
    lesson.sections.forEach((section, idx) => {
      const key = getSectionKey(section, idx);
      merged[key] =
        key in sectionChecks
          ? Boolean(sectionChecks[key])
          : completedSections.includes(key);
    });
    return merged;
  }, [lesson.sections, sectionChecks, completedSections]);

  const readingProgress = useMemo(() => {
    const total = lesson.sections.length;
    if (!total) return 100;
    const done = lesson.sections.filter(
      (section, idx) => effectiveSectionChecks[getSectionKey(section, idx)],
    ).length;
    return Math.round((done / total) * 100);
  }, [lesson.sections, effectiveSectionChecks]);

  useEffect(() => {
    updateLessonProgress(lesson.id, {
      percent: readingProgress,
      completed: readingProgress === 100 && (score ?? 0) >= 70,
    });
  }, [lesson.id, readingProgress, score]);

  function toggleReadAloud() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (window.speechSynthesis.speaking) {
      stopSpeaking();
      return;
    }

    const body = lesson.sections
      .map((section) => getSectionText(section))
      .join(" ");
    void speakText({
      text: `${lesson.title}. ${lesson.summary}. ${body}`,
      language,
      voicePreference: acc.ttsVoice,
      speedPreference: acc.ttsSpeed,
    });
  }

  async function handleSubmitCheck() {
    const results: Record<string, { correct: boolean }> = {};
    let correctCount = 0;

    for (const question of questions) {
      const selectedIndex = answers[question.id];
      const selectedOption =
        typeof selectedIndex === "number"
          ? question.options[selectedIndex]
          : "";

      let correct = false;
      try {
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item: {
              kind: "quick_check",
              id: question.id,
              teks: question.teks,
              correctAnswer: question.correctAnswer,
            },
            response: {
              selectedOption,
            },
          }),
        });
        const data = await res.json();
        correct = Boolean(data?.correct);
      } catch {
        // Client fallback if check endpoint is temporarily unavailable.
        correct = selectedOption === question.correctAnswer;
      }

      results[question.id] = { correct };
      if (correct) correctCount += 1;
    }

    setQuestionResults(results);

    const pct = Math.round((correctCount / questions.length) * 100);
    const prev = getLessonProgress(lesson.id);
    const attempts = (prev?.checkAttempts ?? 0) + 1;
    const failedAttempts =
      (prev?.failedCheckAttempts ?? 0) + (pct < 70 ? 1 : 0);
    const tier = interventionTierFromCheck(pct, failedAttempts);

    updateLessonProgress(lesson.id, {
      checkScore: pct,
      checkAttempts: attempts,
      failedCheckAttempts: failedAttempts,
      completed: readingProgress === 100 && pct >= 70,
      percent: readingProgress,
    });

    setInterventionTier(tier);
    setScore(pct);
    setSubmitted(true);
  }

  function markComplete() {
    updateLessonProgress(lesson.id, {
      completed: readingProgress === 100 && (score ?? 0) >= 70,
      percent: readingProgress,
    });
    markLessonProgressComplete();
  }

  const phenomenon = getPhenomenonForLesson(lesson.id);

  return (
    <main className="ia-vh-page relative min-h-dvh px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <div className="mx-auto grid w-full max-w-4xl gap-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Grading Period {unit.gradingPeriod} • Unit {unit.unitNumber}
              </div>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {lesson.title}
              </h1>
              {(lesson.vocabularyTiers?.contentSpecific?.length ?? 0) > 0 && (
                <Link
                  href={`/student/learn/${unit.id}/${lesson.slug}/flashcards`}
                  className="mt-2 inline-block rounded-[6px] border border-bs-teal px-[14px] py-[6px] font-sans text-[13px] text-bs-teal hover:bg-[rgba(0,212,170,0.08)]"
                >
                  📚 Study vocabulary (
                  {lesson.vocabularyTiers?.contentSpecific?.length ?? 0} terms)
                </Link>
              )}
              <div className="mt-2 text-sm text-slate-600">
                {lesson.type} • {lesson.minutes} min
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleReadAloud}
                disabled={!acc.tts}
                title={
                  acc.tts
                    ? "Read this lesson aloud"
                    : "Enable Read aloud in Supports to use this"
                }
                className={[
                  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold",
                  acc.tts
                    ? "text-slate-700 hover:bg-slate-50"
                    : "cursor-not-allowed text-slate-400",
                ].join(" ")}
              >
                Read Aloud
              </button>
              <button
                type="button"
                onClick={() => setDyslexiaMode((value) => !value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {dyslexiaMode ? "Standard Font" : "Dyslexia Friendly"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setLanguage((prev) => (prev === "en" ? "es" : "en"))
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {language === "en" ? "ES Support" : "EN Support"}
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {lesson.summary}
          </p>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Reading Progress</span>
              <span>{readingProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {lesson.keyTerms.map((term) => (
              <span
                key={term}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {term}
              </span>
            ))}
          </div>

          {lesson.vocabularyTiers ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vocabulary: Everyday to Academic to Content Specific
              </div>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    Everyday
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {lesson.vocabularyTiers.everyday.map((word) => (
                      <span
                        key={`v-e-${word}`}
                        className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    Academic
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {lesson.vocabularyTiers.academic.map((word) => (
                      <span
                        key={`v-a-${word}`}
                        className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    Content Specific
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {lesson.vocabularyTiers.contentSpecific.map((word) => (
                      <span
                        key={`v-c-${word}`}
                        className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {phenomenon ? <PhenomenonBanner phenomenon={phenomenon} /> : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-5">
            {lesson.sections.map((section, idx) => {
              const sectionKey = getSectionKey(section, idx);
              return (
                <article
                  key={sectionKey}
                  ref={(el) => {
                    sectionRefs.current[sectionKey] = el;
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  {/* ── Explanation (default) ── */}
                  {(!section.type || section.type === "explanation") && (
                    <>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">
                          {(section as ExplanationSection).heading}
                        </h2>
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(effectiveSectionChecks[sectionKey])}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setSectionChecks((prev) => ({
                                ...prev,
                                [sectionKey]: checked,
                              }));
                              if (checked) markSectionComplete(sectionKey);
                            }}
                          />
                          Mark read
                        </label>
                      </div>
                      <div className="mt-2 space-y-3">
                        {(section as ExplanationSection).body.map((paragraph, pIdx) => (
                          <p
                            key={pIdx}
                            className={`text-sm leading-7 text-slate-700 ${dyslexiaMode ? "tracking-wide" : ""}`}
                          >
                            {paragraph}
                          </p>
                        ))}
                        {language === "es" ? (
                          <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                            Apoyo en español: resume esta sección con tus propias
                            palabras antes de continuar.
                          </p>
                        ) : null}
                      </div>
                    </>
                  )}

                  {/* ── Worked Example ── */}
                  {section.type === "worked-example" && (
                    <>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-indigo-800">
                          <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-indigo-600">
                            Worked Example
                          </span>
                          {section.heading}
                        </h2>
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(effectiveSectionChecks[sectionKey])}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setSectionChecks((prev) => ({ ...prev, [sectionKey]: checked }));
                              if (checked) markSectionComplete(sectionKey);
                            }}
                          />
                          Mark read
                        </label>
                      </div>
                      <p className={`mb-3 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-900 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                        <span className="font-semibold">Scenario: </span>
                        {section.scenario}
                      </p>
                      <ol className="list-decimal space-y-2 pl-5">
                        {section.steps.map((step, i) => (
                          <li key={i} className={`text-sm leading-7 text-slate-700 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                            {step}
                          </li>
                        ))}
                      </ol>
                      {section.conclusion ? (
                        <p className={`mt-3 rounded-lg bg-indigo-100 p-3 text-sm font-medium text-indigo-800 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                          <span className="font-bold">Conclusion: </span>
                          {section.conclusion}
                        </p>
                      ) : null}
                    </>
                  )}

                  {/* ── Misconception Spotlight ── */}
                  {section.type === "misconception-spotlight" && (
                    <>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-amber-800">
                          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                            ⚠ Misconception Spotlight
                          </span>
                        </h2>
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(effectiveSectionChecks[sectionKey])}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setSectionChecks((prev) => ({ ...prev, [sectionKey]: checked }));
                              if (checked) markSectionComplete(sectionKey);
                            }}
                          />
                          Mark read
                        </label>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className={`mb-1 text-sm font-semibold text-amber-900 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                          ✗ Common misconception: &ldquo;{section.misconception}&rdquo;
                        </p>
                        <p className={`text-sm text-slate-700 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                          <span className="font-semibold text-green-700">✓ Correction: </span>
                          {section.correction}
                        </p>
                        {section.teks ? (
                          <span className="mt-2 inline-block rounded bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                            {section.teks}
                          </span>
                        ) : null}
                      </div>
                    </>
                  )}

                  {/* ── Visual Diagram ── */}
                  {section.type === "visual-diagram" && (
                    <>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-teal-800">
                          <span className="rounded-md bg-teal-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-teal-600">
                            Visual Diagram
                          </span>
                          {section.heading}
                        </h2>
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(effectiveSectionChecks[sectionKey])}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setSectionChecks((prev) => ({ ...prev, [sectionKey]: checked }));
                              if (checked) markSectionComplete(sectionKey);
                            }}
                          />
                          Mark read
                        </label>
                      </div>
                      <p className={`mb-3 text-sm text-slate-600 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                        {section.description}
                      </p>
                      <dl className="space-y-2">
                        {section.elements.map((el) => (
                          <div key={el.label} className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2">
                            <dt className="text-xs font-bold uppercase tracking-wide text-teal-700">
                              {el.label}
                            </dt>
                            <dd className={`mt-0.5 text-sm text-slate-700 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                              {el.detail}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </>
                  )}

                  {/* ── Vocabulary Spotlight ── */}
                  {section.type === "vocabulary-spotlight" && (
                    <>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-purple-800">
                          <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-purple-600">
                            Vocabulary Spotlight
                          </span>
                        </h2>
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(effectiveSectionChecks[sectionKey])}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setSectionChecks((prev) => ({ ...prev, [sectionKey]: checked }));
                              if (checked) markSectionComplete(sectionKey);
                            }}
                          />
                          Mark read
                        </label>
                      </div>
                      <dl className="space-y-3">
                        {section.terms.map((term) => (
                          <div key={term.term} className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-2">
                            <dt className="text-sm font-bold text-purple-900">{term.term}</dt>
                            <dd className={`mt-0.5 text-sm text-slate-700 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                              {term.definition}
                            </dd>
                            {term.example ? (
                              <p className={`mt-1 rounded bg-white/70 px-2 py-1 text-xs italic text-slate-500 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                                Example: {term.example}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </dl>
                    </>
                  )}

                  {/* ── Activity ── */}
                  {section.type === "activity" && (
                    <>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-green-800">
                          <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-green-600">
                            Activity
                          </span>
                          {section.heading}
                        </h2>
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(effectiveSectionChecks[sectionKey])}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              setSectionChecks((prev) => ({ ...prev, [sectionKey]: checked }));
                              if (checked) markSectionComplete(sectionKey);
                            }}
                          />
                          Mark read
                        </label>
                      </div>
                      <p className={`mb-3 text-sm leading-7 text-slate-700 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                        {section.prompt}
                      </p>
                      {section.sentenceFrames && section.sentenceFrames.length > 0 ? (
                        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-700">
                            Sentence Frames
                          </p>
                          <ul className="space-y-2">
                            {section.sentenceFrames.map((frame, i) => (
                              <li key={i} className={`rounded bg-white/80 px-3 py-1.5 text-sm italic text-slate-700 ${dyslexiaMode ? "tracking-wide" : ""}`}>
                                {frame}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* Lab Notebook — between lesson content and quick-checks */}
        <LessonNotebook lessonSlug={lesson.slug} studentId={studentId} />

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">
            Quick Check
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Score at least 70% to unlock the next lesson on the mastery path.
          </p>
          <div className="mt-3 space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    TEKS {question.teks}
                  </span>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    {question.learningLevel}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {index + 1}. {question.question}
                </div>
                <div className="mt-2 space-y-2">
                  {question.options.map((choice, optionIndex) => (
                    <label
                      key={choice}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="radio"
                        aria-label={`${question.id}-${choice}`}
                        name={question.id}
                        checked={answers[question.id] === optionIndex}
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: optionIndex,
                          }))
                        }
                      />
                      {choice}
                    </label>
                  ))}
                </div>
                {submitted && !questionResults[question.id]?.correct ? (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    <div className="font-semibold">Not quite.</div>
                    <div className="mt-1">
                      Correct answer:{" "}
                      <span className="font-semibold">
                        {question.correctAnswer}
                      </span>
                    </div>
                    {question.misconceptionTarget &&
                    question.misconceptionDescription ? (
                      <div className="mt-1">
                        {question.misconceptionDescription}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSubmitCheck}
              aria-label="Submit quick check"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Submit Check
            </button>
            <button
              type="button"
              onClick={markComplete}
              aria-label="Mark lesson complete"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Mark Lesson Complete
            </button>
            {submitted && score !== null ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                Score: {score}%
              </div>
            ) : null}
            {submitted && interventionTier ? (
              <div
                className={
                  interventionTier === 3
                    ? "rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800"
                    : "rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
                }
              >
                Tier {interventionTier} intervention triggered:{" "}
                {interventionStrategyForTier(interventionTier)}
              </div>
            ) : null}
          </div>

          {submitted && lesson.hook ? (
            <div className="mt-5 rounded-2xl border-y border-r border-amber-200 border-l-4 border-l-amber-400 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Remember why this mattered
              </p>
              <p className="mt-1 text-sm font-semibold text-amber-900">
                {lesson.hook.headline}
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                {lesson.hook.body}
              </p>
              {lesson.hook.source ? (
                <p className="mt-2 text-xs text-amber-600">
                  — {lesson.hook.source}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Link
                href="/student/learn"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hub
              </Link>
              <Link
                href={`/student/learn/${unit.id}`}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Unit
              </Link>
            </div>

            <div className="flex gap-2">
              {previousLesson ? (
                <Link
                  href={`/student/learn/${unit.id}/${previousLesson.slug}`}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ← Previous
                </Link>
              ) : null}
              {nextLesson ? (
                <Link
                  href={`/student/learn/${unit.id}/${nextLesson.slug}`}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Next →
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
