/**
 * Assignment Summary Computation Utility
 * Computes student performance analytics from items and responses
 */

import type {
  AssignmentSummary,
  ItemSummary,
  TagSummary,
  StudentSummary,
  GroupsData,
  StudentGroup,
  OverallStats,
  SummaryComputeInput,
  SummaryComputeOptions,
  StudentResponse,
  GroupingThresholds,
} from "@/types/assignment-summary";
import type { Item } from "@/types/item";

const DEFAULT_GROUPING_THRESHOLDS: GroupingThresholds = {
  reteachMax: 0.5,
  practiceMax: 0.8,
};

const DEFAULT_OPTIONS: SummaryComputeOptions = {
  thresholds: DEFAULT_GROUPING_THRESHOLDS,
  topTagsCount: 10,
  minSampleSizeWarning: 5,
};

/**
 * Main entry point: compute assignment summary from items and responses
 */
export function computeAssignmentSummary(
  input: SummaryComputeInput,
  options?: SummaryComputeOptions,
): AssignmentSummary {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const thresholds = { ...DEFAULT_GROUPING_THRESHOLDS, ...opts.thresholds };

  // Validate input
  if (!input.items || input.items.length === 0) {
    throw new Error("No items provided");
  }
  if (!input.responses || input.responses.length === 0) {
    return createEmptySummary(input, opts);
  }

  // Compute item summaries
  const itemSummaries = computeItemSummaries(input.items, input.responses);

  // Compute tag summaries
  const tagSummaries = computeTagSummaries(
    input.items,
    itemSummaries,
    input.responses,
  );

  // Compute student summaries
  const studentSummaries = computeStudentSummaries(
    input.responses,
    itemSummaries,
  );

  // Group students
  const groups = groupStudents(studentSummaries, thresholds);

  // Overall stats
  const overallStats: OverallStats = {
    assignmentId: input.assignmentId,
    assignmentTitle: input.assignmentTitle,
    totalStudents: new Set(input.responses.map((r) => r.studentId)).size,
    totalItems: input.items.length,
    totalAttempts: input.responses.length,
    totalCorrect: input.responses.filter((r) => deriveCorrectness(r)).length,
    overallAccuracy:
      input.responses.length > 0
        ? input.responses.filter((r) => deriveCorrectness(r)).length /
          input.responses.length
        : 0,
    dateRange: extractDateRange(input.responses),
  };

  // Get lowest and highest tags
  const sortedByAccuracy = [...tagSummaries].sort(
    (a, b) => a.accuracy - b.accuracy,
  );
  const lowestTags = sortedByAccuracy.slice(0, opts.topTagsCount);
  const highestTags = [...sortedByAccuracy]
    .reverse()
    .slice(0, opts.topTagsCount);

  return {
    overallStats,
    itemSummaries: itemSummaries.sort((a, b) => a.accuracy - b.accuracy),
    tagSummaries,
    studentSummaries,
    groups,
    lowestTags,
    highestTags,
    computedAt: new Date().toISOString(),
  };
}

/**
 * Compute accuracy per item
 */
function computeItemSummaries(
  items: Item[],
  responses: StudentResponse[],
): ItemSummary[] {
  const itemMap = new Map<string, Item>();
  items.forEach((item) => itemMap.set(item.id, item));

  // Group responses by item
  const responsesByItem = new Map<string, StudentResponse[]>();
  responses.forEach((r) => {
    if (!responsesByItem.has(r.itemId)) {
      responsesByItem.set(r.itemId, []);
    }
    responsesByItem.get(r.itemId)!.push(r);
  });

  return items.map((item) => {
    const itemResponses = responsesByItem.get(item.id) || [];
    const correctCount = itemResponses.filter((r) =>
      deriveCorrectness(r),
    ).length;
    const accuracy =
      itemResponses.length > 0 ? correctCount / itemResponses.length : 0;

    const summary: ItemSummary = {
      itemId: item.id,
      title: item.stem || "Untitled Item",
      tags: extractTags(item) || [],
      attempts: itemResponses.length,
      correct: correctCount,
      accuracy,
      correctStudents: itemResponses
        .filter((r) => deriveCorrectness(r))
        .map((r) => r.studentId),
    };

    return summary;
  });
}

/**
 * Compute accuracy per tag/standard
 */
function computeTagSummaries(
  items: Item[],
  itemSummaries: ItemSummary[],
  responses: StudentResponse[],
): TagSummary[] {
  const tagMap = new Map<
    string,
    { itemIds: Set<string>; items: ItemSummary[] }
  >();

  // Collect all items per tag
  items.forEach((item) => {
    const tags = extractTags(item) || [];
    const itemSummary = itemSummaries.find((s) => s.itemId === item.id);

    tags.forEach((tag) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, { itemIds: new Set(), items: [] });
      }
      const entry = tagMap.get(tag)!;
      entry.itemIds.add(item.id);
      if (itemSummary) {
        entry.items.push(itemSummary);
      }
    });
  });

  // Items without tags → "Untagged"
  const untaggedItems = items.filter((item) => {
    const tags = extractTags(item);
    return !tags || tags.length === 0;
  });
  if (untaggedItems.length > 0) {
    if (!tagMap.has("Untagged")) {
      tagMap.set("Untagged", { itemIds: new Set(), items: [] });
    }
    const entry = tagMap.get("Untagged")!;
    untaggedItems.forEach((item) => {
      entry.itemIds.add(item.id);
      const summary = itemSummaries.find((s) => s.itemId === item.id);
      if (summary) {
        entry.items.push(summary);
      }
    });
  }

  return Array.from(tagMap.entries()).map(
    ([tag, { itemIds, items: itemSums }]) => {
      // Aggregate across all responses for items with this tag
      const tagResponses = responses.filter((r) => itemIds.has(r.itemId));
      const correctCount = tagResponses.filter((r) =>
        deriveCorrectness(r),
      ).length;
      const accuracy =
        tagResponses.length > 0 ? correctCount / tagResponses.length : 0;

      return {
        tag,
        attempts: tagResponses.length,
        correct: correctCount,
        accuracy,
        itemIds: Array.from(itemIds),
        itemCount: itemIds.size,
      };
    },
  );
}

