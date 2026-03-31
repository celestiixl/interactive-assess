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
import { searchItemBank } from "@/lib/itemBank";
import type { Question } from "@/types/assignments";
import {
  assignmentStore,
  resultStore,
  generateAssignmentId,
  type StoredAssignment,
  type AssignmentResult,
} from "@/lib/serverAssignmentStore";

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
 * Attempt to find an alternate question from the item bank that shares the
 * same primary TEKS code and `learningLevel` as `original`.
 *
 * Returns the alternate when found, or the original question unchanged.
 * `searchItemBank` reads localStorage; on the server it returns `[]`, so
 * no swap takes place — the original question is preserved in that case.
 *
 * @param original  - Question to replace if an alternate exists.
 * @param excludeId - `original.id` — excluded to avoid self-swap.
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
  // Convention: require x-teacher-id header as lightweight role indicator.
  // Replace with a real session check once auth is wired up.
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

  // scoreThreshold defaults to 0.7 when absent or out of range
  const threshold =
    typeof scoreThreshold === "number" &&
    scoreThreshold >= 0 &&
    scoreThreshold <= 1
      ? scoreThreshold
      : 0.7;

  try {
    // ── 1. Load original assignment and all results ───────────────────────
    const original = assignmentStore.get(assignmentId.trim());
    if (!original) {
      return NextResponse.json(
        { error: "Assignment not found", assignmentId },
        { status: 404 },
      );
    }

    const allResults: AssignmentResult[] =
      resultStore.get(assignmentId.trim()) ?? [];

    // ── 2 & 3. Identify eligible students ─────────────────────────────────
    const eligibleResults = allResults.filter((r) => r.totalScore < threshold);
    const eligibleStudentCount = eligibleResults.length;

    // ── 4. Shuffle question order (Fisher-Yates) ───────────────────────────
    let newQuestions: Question[] = fisherYatesShuffle(original.questions);

    // ── 5. Swap in alternate questions from item bank where possible ───────
    // searchItemBank silently returns [] server-side (no localStorage); the
    // original question is preserved whenever no alternate is available.
    newQuestions = newQuestions.map((q) => swapWithAlternate(q, q.id));

    // ── 6. Save new "second chance" assignment ─────────────────────────────
    const newDueDate = new Date(original.dueDate);
    newDueDate.setDate(newDueDate.getDate() + 3);

    const newAssignmentId = generateAssignmentId();
    const newAssignment: StoredAssignment = {
      id: newAssignmentId,
      teacherId,
      title: `${original.title} — second chance`,
      goal: original.goal,
      mode: original.mode,
      questions: newQuestions,
      preMadeSourceId: original.preMadeSourceId,
      differentiationMode: original.differentiationMode,
      periodIds: original.periodIds,
      dueDate: newDueDate.toISOString(),
      status: "published",
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    };
    assignmentStore.set(newAssignmentId, newAssignment);

    // Create pending AssignmentResult placeholders for each eligible student
    // so the new assignment is immediately associated with them.
    if (eligibleResults.length > 0) {
      const pendingResults: AssignmentResult[] = eligibleResults.map((r) => ({
        assignmentId: newAssignmentId,
        studentId: r.studentId,
        totalScore: 0,
        answers: {},
        submittedAt: "",
      }));
      resultStore.set(newAssignmentId, pendingResults);
    }

    // ── 7. Return ─────────────────────────────────────────────────────────
    return NextResponse.json({ newAssignmentId, eligibleStudentCount });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
