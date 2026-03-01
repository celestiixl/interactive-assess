"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageContent, PageBanner, Card } from "@/components/ui";

type Assignment = {
  id: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function TeacherAssessmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/assignments`)
      .then((r) => r.json())
      .then((d) => {
        // Expecting an array or { items: [] }
        if (Array.isArray(d)) setAssignments(d);
        else if (d?.items) setAssignments(d.items);
        else setAssignments([]);
      })
      .catch((e) => {
        console.error(e);
        setAssignments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <PageBanner
        title="Assessments"
        subtitle="A list of your assignments will appear here."
      />
      <PageContent className="py-6">
        <Card className="p-4">
          {loading ? (
            <div>Loading…</div>
          ) : assignments && assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">{a.title || a.id}</div>
                    <div className="text-xs text-slate-500">
                      {a.updatedAt
                        ? new Date(a.updatedAt).toLocaleString()
                        : a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString()
                          : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/teacher/assignments/${encodeURIComponent(a.id)}/summary`}
                      className="ia-btn-xs"
                    >
                      Summary
                    </Link>
                    <Link
                      href={`/teacher/assignments/${encodeURIComponent(a.id)}/edit`}
                      className="ia-btn-xs"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="text-slate-700">No assessments found.</div>
              <div className="mt-4">
                <Link href="/teacher/builder" className="ia-btn">
                  Create an assessment
                </Link>
              </div>
            </div>
          )}
        </Card>

        <div>
          <Link
            href="/teacher/dashboard"
            className="text-sm text-slate-500 underline"
          >
            Back to dashboard
          </Link>
        </div>
      </PageContent>
    </main>
  );
}
