/**
 * API endpoint: GET /api/assignments/[assignmentId]/summary
 *
 * Computes and returns assignment performance summary for teachers
 * including item accuracy, tag heatmap, and student groups.
 */

import { NextRequest, NextResponse } from "next/server";
import { computeAssignmentSummary } from "@/lib/computeAssignmentSummary";
import { MOCK_RESPONSES } from "@/lib/mockAssignments";
import { bio9Items } from "@/data/biology9";
import { bioInteractives } from "@/data/bio9_interactives";
import type {
  SummaryComputeInput,
  SummaryComputeOptions,
  StudentResponse,
} from "@/types/assignment-summary";
import type { Item } from "@/types/item";

/**
 * Helper: fetch items for an assignment
 * In a real deployment, this would query a database
 * For MVP, we'll fetch from the API backend or use sample data
 */
async function fetchAssignmentItems(
  assignmentId: string,
): Promise<{ items: Item[]; title: string }> {
  // TODO: In production, query database or API
  // For now, return empty or fetch from backend
  const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:3011";

  try {
    const r = await fetch(
      `${base}/assignments/${encodeURIComponent(assignmentId)}`,
      {
        cache: "no-store",
      },
    );
    if (r.ok) {
      const data = await r.json();
      return {
        items: data.items || [],
        title: data.title || "Assignment",
      };
    }
  } catch (e) {
    console.error("Failed to fetch assignment:", e);
  }

  // Fallback: try to build items from local mock responses and data files
  const mockForAssignment = MOCK_RESPONSES[assignmentId] || [];
  const itemIds = Array.from(
    new Set(mockForAssignment.map((r) => r.itemId).filter(Boolean)),
  );
  const localItems: Item[] = [];

  const searchPools: Item[] = [
    ...(bio9Items as any[]),
    ...(bioInteractives as any[]),
  ];
  itemIds.forEach((id) => {
    const found = searchPools.find((it) => it.id === id);
    if (found) localItems.push(found as Item);
  });

  return { items: localItems, title: `Assignment ${assignmentId}` };
}

/**
 * Helper: fetch student responses for an assignment
 * Queries the backend for all responses to items in this assignment
 */
async function fetchAssignmentResponses(
  assignmentId: string,
): Promise<StudentResponse[]> {
  const base = process.env.API_INTERNAL_URL || "http://127.0.0.1:3011";

  try {
    const r = await fetch(
      `${base}/assignments/${encodeURIComponent(assignmentId)}/responses`,
      { cache: "no-store" },
    );
    if (r.ok) {
      return await r.json();
    }
  } catch (e) {
    console.error("Failed to fetch responses:", e);
  }

  // fallback to mock
  return MOCK_RESPONSES[assignmentId] || [];
}

export async function GET(
  req: NextRequest,
  context: { params: { assignmentId: string } },
) {
  try {
    const { assignmentId } = await context.params;
    if (!assignmentId) {
      return NextResponse.json(
        { error: "Missing assignmentId" },
        { status: 400 },
      );
    }

    // Fetch items and responses
    const { items, title: assignmentTitle } =
      await fetchAssignmentItems(assignmentId);
    const responses = await fetchAssignmentResponses(assignmentId);

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Assignment not found or has no items" },
        { status: 404 },
      );
    }

    // Normalize responses to StudentResponse type
    const normalizedResponses: StudentResponse[] = responses.map((r: any) => ({
      itemId: r.itemId,
      studentId: r.studentId,
      studentName: r.studentName,
      isCorrect:
        typeof r.isCorrect === "boolean" ? r.isCorrect : r.score >= r.maxScore,
      submittedAt: r.submittedAt,
    }));

    // Extract options from query params
    const url = new URL(req.url);
    const reteachMaxStr = url.searchParams.get("reteachMax");
    const practiceMaxStr = url.searchParams.get("practiceMax");
    const topTagsStr = url.searchParams.get("topTags");

    const options: SummaryComputeOptions = {};
    if (reteachMaxStr || practiceMaxStr) {
      options.thresholds = {
        reteachMax: reteachMaxStr ? parseFloat(reteachMaxStr) : 0.5,
        practiceMax: practiceMaxStr ? parseFloat(practiceMaxStr) : 0.8,
      };
    }
    if (topTagsStr) {
      options.topTagsCount = parseInt(topTagsStr, 10);
    }

    // Compute summary
    const summary = computeAssignmentSummary(
      {
        assignmentId,
        assignmentTitle,
        items,
        responses: normalizedResponses,
      } as SummaryComputeInput,
      options,
    );

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Failed to compute assignment summary", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to compute summary" },
      { status: 500 },
    );
  }
}
