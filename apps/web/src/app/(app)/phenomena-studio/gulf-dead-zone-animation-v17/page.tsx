"use client";

import Link from "next/link";

export default function GulfDeadZoneLessonPage() {
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
        <Link
          href="/student/learn/unit-6"
          style={{
            textDecoration: "none",
            color: "var(--bs-text)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {"← Unit 6: Ecosystems"}
        </Link>

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
            B.10C
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
            B.13C
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
            B.13D
          </span>
        </div>
      </header>

      <iframe
        src="/animations/gulf_dead_zone.html"
        width="100%"
        height="calc(100vh - 64px)"
        style={{
          border: "none",
          display: "block",
          height: "calc(100dvh - 64px)",
          flex: 1,
        }}
        title="Gulf Dead Zone Interactive Lesson"
      />
    </main>
  );
}
