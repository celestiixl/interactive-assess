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
    { label: "Admin dashboard", href: "/admin/dashboard" },
    { label: "Admin login", href: "/admin/login" },
    { label: "Beta join", href: "/beta/join" },
  ];

  return (
    <div className="mx-auto max-w-[480px] p-8 font-sans">
      <span className="mb-3 inline-block rounded-full bg-[#f5a800] px-2.5 py-[3px] font-mono text-[11px] font-bold tracking-[0.06em] text-[#412402]">
        DEV BYPASS ACTIVE
      </span>
      <h1 className="mb-1 mt-0 text-[22px] font-bold text-[#0a1a14]">
        BioSpark Dev Nav
      </h1>
      <p className="mb-5 mt-0 text-[13px] text-[#8aada0]">
        Quick links — local only, redirects to / in production
      </p>
      <div className="flex flex-col gap-2">
        {links.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            className="flex items-center justify-between rounded-[10px] border border-black/[0.08] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#006e55] no-underline"
          >
            {label}
            <span className="text-[12px] text-[#8aada0]">{href}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
