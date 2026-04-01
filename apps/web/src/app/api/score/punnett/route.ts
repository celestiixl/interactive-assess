import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  scoreMonohybridResponse,
  scoreDihybridResponse,
} from "@/lib/punnetScoring";
import type {
  MonohybridCrossQuestion,
  DihybridCrossQuestion,
} from "@/lib/punnetScoring";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Zod schemas (Zod v4)
// ---------------------------------------------------------------------------

const FollowUpQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  correctAnswer: z.string(),
  points: z.number(),
});

const BaseQuestionSchema = z.object({
  id: z.string(),
  teks: z.array(z.string()),
  learningLevel: z.enum(["developing", "progressing", "proficient", "advanced"]),
  misconceptionTarget: z.boolean(),
  points: z.number(),
});

const MonohybridCrossQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("monohybrid-cross"),
  parent1Genotype: z.string(),
  parent2Genotype: z.string(),
  traitName: z.string(),
  dominantPhenotype: z.string(),
  recessivePhenotype: z.string(),
  followUpQuestions: z.array(FollowUpQuestionSchema),
});

const DihybridCrossQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal("dihybrid-cross"),
  parent1Genotype: z.string(),
  parent2Genotype: z.string(),
  trait1Name: z.string(),
  trait1DominantPhenotype: z.string(),
  trait1RecessivePhenotype: z.string(),
  trait2Name: z.string(),
  trait2DominantPhenotype: z.string(),
  trait2RecessivePhenotype: z.string(),
  followUpQuestions: z.array(FollowUpQuestionSchema),
});

const GridSchema = z.array(z.array(z.string()));

const RequestBodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("monohybrid-cross"),
    question: MonohybridCrossQuestionSchema,
    grid: GridSchema,
    followUpAnswers: z.record(z.string(), z.string()).optional(),
  }),
  z.object({
    type: z.literal("dihybrid-cross"),
    question: DihybridCrossQuestionSchema,
    grid: GridSchema,
    followUpAnswers: z.record(z.string(), z.string()).optional(),
  }),
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveInterventionTier(earned: number, max: number): 2 | 3 | null {
  if (max === 0) return null;
  const ratio = earned / max;
  if (ratio < 0.5) return 3;
  if (ratio < 0.7) return 2;
  return null;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Auth - require x-student-id header
  const studentId = req.headers.get("x-student-id")?.trim();
  if (!studentId) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "A valid x-student-id header is required.",
      },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400 },
    );
  }

  const parsed = RequestBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const { type, question, grid, followUpAnswers = {} } = parsed.data;

    const result =
      type === "monohybrid-cross"
        ? scoreMonohybridResponse(
            question as MonohybridCrossQuestion,
            grid,
            followUpAnswers,
          )
        : scoreDihybridResponse(
            question as DihybridCrossQuestion,
            grid,
            followUpAnswers,
          );

    const interventionTier = deriveInterventionTier(result.earned, result.max);

    return NextResponse.json({
      score: result.earned,
      max: result.max,
      correct: result.earned === result.max,
      feedback: result,
      interventionTier,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Scoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
