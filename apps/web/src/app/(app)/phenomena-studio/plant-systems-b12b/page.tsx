"use client";

import { BackLink } from "@/components/nav/BackLink";

export default function PlantSystemsB12BInExplorerPage() {
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
          <a
            href="/lessons/plant-systems-b12b.html"
            download="plant-systems-b12b.html"
            style={{
              border: "1px solid var(--bs-border)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              color: "var(--bs-text-sub)",
              textDecoration: "none",
            }}
          >
            Download HTML
          </a>
          <span
            style={{
              border: "1px solid var(--bs-border)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              color: "var(--bs-text-sub)",
            }}
          >
            Unit 7
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
            B.12B
          </span>
        </div>
      </header>

      <iframe
        src="/lessons/plant-systems-b12b.html"
        width="100%"
        height="calc(100vh - 64px)"
        style={{
          border: "none",
          display: "block",
          height: "calc(100dvh - 64px)",
          flex: 1,
        }}
        title="Plant Systems B.12B Lesson"
      />
    </main>
  );
}
