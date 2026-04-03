import { redirect } from "next/navigation";

export default function DevPage() {
  if (process.env.NEXT_PUBLIC_DEV_BYPASS !== "true") {
    redirect("/");
  }

  const links = [
    { label: "Student dashboard", href: "/student/dashboard" },
    { label: "Student learning hub", href: "/student/learning-hub" },
    { label: "Student assignments", href: "/student/assignments" },
    { label: "Student standards", href: "/student/learn/standards" },
    { label: "Student profile", href: "/student/profile" },
    { label: "Teacher dashboard", href: "/teacher/dashboard" },
    { label: "Teacher analytics", href: "/teacher/learning-analytics" },
    { label: "Teacher controls", href: "/teacher/learning-controls" },
    { label: "Assessment", href: "/assessment" },
  ];

  return (
    <div
      style={{
        fontFamily: "system-ui",
        padding: 32,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: "#f5a800",
          color: "#412402",
          fontSize: 11,
          fontWeight: 700,
          padding: "3px 10px",
          borderRadius: 20,
          letterSpacing: "0.06em",
          fontFamily: "monospace",
          marginBottom: 12,
        }}
      >
        DEV BYPASS ACTIVE
      </div>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: "0 0 4px",
          color: "#0a1a14",
        }}
      >
        BioSpark Dev Nav
      </h1>
      <p
        style={{
          fontSize: 13,
          color: "#8aada0",
          marginTop: 0,
          marginBottom: 20,
        }}
      >
        Quick links — local only, redirects to / in production
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              color: "#006e55",
              textDecoration: "none",
            }}
          >
            {label}
            <span style={{ color: "#8aada0", fontSize: 12 }}>{href}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
