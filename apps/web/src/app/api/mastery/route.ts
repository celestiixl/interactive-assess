import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpsertMasterySchema = z.object({
  studentId: z.string(),
  teks: z.string().regex(/^B\.\d+[A-Z]$/, "TEKS must be in B.5A format"),
  score: z.number().min(0).max(1),
});

// GET /api/mastery?studentId=xxx
export async function GET(req: NextRequest) {
  const studentId = new URL(req.url).searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  const records = await prisma.masteryRecord.findMany({
    where: { studentId },
    orderBy: { teks: "asc" },
  });

  // Return as a flat map: { "B.5A": 0.82, "B.7B": 0.64 }
  const masteryMap = Object.fromEntries(records.map((r: { teks: string; score: number }) => [r.teks, r.score]));
  return NextResponse.json(masteryMap);
}

// PATCH /api/mastery
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const parsed = UpsertMasterySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { studentId, teks, score } = parsed.data;

  const record = await prisma.masteryRecord.upsert({
    where: { studentId_teks: { studentId, teks } },
    update: { score },
    create: { studentId, teks, score },
  });

  return NextResponse.json(record);
}

// Backward-compat alias — existing tests reference POST; real write path is PATCH
export { PATCH as POST };
