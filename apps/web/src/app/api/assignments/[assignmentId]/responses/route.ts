import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SubmitResponseSchema = z.object({
  studentId: z.string(),
  answers: z.record(z.string(), z.unknown()),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const { assignmentId } = await params;
  const responses = await prisma.assignmentResponse.findMany({
    where: { assignmentId },
    include: { student: { select: { displayName: true, period: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(responses);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const { assignmentId } = await params;
  const body = await req.json();
  const parsed = SubmitResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const answers = parsed.data.answers as any;

  const response = await prisma.assignmentResponse.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId: parsed.data.studentId,
      },
    },
    update: { answers },
    create: {
      assignmentId,
      studentId: parsed.data.studentId,
      answers,
    },
  });

  return NextResponse.json(response, { status: 201 });
}
