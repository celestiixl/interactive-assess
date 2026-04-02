import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateAttemptSchema = z.object({
  studentId: z.string(),
  quickCheckId: z.string(),
  teks: z.string(),
  score: z.number().min(0).max(1),
  correct: z.boolean(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { studentId, quickCheckId, teks, score, correct } = parsed.data;

  const priorCount = await prisma.attempt.count({
    where: { studentId, quickCheckId },
  });

  const attempt = await prisma.attempt.create({
    data: {
      studentId,
      quickCheckId,
      teks,
      score,
      correct,
      attemptNumber: priorCount + 1,
    },
  });

  return NextResponse.json(attempt, { status: 201 });
}

// GET /api/attempts?studentId=xxx&teks=B.5A
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const teks = searchParams.get("teks");

  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const attempts = await prisma.attempt.findMany({
    where: { studentId, ...(teks ? { teks } : {}) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(attempts);
}
