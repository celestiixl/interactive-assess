"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LearningLesson, LearningUnit } from "@/lib/learningHubContent";
import type { LearningLevel } from "@/lib/curriculumPolicy";
import {
  addLessonTime,
  getLessonProgress,
  updateLessonProgress,
} from "@/lib/learningProgress";

const HOOK_DISMISSED_PREFIX = "biospark.lesson.hook.dismissed.";

function getHookDismissed(lessonId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`${HOOK_DISMISSED_PREFIX}${lessonId}`) === "1";
}

function setHookDismissed(lessonId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${HOOK_DISMISSED_PREFIX}${lessonId}`, "1");
}

type LessonExperienceProps = {
  unit: LearningUnit;
  lesson: LearningLesson;
  previousLesson: LearningLesson | null;
  nextLesson: LearningLesson | null;
};

type CheckQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  teks: string;
  learningLevel: LearningLevel;
  conceptId: string;
  misconceptionTarget?: boolean;
  misconception?: string;
};

function buildQuestions(
  unit: LearningUnit,
  lesson: LearningLesson,
): CheckQuestion[] {
  const keyTerms = lesson.keyTerms.length ? lesson.keyTerms : ["concept"];
  const firstTerm = keyTerms[0] ?? "concept";
  const secondTerm = keyTerms[1] ?? "evidence";
  const teks = unit.teks[0] ?? "B.5A";
  const conceptId = `${unit.id}-${lesson.slug}`;
  const misconception = unit.misconceptions[0] ?? "Common misconception";

  return [
    {
      id: "q1",
      prompt: "Which term is a key focus of this lesson?",
      choices: [firstTerm, secondTerm, "None of these", "Random guess"],
      correctIndex: 0,
      teks,
      learningLevel: "developing",
      conceptId,
      misconceptionTarget: true,
      misconception,
    },
    {
      id: "q2",
      prompt: "What is this lesson format?",
      choices: ["Reading", "Lecture", "Notes", "Assessment"],
      correctIndex:
        lesson.type === "Reading" ? 0 : lesson.type === "Lecture" ? 1 : 2,
      teks,
      learningLevel: "progressing",
      conceptId,
    },
    {
      id: "q3",
      prompt: "How should you unlock the next lesson?",
      choices: [
        "Finish reading and score at least 70%",
        "Only click Next",
        "Skip all sections",
        "Close the page",
      ],
      correctIndex: 0,
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
  const questions = useMemo(() => buildQuestions(unit, lesson), [lesson, unit]);
  const [language, setLanguage] = useState<"en" | "es">("en");
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [hookDismissed, setHookDismissedState] = useState(false);
  const [sectionChecks, setSectionChecks] = useState<Record<string, boolean>>(
    {},
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const saved = getLessonProgress(lesson.id);
    const baseline: Record<string, boolean> = {};
    lesson.sections.forEach((section) => {
      baseline[section.heading] = Boolean(saved?.percent === 100);
    });
    setSectionChecks(baseline);
    if (typeof saved?.checkScore === "number") {
      setScore(saved.checkScore);
      setSubmitted(true);
    }
    setHookDismissedState(getHookDismissed(lesson.id));

    const start = Date.now();
    return () => {
      const spent = Math.round((Date.now() - start) / 1000);
      addLessonTime(lesson.id, spent);
    };
  }, [lesson.id]);

  const readingProgress = useMemo(() => {
    const total = lesson.sections.length;
    if (!total) return 100;
    const done = lesson.sections.filter(
      (section) => sectionChecks[section.heading],
    ).length;
    return Math.round((done / total) * 100);
  }, [lesson.sections, sectionChecks]);

  useEffect(() => {
    updateLessonProgress(lesson.id, {
      percent: readingProgress,
      completed: readingProgress === 100 && (score ?? 0) >= 70,
    });
  }, [lesson.id, readingProgress, score]);

  function toggleReadAloud() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }

    const body = lesson.sections
      .map((section) => `${section.heading}. ${section.body.join(" ")}`)
      .join(" ");
    const utterance = new SpeechSynthesisUtterance(
      `${lesson.title}. ${lesson.summary}. ${body}`,
    );
    utterance.lang = language === "es" ? "es-US" : "en-US";
    window.speechSynthesis.speak(utterance);
  }

  function handleSubmitCheck() {
    const correctCount = questions.reduce((acc, question) => {
      return acc + (answers[question.id] === question.correctIndex ? 1 : 0);
    }, 0);
    const pct = Math.round((correctCount / questions.length) * 100);
    const prev = getLessonProgress(lesson.id);
    const attempts = (prev?.checkAttempts ?? 0) + 1;

    updateLessonProgress(lesson.id, {
      checkScore: pct,
      checkAttempts: attempts,
      completed: readingProgress === 100 && pct >= 70,
      percent: readingProgress,
    });

    setScore(pct);
    setSubmitted(true);
  }

  function markComplete() {
    updateLessonProgress(lesson.id, {
      completed: readingProgress === 100 && (score ?? 0) >= 70,
      percent: readingProgress,
    });
  }

  function dismissHook() {
    setHookDismissedState(true);
    setHookDismissed(lesson.id);
  }

  return (
    <main className="ia-vh-page relative min-h-dvh px-3 py-3 text-slate-900 sm:px-4 sm:py-4">
      <div className="mx-auto grid w-full max-w-4xl gap-3">
        {lesson.hook && !hookDismissed ? (
          <aside className="relative rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-800 dark:bg-amber-950">
            <div className="absolute left-0 top-0 h-full w-1 rounded-l-3xl bg-amber-400 dark:bg-amber-500" />
            <div className="flex items-start justify-between gap-3 pl-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Why this matters
                </div>
                <h2 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                  {lesson.hook.headline}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {lesson.hook.body}
                </p>
                {lesson.hook.source ? (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    — {lesson.hook.source}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={dismissHook}
                aria-label="Dismiss this context card"
                className="mt-0.5 shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900"
              >
                Dismiss
              </button>
            </div>
          </aside>
        ) : null}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Grading Period {unit.gradingPeriod} • Unit {unit.unitNumber}
              </div>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {lesson.title}
              </h1>
              <div className="mt-2 text-sm text-slate-600">
                {lesson.type} • {lesson.minutes} min
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleReadAloud}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-5">
            {lesson.sections.map((section) => (
              <article
                key={section.heading}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {section.heading}
                  </h2>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(sectionChecks[section.heading])}
                      onChange={(event) =>
                        setSectionChecks((prev) => ({
                          ...prev,
                          [section.heading]: event.target.checked,
                        }))
                      }
                    />
                    Mark read
                  </label>
                </div>
                <div className="mt-2 space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
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
              </article>
            ))}
          </div>
        </section>

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
                <div className="text-sm font-semibold text-slate-900">
                  {index + 1}. {question.prompt}
                </div>
                <div className="mt-2 space-y-2">
                  {question.choices.map((choice, optionIndex) => (
                    <label
                      key={choice}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="radio"
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
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSubmitCheck}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Submit Check
            </button>
            <button
              type="button"
              onClick={markComplete}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Mark Lesson Complete
            </button>
            {submitted && score !== null ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                Score: {score}%
              </div>
            ) : null}
          </div>

          {submitted && score !== null && lesson.hook ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
              <div className="border-l-2 border-amber-400 pl-3 dark:border-amber-500">
                <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Remember why this mattered
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {lesson.hook.headline} — {lesson.hook.body}
                </p>
                {lesson.hook.source ? (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    — {lesson.hook.source}
                  </p>
                ) : null}
              </div>
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
