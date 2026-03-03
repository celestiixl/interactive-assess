/**
 * Rubric + Submission + Result data model
 *
 * Core idea: each question produces points, plus optional reasons and feedback.
 * A Rubric defines how to score a set of questions organized into sections.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Item/question types that the rubric engine understands */
export type RubricQuestionType =
  | "mcq"
  | "dragDrop"
  | "cardSort"
  | "hotspot"
  | "short"
  | "cer"
  | "inlineChoice";

// ---------------------------------------------------------------------------
// Partial-credit rules (per question type)
// ---------------------------------------------------------------------------

/** Award a fixed fraction of maxPoints when the student is partially correct */
export type PartialCreditFixed = {
  kind: "fixed";
  /** Fraction of maxPoints awarded (0–1). E.g. 0.5 = half credit */
  fraction: number;
};

/** Award points proportional to the share of correct sub-parts */
export type PartialCreditProportional = {
  kind: "proportional";
  /** Optional floor: minimum fraction to award any credit at all (0–1) */
  minCorrectFraction?: number;
};

/** No partial credit – all-or-nothing */
export type PartialCreditNone = {
  kind: "none";
};

export type PartialCreditRule =
  | PartialCreditFixed
  | PartialCreditProportional
  | PartialCreditNone;

// ---------------------------------------------------------------------------
// Penalties and bonuses
// ---------------------------------------------------------------------------

export type PenaltyBonusTrigger =
  | "late_submission" // answer submitted after deadline
  | "hint_used" // student used a hint
  | "multiple_attempts" // student used more than one attempt
  | "custom"; // caller-defined trigger

export type PenaltyBonus = {
  trigger: PenaltyBonusTrigger;
  /** Positive value = bonus, negative value = penalty */
  points: number;
  /** Human-readable label shown to the student when grading is visible */
  label?: string;
  /** For "multiple_attempts": apply once per extra attempt beyond the first */
  perOccurrence?: boolean;
};

// ---------------------------------------------------------------------------
// Gating rules
// ---------------------------------------------------------------------------

/** A gate that must be satisfied for the student to pass this question/section */
export type GatingRule =
  | {
      kind: "must_pass_question";
      /** Question id that must be answered correctly */
      questionId: string;
    }
  | {
      kind: "min_section_score";
      /** Section id that must meet the threshold */
      sectionId: string;
      /** Minimum required fraction of the section's weighted points (0–1) */
      minFraction: number;
    }
  | {
      kind: "min_total_score";
      /** Minimum required fraction of total weighted points (0–1) */
      minFraction: number;
    };

// ---------------------------------------------------------------------------
// Grading visibility
// ---------------------------------------------------------------------------

export type GradingVisibility =
  | "score_only" // student sees total score only
  | "score_and_correct" // student sees score + correct answers
  | "score_and_feedback" // student sees score + written feedback
  | "full"; // student sees score + correct answers + feedback + reasons

// ---------------------------------------------------------------------------
// Type-specific scoring configuration
// ---------------------------------------------------------------------------

/** Scoring config for MCQ (single or multiple correct) */
export type ScoringMCQ = {
  type: "mcq";
  partialCredit?: PartialCreditRule;
};

/** Scoring config for drag-drop / card-sort: points per correctly placed card */
export type ScoringDragDrop = {
  type: "dragDrop" | "cardSort";
  /** Points awarded per correctly placed card/item (default: maxPoints / total cards) */
  pointsPerCard?: number;
  partialCredit?: PartialCreditRule;
};

/** Scoring config for hotspot */
export type ScoringHotspot = {
  type: "hotspot";
  partialCredit?: PartialCreditRule;
};

/** Scoring config for short-answer / CER (teacher-graded or AI-assisted) */
export type ScoringOpen = {
  type: "short" | "cer";
  /** Rubric dimensions and their point allocations (e.g. { claim: 2, evidence: 3, reasoning: 5 }) */
  dimensions?: Record<string, number>;
  /** Whether AI auto-scoring is enabled */
  autoScore?: boolean;
};

/** Scoring config for inline-choice */
export type ScoringInlineChoice = {
  type: "inlineChoice";
  partialCredit?: PartialCreditRule;
};

