import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ResponseRow = { score: number | null; submittedAt: Date };

export async function GET(
  _req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  const responses: ResponseRow[] = await prisma.assignmentResponse.findMany({
    where: { assignmentId: params.assignmentId },
    select: { score: true, submittedAt: true },
  });

  const scored = responses.filter((r): r is { score: number; submittedAt: Date } => r.score !== null);
  const avgScore =
    scored.length > 0
      ? scored.reduce((sum: number, r) => sum + r.score, 0) / scored.length
      : null;

  return NextResponse.json({
    totalResponses: responses.length,
    scoredResponses: scored.length,
    averageScore: avgScore,
  });
}
