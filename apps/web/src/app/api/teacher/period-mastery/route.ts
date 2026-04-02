import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherToken } from "@/lib/teacherTokenAuth";

export const runtime = "nodejs";

// GET /api/teacher/period-mastery?period=1
export async function GET(req: NextRequest) {
  const authed = await requireTeacherToken(req);
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
