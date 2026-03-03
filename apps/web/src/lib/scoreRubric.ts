/**
 * scoreRubric – core grading engine
 *
 * Accepts a Rubric and a Submission and returns a GradingResult.
 *
 * Scoring pipeline (two-pass)
 * ────────────────────────────
 *  Pass 1 – score every question:
 *    a. Call scoreProvider to get raw earned points (0–maxPoints).
 *    b. Apply per-question adjustments (hints, multiple attempts, …).
 *    c. Compute weighted earned / weighted max per question.
 *  Pass 2 – evaluate gates (with full context available):
 *    a. must_pass_question  → check earned == max for the referenced question.
 *    b. min_section_score   → check section earned fraction vs threshold.
 *    c. min_total_score     → check overall weighted fraction vs threshold.
 *  Then roll up section → total, apply rubric-level adjustments and build result.
 */

import type {
  Rubric,
  Submission,
  GradingResult,
  SectionResult,
  QuestionResult,
  RubricQuestion,
  GatingRule,
  PenaltyBonus,
  Answer,
  GradingVisibility,
} from "@/types/rubric";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Callback that the caller provides to supply a raw score (0 – question.maxPoints)
 * for a single question given the student's answer.
 *
 * Return `null` to indicate the question was not answered / should be skipped.
 */
export type ScoreProvider = (
  question: RubricQuestion,
  answer: Answer | undefined,
) => number | null;

export type ScoreRubricOptions = {
  /**
   * Function that scores a single question.
   * Defaults to returning 0 for every question when not supplied (useful for
   * creating a "blank" result shell).
   */
  scoreProvider?: ScoreProvider;

  /**
   * ISO deadline string.  When provided, answers submitted after this timestamp
   * trigger any `late_submission` adjustment rules.
   */
  deadline?: string;
};

// ---------------------------------------------------------------------------
// Internal intermediate types used between pass 1 and pass 2
// ---------------------------------------------------------------------------

type QuestionIntermediate = {
  question: RubricQuestion;
  earned: number;
  adjustedEarned: number;
  weightedEarned: number;
  weightedMax: number;
  appliedAdjustments: Array<{ label: string; points: number }>;
};

type SectionIntermediate = {
  sectionId: string;
  earned: number;
  max: number;
  weightedEarned: number;
  weightedMax: number;
  questions: QuestionIntermediate[];
};

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Grade a submission against a rubric.
 */
