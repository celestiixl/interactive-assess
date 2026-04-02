import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function requireTeacher(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("x-teacher-token");
  return token === process.env.TEACHER_SECRET;
}

// GET /api/teacher/analytics?period=1
export async function GET(req: NextRequest) {
  const authed = await requireTeacher(req);
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = new URL(req.url).searchParams.get("period");
  const periodFilter = period ? { period: parseInt(period) } : undefined;

  const students = await prisma.student.findMany({
    where: periodFilter,
    select: { id: true },
  });
  const studentIds = students.map((s) => s.id);

  const masteryRecords = await prisma.masteryRecord.findMany({
    where: { studentId: { in: studentIds } },
  });

  // Aggregate mastery per TEKS
  const byTeks: Record<string, number[]> = {};
  for (const r of masteryRecords) {
    if (!byTeks[r.teks]) byTeks[r.teks] = [];
    byTeks[r.teks].push(r.score);
  }

  // Stuck points: TEKS where class average is below 0.70
  const stuckPoints = Object.entries(byTeks)
    .map(([teks, scores]) => ({
      teks,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      studentsBelow70: scores.filter((s) => s < 0.7).length,
      studentsBelow50: scores.filter((s) => s < 0.5).length,
      totalStudents: scores.length,
    }))
    .filter((t) => t.averageScore < 0.7)
    .sort((a, b) => a.averageScore - b.averageScore);

  // Learning funnel
  const startedCount = new Set(masteryRecords.map((r) => r.studentId)).size;
  const completedCount = students.filter((s) => {
    const records = masteryRecords.filter((r) => r.studentId === s.id);
    return records.length > 0 && records.every((r) => r.score >= 0.7);
  }).length;

  // Intervention queue
  const attemptCounts = await prisma.attempt.groupBy({
    by: ["studentId", "teks"],
    where: { studentId: { in: studentIds }, correct: false },
    _count: { id: true },
  });

  const tier3Students = new Set<string>();
  const tier2Students = new Set<string>();

  for (const r of masteryRecords) {
    if (r.score < 0.5) tier3Students.add(r.studentId);
    else if (r.score < 0.7) tier2Students.add(r.studentId);
  }
  for (const a of attemptCounts) {
    if (a._count.id >= 2) tier3Students.add(a.studentId);
  }

  return NextResponse.json({
    period: period ? parseInt(period) : null,
    funnel: {
      totalStudents: students.length,
      started: startedCount,
      completed: completedCount,
    },
    stuckPoints,
    interventionQueue: {
      tier2: tier2Students.size,
      tier3: tier3Students.size,
    },
  });
}
