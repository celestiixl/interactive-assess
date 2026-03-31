/**
 * punnetScoring – pure scoring functions for Punnett-square cross questions.
 *
 * Covers both monohybrid (2×2) and dihybrid (4×4) crosses.
 * No UI, no API calls, no localStorage — all functions are deterministic
 * and safe to run in any environment (browser, Node, edge).
 *
 * Genotype notation convention:
 *   • A single gene is represented with two characters, e.g. "Bb", "BB", "bb".
 *   • Within a gene pair, the uppercase allele (dominant) always comes first:
 *     "Bb" is canonical; "bB" is not.
 *   • A dihybrid genotype concatenates two gene pairs: "AaBb", "AABB", etc.
 *     Gene 1 occupies positions [0–1], gene 2 occupies positions [2–3].
 */

import type { BaseQuestion } from "@/types/assignments";

// ---------------------------------------------------------------------------
// Follow-up question type
// ---------------------------------------------------------------------------

/**
 * A follow-up question attached to a cross question (e.g. "What is the
 * expected phenotype ratio?").  Answers are compared as trimmed,
 * case-insensitive strings.
 */
export type FollowUpQuestion = {
  id: string;
  prompt: string;
  /** Expected answer string. Matching is trim + case-insensitive. */
  correctAnswer: string;
  /** Points allocated to this follow-up item. */
  points: number;
};

// ---------------------------------------------------------------------------
// Question types
// ---------------------------------------------------------------------------

/**
 * A monohybrid Punnett-square question where the student must fill in a 2×2
 * grid of offspring genotypes and optionally answer follow-up questions.
 *
 * Extends {@link BaseQuestion} with `type: "monohybrid-cross"`.
 */
export type MonohybridCrossQuestion = BaseQuestion & {
  type: "monohybrid-cross";
  /** Genotype of parent 1 in standard notation, e.g. `"Bb"`. */
  parent1Genotype: string;
  /** Genotype of parent 2 in standard notation, e.g. `"Bb"`. */
  parent2Genotype: string;
  /** Human-readable name of the trait, e.g. `"height"`. */
  traitName: string;
  /** Description of the dominant phenotype, e.g. `"tall"`. */
  dominantPhenotype: string;
  /** Description of the recessive phenotype, e.g. `"short"`. */
  recessivePhenotype: string;
  /**
   * Optional follow-up questions (phenotype ratio, genotype ratio, etc.).
   * Each has its own point value, independent of {@link BaseQuestion.points}
   * which covers the grid.
   */
  followUpQuestions: FollowUpQuestion[];
};

/**
 * A dihybrid Punnett-square question where the student must fill in a 4×4
 * grid of offspring genotypes and optionally answer follow-up questions.
 *
 * Extends {@link BaseQuestion} with `type: "dihybrid-cross"`.
 */
export type DihybridCrossQuestion = BaseQuestion & {
  type: "dihybrid-cross";
  /** Genotype of parent 1 in standard notation, e.g. `"AaBb"`. */
  parent1Genotype: string;
  /** Genotype of parent 2 in standard notation, e.g. `"AaBb"`. */
  parent2Genotype: string;
  /** Human-readable name of trait 1, e.g. `"seed shape"`. */
  trait1Name: string;
  /** Description of the dominant phenotype for trait 1, e.g. `"round"`. */
  trait1DominantPhenotype: string;
  /** Description of the recessive phenotype for trait 1, e.g. `"wrinkled"`. */
  trait1RecessivePhenotype: string;
  /** Human-readable name of trait 2, e.g. `"seed color"`. */
  trait2Name: string;
  /** Description of the dominant phenotype for trait 2, e.g. `"yellow"`. */
  trait2DominantPhenotype: string;
  /** Description of the recessive phenotype for trait 2, e.g. `"green"`. */
  trait2RecessivePhenotype: string;
  /**
   * Optional follow-up questions. Each has its own point value, independent
   * of {@link BaseQuestion.points} which covers the grid.
   */
  followUpQuestions: FollowUpQuestion[];
};

