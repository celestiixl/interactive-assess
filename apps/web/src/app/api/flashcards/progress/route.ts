import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateProgressSchema = z.object({
  studentId: z.string(),
  cardId: z.string(),
  interval: z.number().int().min(1),
  repetitions: z.number().int().min(0),
  easeFactor: z.number().min(1.3),
  dueAt: z.string().datetime(),
});

// GET /api/flashcards/progress?studentId=xxx
export async function GET(req: NextRequest) {
  const studentId = new URL(req.url).searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const progress = await prisma.flashcardProgress.findMany({
    where: { studentId },
    orderBy: { dueAt: "asc" },
  });

  return NextResponse.json(progress);
}

// POST /api/flashcards/progress  (upsert after each card review)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = UpdateProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { studentId, cardId, interval, repetitions, easeFactor, dueAt } = parsed.data;

  const record = await prisma.flashcardProgress.upsert({
    where: { studentId_cardId: { studentId, cardId } },
    update: {
      interval,
      repetitions,
      easeFactor,
      dueAt: new Date(dueAt),
      lastReview: new Date(),
    },
    create: {
      studentId,
      cardId,
      interval,
      repetitions,
      easeFactor,
      dueAt: new Date(dueAt),
      lastReview: new Date(),
    },
  });

  return NextResponse.json(record);
}