export type QuestionScoring =
  | ScoringMCQ
  | ScoringDragDrop
  | ScoringHotspot
  | ScoringOpen
  | ScoringInlineChoice;

// ---------------------------------------------------------------------------
// Rubric structure
// ---------------------------------------------------------------------------

export type RubricQuestion = {
  id: string;
  prompt: string;
  type: RubricQuestionType;
  /** Maximum raw points for this question */
  maxPoints: number;
  /** Optional weight applied when rolling up section/total score (default: 1) */
  weight?: number;
  /** Type-specific scoring configuration */
  scoring: QuestionScoring;
  /** Conditions that must be met; failing a gate marks the question as failed */
  gates?: GatingRule[];
  /** Per-question penalty/bonus rules (e.g. hint used) */
  adjustments?: PenaltyBonus[];
};

export type RubricSection = {
  id: string;
  title: string;
  /** Optional weight applied when rolling up total score (default: 1) */
  weight?: number;
  questions: RubricQuestion[];
  /** Section-level gate conditions */
  gates?: GatingRule[];
};

export type Rubric = {
  /** Schema version for forward-compatibility */
  version: string;
  id: string;
  title: string;
  sections: RubricSection[];
  /** Controls what the student sees after grading */
  gradingVisibility?: GradingVisibility;
  /** Global penalty/bonus rules applied to the whole submission */
  adjustments?: PenaltyBonus[];
};

// ---------------------------------------------------------------------------
// Submission (student answers)
// ---------------------------------------------------------------------------

/** A generic container for any answer payload */
export type Answer = {
  /** The raw answer payload (depends on question type) */
  value: unknown;
  /** How many attempts the student used (for multiple_attempts adjustments) */
  attempts?: number;
  /** Whether the student used a hint */
  hintUsed?: boolean;
  /** ISO timestamp; compared against deadline for late_submission adjustments */
  submittedAt?: string;
};

export type Submission = {
  id: string;
  rubricId: string;
  studentId: string;
  /** Map from questionId → student answer */
  answers: Record<string, Answer>;
  /** ISO timestamp of submission */
  submittedAt?: string;
};

// ---------------------------------------------------------------------------
// Grading result
// ---------------------------------------------------------------------------

/** Scored result for a single question */
export type QuestionResult = {
  questionId: string;
  /** Raw points earned before adjustments */
  earned: number;
  /** Maximum raw points for this question */
  max: number;
  /** Points after applying per-question adjustments (penalties/bonuses) */
  adjustedEarned: number;
  /** Weighted contribution to the section total */
  weightedEarned: number;
  /** Weighted maximum */
  weightedMax: number;
  /** Whether all gate conditions were satisfied */
  gatesPassed: boolean;
  /** Reasons (machine-generated, e.g. "2/3 cards correct") */
  reasons?: string[];
  /** Feedback shown to student (based on grading visibility) */
  feedback?: string[];
  /** Breakdown of adjustments applied */
  appliedAdjustments?: Array<{ label: string; points: number }>;
};

/** Scored result for a section */
export type SectionResult = {
  sectionId: string;
  /** Sum of adjustedEarned across questions */
  earned: number;
  /** Sum of max across questions */
  max: number;
  /** earned × section.weight */
  weightedEarned: number;
  /** max × section.weight */
  weightedMax: number;
  /** Whether all section-level gates were satisfied */
  gatesPassed: boolean;
  questionResults: QuestionResult[];
};

/** Complete grading result for one submission */
export type GradingResult = {
  submissionId: string;
  rubricId: string;
  studentId: string;
  /** Weighted total earned across all sections */
  totalEarned: number;
  /** Weighted total maximum across all sections */
  totalMax: number;
  /** totalEarned / totalMax (0–1); NaN-safe (returns 0 when totalMax = 0) */
  pct: number;
  /** Whether all rubric-level gates were passed */
  gatesPassed: boolean;
  /** Per-section results */
  sectionResults: SectionResult[];
  /** Global adjustments applied (e.g. late submission at rubric level) */
  appliedAdjustments?: Array<{ label: string; points: number }>;
  /** Grading visibility setting inherited from the rubric */
  gradingVisibility: GradingVisibility;
  /** ISO timestamp of when grading occurred */
  gradedAt: string;
};
