import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function requireTeacher(req: NextRequest): Promise<boolean> {
  // The existing teacher routes in this directory have a TODO for auth
  // (see the comment in the original file). The agreed default fallback is
  // the x-teacher-token header checked against TEACHER_SECRET.
  const token = req.headers.get("x-teacher-token");
  return token === process.env.TEACHER_SECRET;
}

// GET /api/teacher/period-mastery?period=1
export async function GET(req: NextRequest) {
  const authed = await requireTeacher(req);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = new URL(req.url).searchParams.get("period");
  if (!period) {
    return NextResponse.json({ error: "period required" }, { status: 400 });
  }

  const students = await prisma.student.findMany({
    where: { period: parseInt(period) },
    select: { id: true, displayName: true },
  });

  const studentIds = students.map((s) => s.id);

  const masteryRecords = await prisma.masteryRecord.findMany({
    where: { studentId: { in: studentIds } },
  });

  const byTeks: Record<string, number[]> = {};
  for (const record of masteryRecords) {
    if (!byTeks[record.teks]) byTeks[record.teks] = [];
    byTeks[record.teks].push(record.score);
  }

  const periodMastery = Object.entries(byTeks).map(([teks, scores]) => ({
    teks,
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    studentCount: scores.length,
  }));

  return NextResponse.json({
    period: parseInt(period),
    studentCount: students.length,
    mastery: periodMastery.sort((a, b) => a.teks.localeCompare(b.teks)),
  });
}
