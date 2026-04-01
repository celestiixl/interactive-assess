import { BackLink } from "@/components/nav/BackLink";
import ContentQualitySection from "@/components/teacher/ContentQualitySection";

export default function TeacherContentQualityPage() {
  return (
    <main className="mx-auto w-full max-w-6xl p-6 text-bs-text">
      <BackLink href="/teacher/dashboard" label="Back to dashboard" />
      <section className="rounded-3xl border border-[var(--bs-border)] bg-bs-surface p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Content Quality Workflow</h1>
          <p className="mt-1 text-sm text-bs-text-sub">
            Review questions submitted for approval before publishing to all
            teachers.
          </p>
        </div>
      </section>

      <section className="mt-4">
        <ContentQualitySection />
      </section>
    </main>
  );
}