// ---------------------------------------------------------------------------
// Scoring result type
// ---------------------------------------------------------------------------

/**
 * Detailed scoring result for a Punnett-square response.
 *
 * Points for the grid come from the question's `BaseQuestion.points` field
 * allocated proportionally per cell.  Follow-up points come from each
 * `FollowUpQuestion.points`.
 */
export type PunnettScoringResult = {
  /** Total points earned (grid + all follow-ups). */
  earned: number;
  /** Total maximum points available (grid + all follow-ups). */
  max: number;
  /** Grid-specific scoring details. */
  grid: {
    earned: number;
    max: number;
    /**
     * Per-cell correctness flags. `true` when the student's normalized cell
     * value exactly matches the expected canonical genotype.
     */
    cellCorrect: boolean[][];
    /** The expected grid computed from the parent genotypes. */
    correctGrid: string[][];
  };
  /** Follow-up-question scoring details. */
  followUp: {
    earned: number;
    max: number;
    /** Per-question breakdown keyed by `FollowUpQuestion.id`. */
    byQuestion: Record<string, { correct: boolean; earned: number; max: number }>;
  };
};

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a single gene pair (two alleles) to canonical form:
 * the uppercase (dominant) allele is always written first.
 *
 * Examples:
 *   normalizeGenePair("b", "B") → "Bb"
 *   normalizeGenePair("B", "b") → "Bb"
 *   normalizeGenePair("B", "B") → "BB"
 *   normalizeGenePair("b", "b") → "bb"
 */
function normalizeGenePair(a: string, b: string): string {
  const aUpper = a === a.toUpperCase();
  const bUpper = b === b.toUpperCase();
  // One dominant, one recessive → dominant first
  if (aUpper && !bUpper) return a + b;
  if (!aUpper && bUpper) return b + a;
  // Both same case (homozygous) — keep order
  return a + b;
}

/**
 * Normalize a complete genotype string to canonical form.
 *
 * For 2-character monohybrid genotypes ("Bb", "BB", "bb") the single gene
 * pair is normalized via {@link normalizeGenePair}.
 *
 * For 4-character dihybrid genotypes ("AaBb", "AABB", …) gene 1 (chars 0–1)
 * and gene 2 (chars 2–3) are each normalized independently.
 *
 * Any other length is returned unchanged (graceful degradation).
 */
function normalizeGenotype(genotype: string): string {
  const g = genotype.trim();
  if (g.length === 2) {
    return normalizeGenePair(g[0], g[1]);
  }
  if (g.length === 4) {
    return normalizeGenePair(g[0], g[1]) + normalizeGenePair(g[2], g[3]);
  }
  return g;
}

/**
 * Produce the four gametes for a dihybrid parent in standard order:
 * dominant-dominant, dominant-recessive, recessive-dominant,
 * recessive-recessive.
 *
 * @param genotype - 4-character dihybrid genotype, e.g. `"AaBb"`.
 * @returns Array of four 2-character gamete strings:
 *   `["AB", "Ab", "aB", "ab"]` for `"AaBb"`.
 */
function generateDihybridGametes(genotype: string): [string, string, string, string] {
  const [g1a, g1b, g2a, g2b] = genotype.split("") as [
    string,
    string,
    string,
    string,
  ];
  return [g1a + g2a, g1a + g2b, g1b + g2a, g1b + g2b];
}

/**
 * Combine two gametes (one from each parent) into a canonical 4-character
 * dihybrid offspring genotype.
 *
 * Each gamete contributes one allele per gene:
 *   gamete1 = "AB" (gene1=A, gene2=B)
 *   gamete2 = "aB" (gene1=a, gene2=B)
 *   → "Aa" + "BB" = "AaBB"
 *
 * @param g1 - 2-character gamete from parent 1.
 * @param g2 - 2-character gamete from parent 2.
 */
function combineGametes(g1: string, g2: string): string {
  return normalizeGenePair(g1[0], g2[0]) + normalizeGenePair(g1[1], g2[1]);
}