/**
 * Compute accuracy per student
 */
function computeStudentSummaries(
  responses: StudentResponse[],
  itemSummaries: ItemSummary[],
): StudentSummary[] {
  const studentMap = new Map<string, StudentResponse[]>();
  responses.forEach((r) => {
    if (!studentMap.has(r.studentId)) {
      studentMap.set(r.studentId, []);
    }
    studentMap.get(r.studentId)!.push(r);
  });

  // Group items by tag for per-student tag accuracy
  const itemsByTag = new Map<string, string[]>();
  itemSummaries.forEach((item) => {
    item.tags.forEach((tag) => {
      if (!itemsByTag.has(tag)) {
        itemsByTag.set(tag, []);
      }
      itemsByTag.get(tag)!.push(item.itemId);
    });
  });

  return Array.from(studentMap.entries())
    .sort(([idA], [idB]) => idA.localeCompare(idB))
    .map(([studentId, studentResponses]) => {
      const correctCount = studentResponses.filter((r) =>
        deriveCorrectness(r),
      ).length;
      const accuracy =
        studentResponses.length > 0
          ? correctCount / studentResponses.length
          : 0;

      // Per-tag accuracy for this student
      const tagAccuracy: Record<string, number> = {};
      itemsByTag.forEach((itemIds, tag) => {
        const tagResponses = studentResponses.filter((r) =>
          itemIds.includes(r.itemId),
        );
        const tagCorrectCount = tagResponses.filter((r) =>
          deriveCorrectness(r),
        ).length;
        tagAccuracy[tag] =
          tagResponses.length > 0 ? tagCorrectCount / tagResponses.length : 0;
      });

      return {
        studentId,
        name: studentResponses[0]?.studentName,
        attempts: studentResponses.length,
        correct: correctCount,
        accuracy,
        tagAccuracy:
          Object.keys(tagAccuracy).length > 0 ? tagAccuracy : undefined,
      };
    });
}

/**
 * Group students into Reteach / Practice / Extend
 */
function groupStudents(
  students: StudentSummary[],
  thresholds: GroupingThresholds,
): GroupsData {
  const groups: GroupsData = {
    reteach: [],
    practice: [],
    extend: [],
  };

  students.forEach((student) => {
    let group: StudentGroup;
    if (student.accuracy < thresholds.reteachMax) {
      group = "reteach";
    } else if (student.accuracy < thresholds.practiceMax) {
      group = "practice";
    } else {
      group = "extend";
    }
    groups[group].push(student);
  });

  return groups;
}

/**
 * Extract tags or TEKS from item
 * Looks for: tags, teks, standards fields
 */
function extractTags(item: any): string[] | null {
  if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
    return item.tags;
  }
  if (item.teks && Array.isArray(item.teks) && item.teks.length > 0) {
    return item.teks;
  }
  return null;
}

/**
 * Derive correctness from response
 * Prefers isCorrect flag, falls back to score calculation
 */
function deriveCorrectness(response: StudentResponse): boolean {
  if (typeof response.isCorrect === "boolean") {
    return response.isCorrect;
  }
  if (
    typeof response.score === "number" &&
    typeof response.maxScore === "number"
  ) {
    return response.score >= response.maxScore;
  }
  return false;
}

/**
 * Extract date range from responses
 */
function extractDateRange(responses: StudentResponse[]) {
  const dates = responses
    .map((r) => (r.submittedAt ? new Date(r.submittedAt).getTime() : null))
    .filter((d): d is number => d !== null);

  if (dates.length === 0) {
    return undefined;
  }

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  return {
    startDate: minDate.toISOString(),
    endDate: maxDate.toISOString(),
  };
}

/**
 * Create empty summary when no responses
 */
function createEmptySummary(
  input: SummaryComputeInput,
  options: SummaryComputeOptions,
): AssignmentSummary {
  return {
    overallStats: {
      assignmentId: input.assignmentId,
      assignmentTitle: input.assignmentTitle,
      totalStudents: 0,
      totalItems: input.items.length,
      totalAttempts: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
    },
    itemSummaries: [],
    tagSummaries: [],
    studentSummaries: [],
    groups: {
      reteach: [],
      practice: [],
      extend: [],
    },
    lowestTags: [],
    highestTags: [],
    computedAt: new Date().toISOString(),
  };
}
