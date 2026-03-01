/**
 * Assignment Summary Types
 * Derived data models for analyzing student performance on assignments
 */

import type { Item } from "./item";

/**
 * Summary statistics for a single item
 */
export type ItemSummary = {
  itemId: string;
  title: string;
  tags: string[];
  attempts: number; // number of unique student responses
  correct: number; // number of correct responses
  accuracy: number; // 0..1
  correctStudents?: string[]; // optional: list of student IDs who got it right
};

/**
 * Summary statistics for a tag/standard
 */
export type TagSummary = {
  tag: string;
  attempts: number;
  correct: number;
  accuracy: number; // 0..1
  itemIds: string[];
  itemCount: number; // count of unique items with this tag
};

/**
 * Student summary within an assignment
 */
export type StudentSummary = {
  studentId: string;
  name?: string;
  attempts: number; // total responses
  correct: number; // total correct
  accuracy: number; // 0..1
  tagAccuracy?: Record<string, number>; // per-tag accuracy for this student
};

/**
 * Grouping of students by proficiency level
 */
export type StudentGroup = "reteach" | "practice" | "extend";

export type GroupsData = {
  reteach: StudentSummary[];
  practice: StudentSummary[];
  extend: StudentSummary[];
};

/**
 * Overall assignment statistics
 */
export type OverallStats = {
  assignmentId: string;
  assignmentTitle?: string;
  totalStudents: number;
  totalItems: number;
  totalAttempts: number;
  totalCorrect: number;
  overallAccuracy: number;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
};

/**
 * Complete assignment summary
 */
export type AssignmentSummary = {
  overallStats: OverallStats;
  itemSummaries: ItemSummary[];
  tagSummaries: TagSummary[];
  studentSummaries: StudentSummary[];
  groups: GroupsData;
  lowestTags: TagSummary[]; // top N lowest accuracy tags
  highestTags: TagSummary[]; // top N highest accuracy tags
  computedAt: string;
};

/**
 * Input for summary computation
 */
export type SummaryComputeInput = {
  assignmentId: string;
  assignmentTitle?: string;
  items: Item[];
  responses: StudentResponse[];
};

/**
 * Student response data (generic, adapts to various item types)
 */
export type StudentResponse = {
  itemId: string;
  studentId: string;
  studentName?: string;
  isCorrect: boolean;
  score?: number; // optional: use if isCorrect not available
  maxScore?: number; // optional: for deriving correctness from score
  submittedAt?: string;
  // Flexible extra fields per item type
  [key: string]: any;
};

/**
 * Grouping thresholds for student groups
 */
export type GroupingThresholds = {
  reteachMax: number; // < this threshold → reteach (default: 0.50)
  practiceMax: number; // >= reteachMax and < this → practice (default: 0.80)
  // >= practiceMax → extend
};

/**
 * Options for summary computation
 */
export type SummaryComputeOptions = {
  thresholds?: Partial<GroupingThresholds>;
  topTagsCount?: number; // default: 10
  minSampleSizeWarning?: number; // default: 5
};
