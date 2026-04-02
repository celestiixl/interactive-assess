import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateAssignmentSchema = z.object({
  title: z.string().min(1),
  kind: z.enum(["assignment", "assessment"]),
  teks: z.array(z.string()),
  period: z.number().int().min(1),
  dueAt: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period");

  const assignments = await prisma.assignment.findMany({
    where: period ? { period: parseInt(period) } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { responses: true } } },
  });

  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      ...parsed.data,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    },
  });

  return NextResponse.json(assignment, { status: 201 });
}
