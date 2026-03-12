"use client";

import { useMemo } from "react";
import { BackLink } from "@/components/nav/BackLink";
import { useParams } from "next/navigation";
import { getImportedPhenomenonBySlug } from "@/lib/phenomenaImports";

export default function ImportedPhenomenonPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const item = useMemo(() => getImportedPhenomenonBySlug(slug), [slug]);

  if (!item || item.status !== "approved") {
    return (
      <main className="mx-auto max-w-4xl p-6 text-slate-900">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-900">
            Imported phenomenon not available
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This imported HTML is missing or still pending approval.
          </p>
          <BackLink href="/phenomena-studio" label="Back to phenomena" />
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid var(--bs-border)",
          background: "var(--bs-surface)",
        }}
      >
        <BackLink href="/phenomena-studio" label="Back to phenomena" />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              border: "1px solid var(--bs-border)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              color: "var(--bs-text-sub)",
            }}
          >
            Imported
          </span>
          <span
            style={{
              border: "1px solid var(--bs-border)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              color: "var(--bs-text-sub)",
            }}
          >
            {item.slug}
          </span>
        </div>
      </header>

      <iframe
        srcDoc={item.html}
        width="100%"
        height="calc(100vh - 64px)"
        style={{
          border: "none",
          display: "block",
          height: "calc(100dvh - 64px)",
          flex: 1,
        }}
        title={item.title}
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </main>
  );
}