/**
 * Score a 2-D student grid against the expected grid.
 *
 * Each cell is normalized before comparison. Returns the number of matching
 * cells, the total number of cells, and a same-shape boolean grid.
 */
function scoreCells(
  studentGrid: string[][],
  correctGrid: string[][],
): { cellCorrect: boolean[][]; correct: number; total: number } {
  const cellCorrect: boolean[][] = [];
  let correct = 0;
  const total = correctGrid.length * (correctGrid[0]?.length ?? 0);

  for (let r = 0; r < correctGrid.length; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < (correctGrid[r]?.length ?? 0); c++) {
      const expected = normalizeGenotype(correctGrid[r][c]);
      const student = normalizeGenotype(studentGrid[r]?.[c] ?? "");
      const match = expected !== "" && student === expected;
      row.push(match);
      if (match) correct++;
    }
    cellCorrect.push(row);
  }

  return { cellCorrect, correct, total };
}

/**
 * Score follow-up question answers, returning per-question feedback and totals.
 *
 * Matching is trim + case-insensitive.
 */
function scoreFollowUps(
  followUpQuestions: FollowUpQuestion[],
  studentAnswers: Record<string, string>,
): PunnettScoringResult["followUp"] {
  const byQuestion: PunnettScoringResult["followUp"]["byQuestion"] = {};
  let earned = 0;
  let max = 0;

  for (const fq of followUpQuestions) {
    const expected = fq.correctAnswer.trim().toLowerCase();
    const student = (studentAnswers[fq.id] ?? "").trim().toLowerCase();
    const correct = student === expected;
    const qEarned = correct ? fq.points : 0;
    byQuestion[fq.id] = { correct, earned: qEarned, max: fq.points };
    earned += qEarned;
    max += fq.points;
  }

  return { earned, max, byQuestion };
}

// ---------------------------------------------------------------------------
// Public API — Monohybrid
// ---------------------------------------------------------------------------

/**
 * Compute the expected 2×2 Punnett square for a monohybrid cross.
 *
 * The grid is indexed `[row][column]` where row corresponds to the alleles
 * of `parent1` and column to the alleles of `parent2`.  Each cell is in
 * canonical form (uppercase dominant allele first).
 *
 * @example
 * computeMonohybridGrid("Bb", "Bb");
 * // → [["BB", "Bb"], ["Bb", "bb"]]
 *
 * computeMonohybridGrid("BB", "bb");
 * // → [["Bb", "Bb"], ["Bb", "Bb"]]
 *
 * @param parent1 - 2-character genotype of parent 1, e.g. `"Bb"`.
 * @param parent2 - 2-character genotype of parent 2, e.g. `"bb"`.
 * @returns 2×2 array of offspring genotype strings in canonical form.
 */
export function computeMonohybridGrid(
  parent1: string,
  parent2: string,
): string[][] {
  const [p1a, p1b] = parent1.split("") as [string, string];
  const [p2a, p2b] = parent2.split("") as [string, string];
  return [
    [normalizeGenePair(p1a, p2a), normalizeGenePair(p1a, p2b)],
    [normalizeGenePair(p1b, p2a), normalizeGenePair(p1b, p2b)],
  ];
}

/**
 * Score a student's response to a {@link MonohybridCrossQuestion}.
 *
 * **Grid scoring:** `question.points` is distributed equally across all four
 * cells (`question.points / 4` per cell).  Fractional values are preserved
 * in the sub-totals and rounded only in the final `earned` value.
 *
 * **Follow-up scoring:** each follow-up question's `points` is independent of
 * the grid points.  Answers are compared after trimming and lower-casing.
 *
 * @param question               - The question definition including parent genotypes.
 * @param studentGrid            - 2×2 grid the student submitted.  Missing
 *   cells are treated as blank (incorrect).
 * @param studentFollowUpAnswers - Map of follow-up question id → student's
 *   string answer.
 * @returns Structured {@link PunnettScoringResult} with per-cell and
 *   per-follow-up breakdowns.
 */
