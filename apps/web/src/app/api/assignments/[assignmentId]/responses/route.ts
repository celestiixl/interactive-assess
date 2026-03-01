import { NextRequest, NextResponse } from "next/server";
import { MOCK_RESPONSES } from "@/lib/mockAssignments";

export async function GET(req: NextRequest, context: any) {
  const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:3011";
  const assignmentId = context?.params?.assignmentId;

  try {
    const r = await fetch(
      `${base}/assignments/${encodeURIComponent(assignmentId)}/responses`,
      { cache: "no-store" },
    );
    if (r.ok) {
      const data = await r.json().catch(async () => ({ text: await r.text() }));
      return NextResponse.json(data, { status: r.status });
    }
  } catch (e) {
    // fallthrough to mock
  }

  const responses = MOCK_RESPONSES[assignmentId] ?? [];
  return NextResponse.json(responses);
}
