import SummaryClient from "@/components/teacher/AssignmentSummaryClient";

export default async function AssignmentSummaryPage({
  params,
}: {
  params: any;
}) {
  const p = await params;
  const assignmentId = p?.assignmentId;
  return <SummaryClient assignmentId={assignmentId} />;
}
