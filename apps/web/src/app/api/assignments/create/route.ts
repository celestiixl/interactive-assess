/**
 * POST /api/assignments/create
 *
 * Creates a new assignment in draft status.
 *
 * Request body:
 *   title               string           — assignment title
 *   goal                AssignmentGoal   — "practice" | "reteach" | "review"
 *   mode                AssignmentMode   — "pre-made" | "custom"
 *   questions           Question[]       — optional; required when mode is "custom"
 *   preMadeSourceId     string           — optional; required when mode is "pre-made"
 *   differentiationMode DifferentiationMode — "single" | "tiered"
 *   periodIds           string[]         — one or more class-period identifiers
 *   dueDate             string           — ISO 8601 due date
 *
 * Auth: teacher role only.
 * Responds: 201 { assignmentId, status: "draft" }
 */

import { NextRequest, NextResponse } from "next/server";
import { buildDifferentiatedTracks, addToItemBank } from "@/lib/itemBank";
import type {
  AssignmentGoal,
  AssignmentMode,
  DifferentiationMode,
  Question,
} from "@/types/assignments";
import {
  assignmentStore,
  generateAssignmentId,
  type StoredAssignment,
} from "@/lib/serverAssignmentStore";

export const runtime = "nodejs";

// TEKS canonical format: letter(s) · dot · digit(s) · letter(s)
// Examples that must pass: "B.5A", "B.11A", "B.12B", "B.7C"
const TEKS_RE = /^[A-Za-z]+\.\d+[A-Za-z]+$/;

/**
 * Validate every TEKS code on every question against the canonical format.
 * Returns a human-readable error string, or `null` when all codes are valid.
 */
function validateTeksCodes(questions: Question[]): string | null {
  for (const q of questions) {
    for (const code of q.teks) {
      if (!TEKS_RE.test(code)) {
        return `Malformed TEKS code "${code}". Expected format like "B.5A".`;
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  // ── Auth: teacher role required ──────────────────────────────────────────
  // The platform does not yet have a server-side session layer; the
  // convention (matching /api/tutor/chat) is to require a non-empty
  // x-teacher-id header as a lightweight role indicator.
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

  const {
    title,
    goal,
    mode,
    questions,
    preMadeSourceId,
    differentiationMode,
    periodIds,
    dueDate,
  } = body;

  // ── 1. Validate required fields ───────────────────────────────────────────
  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof goal !== "string" ||
    !goal.trim() ||
    typeof mode !== "string" ||
    !mode.trim() ||
    typeof differentiationMode !== "string" ||
    !differentiationMode.trim() ||
    !Array.isArray(periodIds) ||
    periodIds.length === 0 ||
    typeof dueDate !== "string" ||
    !dueDate.trim()
  ) {
    return NextResponse.json(
      {
        error:
          "Missing or invalid required fields: title, goal, mode, differentiationMode, periodIds, dueDate",
      },
      { status: 400 },
    );
  }

  const qs: Question[] = Array.isArray(questions)
    ? (questions as Question[])
    : [];

  // ── 2. Validate TEKS codes ─────────────────────────────────────────────────
  const teksError = validateTeksCodes(qs);
  if (teksError) {
    return NextResponse.json({ error: teksError }, { status: 400 });
  }

  try {
    const assignmentId = generateAssignmentId();

    // ── 3. Build differentiated tracks for tiered custom assignments ──────────
    // buildDifferentiatedTracks is a pure function — works in server context.
    let tracks: StoredAssignment["tracks"];
    if (mode === "custom" && differentiationMode === "tiered") {
      tracks = buildDifferentiatedTracks(qs);
    }

    // ── 4. Register custom questions in item bank for future reuse ────────────
    // addToItemBank reads/writes localStorage and silently no-ops server-side.
    // Client-side calls via the teacher UI populate the bank as intended.
    if (mode === "custom") {
      for (const q of qs) {
        addToItemBank(q, assignmentId);
      }
    }

    // ── 5. Persist assignment in server-side store ────────────────────────────
    const assignment: StoredAssignment = {
      id: assignmentId,
      teacherId,
      title: title.trim(),
      goal: goal as AssignmentGoal,
      mode: mode as AssignmentMode,
      questions: qs,
      preMadeSourceId:
        typeof preMadeSourceId === "string" ? preMadeSourceId : undefined,
      differentiationMode: differentiationMode as DifferentiationMode,
      periodIds: periodIds as string[],
      dueDate: dueDate.trim(),
      status: "draft",
      tracks,
      createdAt: new Date().toISOString(),
    };
    assignmentStore.set(assignmentId, assignment);

    // ── 6. Return ─────────────────────────────────────────────────────────────
    return NextResponse.json({ assignmentId, status: "draft" }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
