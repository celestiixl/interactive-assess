/**
 * POST /api/assignments/reassign
 *
 * Creates a "second chance" assignment for all students who scored below a
 * given threshold on the original assignment.
 *
 * Request body:
 *   assignmentId    string   — id of the original assignment
 *   scoreThreshold  number   — optional; fraction 0–1; defaults to 0.7
 *
 * Auth: teacher role only.
 * Responds: 200 { newAssignmentId, eligibleStudentCount }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchItemBank } from "@/lib/itemBank";
import type { Question } from "@/types/assignments";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Fisher-Yates shuffle. Returns a new array — the original is not mutated.
 */
function fisherYatesShuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Attempt to find an alternate question from the item bank.
 * Returns the alternate when found, or the original question unchanged.
 */
function swapWithAlternate(original: Question, excludeId: string): Question {
  if (original.teks.length === 0) return original;
  const candidates = searchItemBank({
    teks: [original.teks[0]!],
    learningLevel: original.learningLevel,
  }).filter((e) => e.question.id !== excludeId);
  return candidates[0]?.question ?? original;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // ── Auth: teacher role required ──────────────────────────────────────────
  const teacherId = req.headers.get("x-teacher-id")?.trim();
  if (!teacherId) {
    return NextResponse.json(
      {
        error: "unauthorized",
        message: "A valid x-teacher-id header is required.",
      },
      { status: 401 },
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const { assignmentId, scoreThreshold } = body;
  if (typeof assignmentId !== "string" || !assignmentId.trim()) {
    return NextResponse.json(
      { error: "Missing required field: assignmentId" },
      { status: 400 },
    );
  }

  const threshold =
    typeof scoreThreshold === "number" &&
    scoreThreshold >= 0 &&
    scoreThreshold <= 1
      ? scoreThreshold
      : 0.7;

  try {
    // ── 1. Load original assignment ───────────────────────────────────────
    const original = await prisma.assignment.findUnique({
      where: { id: assignmentId.trim() },
    });
    if (!original) {
      return NextResponse.json(
        { error: "Assignment not found", assignmentId },
        { status: 404 },
      );
    }

    // ── 2. Find eligible students (those who scored below threshold) ───────
    const responses = await prisma.assignmentResponse.findMany({
      where: { assignmentId: assignmentId.trim() },
      select: { studentId: true, score: true },
    });
    const eligibleStudentCount = responses.filter(
      (r) => r.score !== null && r.score < threshold,
    ).length;

    // ── 3. Shuffle + swap questions from original assignment metadata ──────
    const meta = original.metadata as Record<string, unknown> | null;
    const origQuestions: Question[] = Array.isArray(meta?.["questions"])
      ? (meta["questions"] as Question[])
      : [];

    let newQuestions: Question[] = fisherYatesShuffle(origQuestions);
    newQuestions = newQuestions.map((q) => swapWithAlternate(q, q.id));

    // ── 4. Compute new due date (original + 3 days) ────────────────────────
    const newDueAt = original.dueAt
      ? new Date(original.dueAt.getTime() + 3 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // ── 5. Create new "second chance" assignment ───────────────────────────
    const newAssignment = await prisma.assignment.create({
      data: {
        title: `${original.title} — second chance`,
        kind: original.kind,
        teks: original.teks,
        period: original.period,
        dueAt: newDueAt,
        status: "published",
        metadata: {
          ...(meta ?? {}),
          teacherId,
          questions: newQuestions,
        },
      },
    });

    // ── 6. Return ─────────────────────────────────────────────────────────
    return NextResponse.json({ newAssignmentId: newAssignment.id, eligibleStudentCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
