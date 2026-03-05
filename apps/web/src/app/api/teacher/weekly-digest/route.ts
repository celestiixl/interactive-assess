import { NextRequest } from "next/server";
import {
  buildWeeklyDigest,
  getMondayOf,
  getWeekRange,
} from "@/lib/weeklyDigest";

/**
 * GET /api/teacher/weekly-digest
 *
 * Query params:
 *   periodId  — optional class period filter (reserved for future use)
 *   weekOf    — optional ISO date string (YYYY-MM-DD) for the Monday of the
 *               desired week; defaults to the current school week
 *   take      — optional number of entries to return (default 10, dashboard uses 3)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weekOfParam = searchParams.get("weekOf") ?? undefined;
    const takeParam = searchParams.get("take");
    const take = takeParam ? parseInt(takeParam, 10) : 10;

    // Resolve the Monday of the requested week
    const resolvedWeekOf = weekOfParam ?? getMondayOf(new Date());
    const weekRange = getWeekRange(resolvedWeekOf);

    // In production we would pull real attempts from the attempts store here.
    // For now we pass an empty array so the library falls back to mock data.
    const digest = buildWeeklyDigest([], weekRange, { take });

    return Response.json({ ok: true, ...digest });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
