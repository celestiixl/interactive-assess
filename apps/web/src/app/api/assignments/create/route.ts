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
import { prisma } from "@/lib/prisma";
import { buildDifferentiatedTracks, addToItemBank } from "@/lib/itemBank";
import type {
  AssignmentGoal,
  AssignmentMode,
  DifferentiationMode,
  Question,
} from "@/types/assignments";

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
    // ── 3. Build differentiated tracks for tiered custom assignments ──────────
    let tracks: ReturnType<typeof buildDifferentiatedTracks> | undefined;
    if (mode === "custom" && differentiationMode === "tiered") {
      tracks = buildDifferentiatedTracks(qs);
    }

    // ── 4. Register custom questions in item bank for future reuse ────────────
    if (mode === "custom") {
      for (const q of qs) {
        addToItemBank(q, "pending");
      }
    }

    // ── 5. Derive period number (use first entry) and TEKS from questions ─────
    const periodNum = parseInt(String(periodIds[0]).replace(/\D/g, ""), 10) || 1;
    const allTeks = Array.from(new Set(qs.flatMap((q) => q.teks)));

    // ── 6. Persist assignment in Prisma ───────────────────────────────────────
    const assignment = await prisma.assignment.create({
      data: {
        title: title.trim(),
        kind: "assignment",
        teks: allTeks,
        period: periodNum,
        dueAt: new Date(dueDate.trim()),
        status: "draft",
        metadata: {
          teacherId,
          goal,
          mode,
          questions: qs,
          preMadeSourceId: typeof preMadeSourceId === "string" ? preMadeSourceId : null,
          differentiationMode,
          periodIds,
          tracks: tracks ?? null,
        },
      },
    });

    // ── 7. Return ─────────────────────────────────────────────────────────────
    return NextResponse.json({ assignmentId: assignment.id, status: "draft" }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