export function scoreMonohybridResponse(
  question: MonohybridCrossQuestion,
  studentGrid: string[][],
  studentFollowUpAnswers: Record<string, string>,
): PunnettScoringResult {
  const correctGrid = computeMonohybridGrid(
    question.parent1Genotype,
    question.parent2Genotype,
  );

  const { cellCorrect, correct, total } = scoreCells(studentGrid, correctGrid);
  const gridMax = question.points;
  const gridEarned = total > 0 ? (correct / total) * gridMax : 0;

  const followUp = scoreFollowUps(
    question.followUpQuestions,
    studentFollowUpAnswers,
  );

  return {
    earned: Math.round((gridEarned + followUp.earned) * 100) / 100,
    max: gridMax + followUp.max,
    grid: {
      earned: Math.round(gridEarned * 100) / 100,
      max: gridMax,
      cellCorrect,
      correctGrid,
    },
    followUp,
  };
}

// ---------------------------------------------------------------------------
// Public API — Dihybrid
// ---------------------------------------------------------------------------

/**
 * Compute the expected 4×4 Punnett square for a dihybrid cross.
 *
 * Gametes are generated in standard order — dominant-dominant, dominant-
 * recessive, recessive-dominant, recessive-recessive — for each parent.
 * The grid is indexed `[row][column]` where rows correspond to parent 1's
 * gametes and columns to parent 2's gametes.  Each cell is in canonical form.
 *
 * @example
 * computeDihybridGrid("AaBb", "AaBb");
 * // Row/column headers: AB, Ab, aB, ab  (for each parent)
 * // grid[0][0] = "AABB", grid[0][1] = "AABb", ...
 *
 * @param parent1 - 4-character dihybrid genotype of parent 1, e.g. `"AaBb"`.
 * @param parent2 - 4-character dihybrid genotype of parent 2, e.g. `"AaBb"`.
 * @returns 4×4 array of offspring genotype strings in canonical form.
 */
export function computeDihybridGrid(
  parent1: string,
  parent2: string,
): string[][] {
  const gametes1 = generateDihybridGametes(parent1);
  const gametes2 = generateDihybridGametes(parent2);
  return gametes1.map((g1) => gametes2.map((g2) => combineGametes(g1, g2)));
}

/**
 * Score a student's response to a {@link DihybridCrossQuestion}.
 *
 * **Grid scoring:** `question.points` is distributed equally across all
 * sixteen cells (`question.points / 16` per cell).
 *
 * **Follow-up scoring:** each follow-up question's `points` is independent of
 * the grid points.  Answers are compared after trimming and lower-casing.
 *
 * @param question               - The question definition including parent genotypes.
 * @param studentGrid            - 4×4 grid the student submitted.  Missing
 *   cells are treated as blank (incorrect).
 * @param studentFollowUpAnswers - Map of follow-up question id → student's
 *   string answer.
 * @returns Structured {@link PunnettScoringResult} with per-cell and
 *   per-follow-up breakdowns.
 */
export function scoreDihybridResponse(
  question: DihybridCrossQuestion,
  studentGrid: string[][],
  studentFollowUpAnswers: Record<string, string>,
): PunnettScoringResult {
  const correctGrid = computeDihybridGrid(
    question.parent1Genotype,
    question.parent2Genotype,
  );

  const { cellCorrect, correct, total } = scoreCells(studentGrid, correctGrid);
  const gridMax = question.points;
  const gridEarned = total > 0 ? (correct / total) * gridMax : 0;

  const followUp = scoreFollowUps(
    question.followUpQuestions,
    studentFollowUpAnswers,
  );

  return {
    earned: Math.round((gridEarned + followUp.earned) * 100) / 100,
    max: gridMax + followUp.max,
    grid: {
      earned: Math.round(gridEarned * 100) / 100,
      max: gridMax,
      cellCorrect,
      correctGrid,
    },
    followUp,
  };
}
