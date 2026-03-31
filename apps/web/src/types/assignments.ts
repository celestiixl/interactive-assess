/**
 * Assignment system data model
 *
 * Defines the goal, mode, differentiation, and question types used when
 * building or consuming assignments in BioSpark.
 */

import type { LearningLevel } from "../lib/curriculumPolicy";

// ---------------------------------------------------------------------------
// Goal and mode
// ---------------------------------------------------------------------------

/** The instructional purpose of an assignment */
export type AssignmentGoal = "practice" | "reteach" | "review";

/** Whether the assignment was pulled from the pre-made bank or built by the teacher */
export type AssignmentMode = "pre-made" | "custom";

// ---------------------------------------------------------------------------
// Differentiation
// ---------------------------------------------------------------------------

/** Whether a single shared question set is used or separate per-track sets */
export type DifferentiationMode = "single" | "tiered";

/** The three proficiency-aligned tracks generated when mode is "tiered" */
export type DifferentiationTrack = "support" | "on-level" | "extension";

/**
 * Maps each differentiation track to the learning levels it serves.
 *   support   → developing + progressing
 *   on-level  → progressing + proficient
 *   extension → proficient  + advanced
 */
export const TRACK_LEARNING_LEVELS: Record<
  DifferentiationTrack,
  LearningLevel[]
> = {
  support: ["developing", "progressing"],
  "on-level": ["progressing", "proficient"],
  extension: ["proficient", "advanced"],
};

// ---------------------------------------------------------------------------
// Base question (shared fields for every question type)
// ---------------------------------------------------------------------------

export type BaseQuestion = {
  id: string;
  /** TEKS codes in canonical "B.5A" format */
  teks: string[];
  learningLevel: LearningLevel;
  misconceptionTarget: boolean;
  points: number;
};

// ---------------------------------------------------------------------------
// Question variants (discriminated union on the "type" field)
// ---------------------------------------------------------------------------

export type MultipleChoiceQuestion = BaseQuestion & {
  type: "multiple-choice";
  stem: string;
  choices: {
    id: string;
    text: string;
    isCorrect: boolean;
    /** Explains why this distractor is wrong — shown after submission */
    distractorExplanation?: string;
  }[];
};

export type MultipleSelectionQuestion = BaseQuestion & {
  type: "multiple-selection";
  stem: string;
  choices: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  minSelections: number;
  maxSelections: number;
};

export type DropdownQuestion = BaseQuestion & {
  type: "dropdown";
  /**
   * Sentence displayed to the student. Each occurrence of the literal token
   * "[blank]" marks one inline dropdown position and must correspond, in
   * document order, to an entry in the `dropdowns` array.
   * Example: "Glucose is produced during [blank] and consumed during [blank]."
   */
  sentenceTemplate: string;
  dropdowns: {
    id: string;
    options: string[];
    correctOption: string;
  }[];
};

export type ShortResponseQuestion = BaseQuestion & {
  type: "short-response";
  prompt: string;
  modelAnswer: string;
  rubric: { score: number; descriptor: string }[];
};

/** DragDrop variant where items must be placed in the correct order */
export type SequencingDragDropQuestion = BaseQuestion & {
  type: "drag-drop";
  mode: "sequencing";
  stem: string;
  items: { id: string; label: string }[];
  /** Ordered list of item ids representing the correct sequence */
  correctOrder: string[];
};

/** DragDrop variant where each item must be matched to another item or zone */
export type MatchingDragDropQuestion = BaseQuestion & {
  type: "drag-drop";
  mode: "matching";
  stem: string;
  items: { id: string; label: string }[];
  /** Maps each item id to the id of its correct match */
  correctMatches: Record<string, string>;
};

/** Union of both drag-drop question modes, discriminated by the `mode` field */
export type DragDropQuestion = SequencingDragDropQuestion | MatchingDragDropQuestion;

// ---------------------------------------------------------------------------
// Question union
// ---------------------------------------------------------------------------

export type Question =
  | MultipleChoiceQuestion
  | MultipleSelectionQuestion
  | DropdownQuestion
  | ShortResponseQuestion
  | DragDropQuestion;
