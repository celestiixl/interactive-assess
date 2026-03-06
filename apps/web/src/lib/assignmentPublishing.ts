export type ClassPeriod = "P1" | "P2" | "P3" | "P4";

export type AssignmentPublishMeta = {
  assignmentId: string;
  published: boolean;
  dueDate: string | null;
  classPeriods: ClassPeriod[];
  publishedAt: string | null;
};

const ASSIGNMENT_PUBLISHING_KEY = "teacher.assignmentPublishing.v1";

function isClassPeriod(value: string): value is ClassPeriod {
  return value === "P1" || value === "P2" || value === "P3" || value === "P4";
}

export function defaultAssignmentPublishMeta(
  assignmentId: string,
): AssignmentPublishMeta {
  return {
    assignmentId,
    published: false,
    dueDate: null,
    classPeriods: [],
    publishedAt: null,
  };
}

export function loadAssignmentPublishingState(): Record<
  string,
  AssignmentPublishMeta
> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(ASSIGNMENT_PUBLISHING_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<
      string,
      Partial<AssignmentPublishMeta>
    >;
    const out: Record<string, AssignmentPublishMeta> = {};

    Object.entries(parsed).forEach(([assignmentId, value]) => {
      out[assignmentId] = {
        assignmentId,
        published: Boolean(value.published),
        dueDate:
          typeof value.dueDate === "string" && value.dueDate.length > 0
            ? value.dueDate
            : null,
        classPeriods: Array.isArray(value.classPeriods)
          ? value.classPeriods.filter(
              (period): period is ClassPeriod =>
                typeof period === "string" && isClassPeriod(period),
            )
          : [],
        publishedAt:
          typeof value.publishedAt === "string" && value.publishedAt.length > 0
            ? value.publishedAt
            : null,
      };
    });

    return out;
  } catch {
    return {};
  }
}

export function saveAssignmentPublishingState(
  state: Record<string, AssignmentPublishMeta>,
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ASSIGNMENT_PUBLISHING_KEY,
      JSON.stringify(state),
    );
  } catch {}
}
