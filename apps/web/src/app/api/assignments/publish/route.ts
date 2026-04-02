/**
 * POST /api/assignments/publish
 *
 * Transitions a draft assignment to "published" status.
 *
 * Request body:
 *   assignmentId  string  — id returned by POST /api/assignments/create
 *
 * Auth: teacher role only.
 * Responds: 200 { assignmentId, status: "published" }
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

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

  const { assignmentId } = body;
  if (typeof assignmentId !== "string" || !assignmentId.trim()) {
    return NextResponse.json(
      { error: "Missing required field: assignmentId" },
      { status: 400 },
    );
  }

  try {
    // ── 1. Load assignment ─────────────────────────────────────────────────
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId.trim() },
    });
    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found", assignmentId },
        { status: 404 },
      );
    }

    // ── 2. Validate assignment has content ────────────────────────────────
    const meta = assignment.metadata as Record<string, unknown> | null;
    const questions = Array.isArray(meta?.["questions"]) ? meta["questions"] : [];
    const preMadeSourceId = meta?.["preMadeSourceId"];
    if (questions.length === 0 && !preMadeSourceId) {
      return NextResponse.json(
        {
          error:
            "Assignment must contain at least one question, or specify a preMadeSourceId.",
        },
        { status: 400 },
      );
    }

    // ── 3. Validate dueDate is in the future ──────────────────────────────
    const due = assignment.dueAt;
    if (!due || due.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "dueDate must be a valid date in the future." },
        { status: 400 },
      );
    }

    // ── 4. Publish ────────────────────────────────────────────────────────
    await prisma.assignment.update({
      where: { id: assignment.id },
      data: { status: "published" },
    });

    return NextResponse.json({
      assignmentId: assignment.id,
      status: "published",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
