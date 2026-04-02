import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const SubmitResponseSchema = z.object({
  studentId: z.string(),
  answers: z.record(z.string(), z.unknown()),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  const responses = await prisma.assignmentResponse.findMany({
    where: { assignmentId: params.assignmentId },
    include: { student: { select: { displayName: true, period: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(responses);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  const body = await req.json();
  const parsed = SubmitResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const answers = parsed.data.answers as Prisma.InputJsonValue;

  const response = await prisma.assignmentResponse.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: params.assignmentId,
        studentId: parsed.data.studentId,
      },
    },
    update: { answers },
    create: {
      assignmentId: params.assignmentId,
      studentId: parsed.data.studentId,
      answers,
    },
  });

  return NextResponse.json(response, { status: 201 });
}