export function scoreRubric(
  rubric: Rubric,
  submission: Submission,
  options: ScoreRubricOptions = {},
): GradingResult {
  const { scoreProvider = () => 0, deadline } = options;
  const visibility: GradingVisibility =
    rubric.gradingVisibility ?? "score_only";

  // ── Pass 1: score every question ─────────────────────────────────────────
  const sectionIntermediates: SectionIntermediate[] = rubric.sections.map(
    (section) => {
      const questions: QuestionIntermediate[] = section.questions.map((q) => {
        const answer = submission.answers[q.id];
        const raw = scoreProvider(q, answer) ?? 0;
        const earned = clamp(raw, 0, q.maxPoints);

        const { delta, applied } = applyAdjustments(
          q.adjustments ?? [],
          answer,
          deadline,
        );
        const adjustedEarned = clamp(earned + delta, 0, q.maxPoints);

        const weight = q.weight ?? 1;
        return {
          question: q,
          earned,
          adjustedEarned,
          weightedEarned: adjustedEarned * weight,
          weightedMax: q.maxPoints * weight,
          appliedAdjustments: applied,
        };
      });

      const sectionEarned = questions.reduce(
        (sum, r) => sum + r.adjustedEarned,
        0,
      );
      const sectionMax = section.questions.reduce(
        (sum, q) => sum + q.maxPoints,
        0,
      );
      const sectionWeight = section.weight ?? 1;

      return {
        sectionId: section.id,
        earned: sectionEarned,
        max: sectionMax,
        weightedEarned: sectionEarned * sectionWeight,
        weightedMax: sectionMax * sectionWeight,
        questions,
      };
    },
  );

  // ── Rubric-level adjustments & weighted total ─────────────────────────────
  const { delta: rubricDelta, applied: rubricApplied } = applyAdjustments(
    rubric.adjustments ?? [],
    {
      value: null,
      submittedAt: submission.submittedAt,
      attempts: undefined,
      hintUsed: undefined,
    },
    deadline,
  );

  const rawTotalWeightedEarned = sectionIntermediates.reduce(
    (sum, s) => sum + s.weightedEarned,
    0,
  );
  const totalMax = sectionIntermediates.reduce(
    (sum, s) => sum + s.weightedMax,
    0,
  );
  const totalEarned = clamp(
    rawTotalWeightedEarned + rubricDelta,
    0,
    totalMax,
  );
  const pct = totalMax > 0 ? totalEarned / totalMax : 0;

  // Build a lookup map for gate evaluation (questionId → adjustedEarned)
  const questionEarnedMap = new Map<string, { earned: number; max: number }>();
  for (const sec of sectionIntermediates) {
    for (const q of sec.questions) {
      questionEarnedMap.set(q.question.id, {
        earned: q.adjustedEarned,
        max: q.question.maxPoints,
      });
    }
  }

  // Build a lookup map for section scores
  const sectionEarnedMap = new Map<string, { earned: number; max: number }>();
  for (const sec of sectionIntermediates) {
    sectionEarnedMap.set(sec.sectionId, {
      earned: sec.earned,
      max: sec.max,
    });
  }

  // ── Pass 2: evaluate gates with full context ──────────────────────────────
  const ctx: GateContext = { questionEarnedMap, sectionEarnedMap, pct };

  const sectionResults: SectionResult[] = rubric.sections.map(
    (section, si) => {
      const intermediate = sectionIntermediates[si];

      const questionResults: QuestionResult[] = section.questions.map(
        (q, qi) => {
          const qIntermediate = intermediate.questions[qi];
          const gatesPassed = evaluateGates(q.gates ?? [], ctx);

          const result: QuestionResult = {
            questionId: q.id,
            earned: qIntermediate.earned,
            max: q.maxPoints,
            adjustedEarned: qIntermediate.adjustedEarned,
            weightedEarned: qIntermediate.weightedEarned,
            weightedMax: qIntermediate.weightedMax,
            gatesPassed,
            appliedAdjustments:
              qIntermediate.appliedAdjustments.length > 0
                ? qIntermediate.appliedAdjustments
                : undefined,
          };
          return result;
        },
      );

      const sectionGatesPassed = evaluateGates(section.gates ?? [], ctx);

      return {
        sectionId: section.id,
        earned: intermediate.earned,
        max: intermediate.max,
        weightedEarned: intermediate.weightedEarned,
        weightedMax: intermediate.weightedMax,
        gatesPassed: sectionGatesPassed,
        questionResults,
      } satisfies SectionResult;
    },
  );

  const allSectionsPassed = sectionResults.every((s) => s.gatesPassed);
  const allQuestionsPassed = sectionResults
    .flatMap((s) => s.questionResults)
    .every((q) => q.gatesPassed);
  const gatesPassed = allSectionsPassed && allQuestionsPassed;

  return {
    submissionId: submission.id,
    rubricId: rubric.id,
    studentId: submission.studentId,
    totalEarned,
    totalMax,
    pct,
    gatesPassed,
    sectionResults,
    appliedAdjustments: rubricApplied.length > 0 ? rubricApplied : undefined,
    gradingVisibility: visibility,
    gradedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

type AdjustmentResult = {
  delta: number;
  applied: Array<{ label: string; points: number }>;
};

/**
 * Evaluate penalty/bonus rules against the answer metadata.
 */
function applyAdjustments(
  rules: PenaltyBonus[],
  answer: Answer | undefined,
  deadline: string | undefined,
): AdjustmentResult {
  let delta = 0;
  const applied: Array<{ label: string; points: number }> = [];

  for (const rule of rules) {
    let occurrences = 0;

    switch (rule.trigger) {
      case "hint_used":
        if (answer?.hintUsed) occurrences = 1;
        break;
      case "late_submission":
        if (
          deadline &&
          answer?.submittedAt &&
          new Date(answer.submittedAt) > new Date(deadline)
        ) {
          occurrences = 1;
        }
        break;
      case "multiple_attempts": {
        const extra = Math.max((answer?.attempts ?? 1) - 1, 0);
        occurrences = rule.perOccurrence ? extra : extra > 0 ? 1 : 0;
        break;
      }
      case "custom":
        // Custom triggers must be handled by the caller via the ScoreProvider.
        break;
    }

    if (occurrences > 0) {
      const pts = rule.points * occurrences;
      delta += pts;
      applied.push({ label: rule.label ?? rule.trigger, points: pts });
    }
  }

  return { delta, applied };
}

type GateContext = {
  /** adjustedEarned and max per question id */
  questionEarnedMap: Map<string, { earned: number; max: number }>;
  /** aggregated earned and max per section id */
  sectionEarnedMap: Map<string, { earned: number; max: number }>;
  /** overall weighted fraction (0–1) */
  pct: number;
};

/**
 * Evaluate a list of gating rules against pre-computed scores.
 * Returns true only when ALL gates pass.
 */
function evaluateGates(gates: GatingRule[], ctx: GateContext): boolean {
  for (const gate of gates) {
    switch (gate.kind) {
      case "must_pass_question": {
        const q = ctx.questionEarnedMap.get(gate.questionId);
        // Gate passes only when the question was found and earned all available points.
        if (!q || q.earned < q.max) return false;
        break;
      }
      case "min_section_score": {
        const sec = ctx.sectionEarnedMap.get(gate.sectionId);
        if (!sec) return false; // referenced section not found → fail safe
        const frac = sec.max > 0 ? sec.earned / sec.max : 0;
        if (frac < gate.minFraction) return false;
        break;
      }
      case "min_total_score": {
        if (ctx.pct < gate.minFraction) return false;
        break;
      }
    }
  }
  return true;
}
