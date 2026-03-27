export type AssignmentStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "graded";

export type AssignmentKind = "assignment" | "assessment";

export type StudentAssignment = {
  id: string;
  title: string;
  kind: AssignmentKind;
  subject: string;
  teks: string[];
  status: AssignmentStatus;
  dueDate: string | null;
  openedAt: string | null;
  submittedAt: string | null;
  score: number | null;
  totalItems: number;
  completedItems: number;
};

export const MOCK_STUDENT_ASSIGNMENTS: StudentAssignment[] = [
  {
    id: "asgn-u2-core",
    title: "Unit 2 Check-In: DNA and Protein Synthesis",
    kind: "assignment",
    subject: "Biology",
    teks: ["B.7A", "B.7B", "B.7C"],
    status: "not_started",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: null,
    submittedAt: null,
    score: null,
    totalItems: 8,
    completedItems: 0,
  },
  {
    id: "asgn-u1-energy",
    title: "Energy Conversions Quick Check",
    kind: "assessment",
    subject: "Biology",
    teks: ["B.11A", "B.11B"],
    status: "in_progress",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    submittedAt: null,
    score: null,
    totalItems: 10,
    completedItems: 4,
  },
  {
    id: "asgn-u2-models",
    title: "Gene Expression Modeling Practice",
    kind: "assignment",
    subject: "Biology",
    teks: ["B.7A", "B.7B", "B.7C"],
    status: "submitted",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    score: null,
    totalItems: 12,
    completedItems: 12,
  },
  {
    id: "asgn-u1-transport",
    title: "Cell Transport and Homeostasis Quiz",
    kind: "assessment",
    subject: "Biology",
    teks: ["B.5C"],
    status: "graded",
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    score: 82,
    totalItems: 15,
    completedItems: 15,
  },
  {
    id: "asgn-u1-core",
    title: "Unit 1 Biomolecules and Cells Review",
    kind: "assignment",
    subject: "Biology",
    teks: ["B.5A", "B.5B", "B.5C", "B.11A", "B.11B"],
    status: "graded",
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    score: 91,
    totalItems: 10,
    completedItems: 10,
  },
  {
    id: "asgn-u1-enzymes",
    title: "Enzyme Function Mini Check",
    kind: "assignment",
    subject: "Biology",
    teks: ["B.11B"],
    status: "not_started",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: null,
    submittedAt: null,
    score: null,
    totalItems: 6,
    completedItems: 0,
  },
  {
    id: "asgn-u3-core",
    title: "Unit 3 Cell Cycle Review",
    kind: "assignment",
    subject: "Biology",
    teks: ["B.5D", "B.6A", "B.6B", "B.6C", "B.7C", "B.8A"],
    status: "not_started",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: null,
    submittedAt: null,
    score: null,
    totalItems: 10,
    completedItems: 0,
  },
  {
    id: "asgn-u7-core",
    title: "Unit 7 Processes in Plants — B.12B Assessment",
    kind: "assignment",
    subject: "Biology",
    teks: ["B.12B"],
    status: "not_started",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: null,
    submittedAt: null,
    score: null,
    totalItems: 16,
    completedItems: 0,
  },
];

export function getStudentAssignmentById(
  assignmentId?: string,
): StudentAssignment | undefined {
  if (!assignmentId) return undefined;
  return MOCK_STUDENT_ASSIGNMENTS.find(
    (assignment) => assignment.id === assignmentId,
  );
}

export function isAssignmentComplete(
  assignment: StudentAssignment | undefined,
): boolean {
  if (!assignment) return false;
  return assignment.status === "submitted" || assignment.status === "graded";
}
