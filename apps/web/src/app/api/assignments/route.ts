import { NextRequest, NextResponse } from "next/server";
import { MOCK_ASSIGNMENTS } from "@/lib/mockAssignments";

export async function GET(req: NextRequest) {
  const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:3011";
  try {
    const r = await fetch(`${base}/assignments`, { cache: "no-store" });
    if (r.ok) {
      const data = await r.json().catch(async () => ({ text: await r.text() }));
      return NextResponse.json(data, { status: r.status });
    }
  } catch (e: any) {
    // fallthrough to return mock data
  }

  // Fallback: return mock assignments for local/dev
  return NextResponse.json(MOCK_ASSIGNMENTS);
}
