import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const StudentLoginSchema = z.object({
  displayName: z.string().min(1).max(60),
  period: z.number().int().min(1).max(8),
});

// POST /api/student/login
// Upserts the student in the DB and returns their full profile.
// Uses displayName + period as the unique identifier (name-only auth).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = StudentLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { displayName, period } = parsed.data;

  try {
    const student = await prisma.student.upsert({
      where: {
        displayName_period: { displayName, period },
      },
      update: {},
      create: {
        displayName,
        period,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 },
    );
  }
}
