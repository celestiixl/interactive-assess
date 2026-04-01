import { BackLink } from "@/components/nav/BackLink";
import { PageBanner, PageContent } from "@/components/ui";
import AssignmentMakerSection from "@/components/teacher/AssignmentMakerSection";

export default function NewAssignmentPage() {
  return (
    <main>
      <BackLink href="/teacher/dashboard" label="Back to dashboard" />
      <PageBanner
        title="New Assignment"
        subtitle="Build and publish a custom assignment from your question banks."
      />
      <PageContent className="py-8">
        <AssignmentMakerSection />
      </PageContent>
    </main>
  );
}
