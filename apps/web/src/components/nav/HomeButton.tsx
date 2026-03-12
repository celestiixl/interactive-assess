"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";
import { useTeacherAuth } from "@/lib/teacherAuth";

const DASHBOARD_PATHS = ["/student/dashboard", "/teacher/dashboard"];

export function HomeButton() {
  const pathname = usePathname();
  const { teacher } = useTeacherAuth();

  // Do not render on dashboard pages
  if (DASHBOARD_PATHS.some((p) => pathname === p)) return null;

  // Derive home destination from auth state
  const href = teacher ? "/teacher/dashboard" : "/student/dashboard";

  return (
    <Link
      href={href}
      title="Home"
      aria-label="Home"
      className="fixed left-4 top-4 z-50 rounded-lg bg-[#132638] p-2 transition-colors hover:bg-[#1a3148] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa] focus-visible:ring-offset-2"
      style={{ border: "1px solid rgba(0,212,170,0.2)" }}
    >
      <Home size={18} color="#9abcb0" aria-hidden="true" />
    </Link>
  );
}
