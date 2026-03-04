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
    id: "asgn-1",
    title: "Unit 2 Check-In: Cell Cycle",
    kind: "assignment",
    subject: "Biology",
    teks: ["BIO.6A", "BIO.6B"],
    status: "not_started",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: null,
    submittedAt: null,
    score: null,
    totalItems: 8,
    completedItems: 0,
  },
  {
    id: "asgn-2",
    title: "Photosynthesis Quiz",
    kind: "assessment",
    subject: "Biology",
    teks: ["BIO.11A"],
    status: "in_progress",
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    submittedAt: null,
    score: null,
    totalItems: 10,
    completedItems: 4,
  },
  {
    id: "asgn-3",
    title: "Genetics Practice Set",
    kind: "assignment",
    subject: "Biology",
    teks: ["BIO.7A", "BIO.7B", "BIO.8A", "BIO.8B"],
    status: "submitted",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    score: null,
    totalItems: 12,
    completedItems: 12,
  },
  {
    id: "asgn-4",
    title: "Ecology & Biodiversity Final",
    kind: "assessment",
    subject: "Biology",
    teks: ["BIO.13A", "BIO.13B", "BIO.13C", "BIO.13D"],
    status: "graded",
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    score: 82,
    totalItems: 15,
    completedItems: 15,
  },
  {
    id: "asgn-5",
    title: "Unit 1 Cell Structure Review",
    kind: "assignment",
    subject: "Biology",
    teks: ["BIO.5A", "BIO.5B", "BIO.5C"],
    status: "graded",
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    score: 91,
    totalItems: 10,
    completedItems: 10,
  },
  {
    id: "asgn-6",
    title: "Evolution Evidence Check",
    kind: "assignment",
    subject: "Biology",
    teks: ["BIO.9A", "BIO.9B"],
    status: "not_started",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    openedAt: null,
    submittedAt: null,
    score: null,
    totalItems: 6,
    completedItems: 0,
  },
];
