import Link from "next/link";
import { Surface } from "./Surface";
import { NavigationSidebar } from "@/components/ui";

const MOBILE_NAV = [
  { href: "/assessment", icon: "🏠", label: "Home" },
  { href: "/student/learn", icon: "📚", label: "Learn" },
  { href: "/practice", icon: "⚡", label: "Practice" },
  { href: "/teacher/dashboard", icon: "📊", label: "Teacher" },
];

export function Sidebar({
  activeKey: _activeKey,
}: {
  activeKey?: "assessment" | "student_lab" | "items" | "practice" | "teacher";
}) {
  return (
    <>
      {/* Mobile bottom tab bar - visible only below md breakpoint */}
      <nav
        aria-label="Main navigation"
        className="mobile-safe fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-bs-border bg-bs-surface md:hidden"
      >
        {MOBILE_NAV.map(({ href, icon, label }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 text-bs-text-sub transition-colors hover:text-bs-teal"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {icon}
            </span>
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop sidebar - visible only at md+ */}
      <Surface className="hidden p-4 md:block">
        <div className="mb-4">
          <div className="text-sm font-semibold text-bs-text">Navigation</div>
          <div className="mt-1 text-xs text-bs-text-sub">
            Jump between roles and test screens.
          </div>
        </div>

        <NavigationSidebar
          items={[
            {
              href: "/assessment",
              label: "Assessment Home",
              description: "Choose student or teacher flows",
            },
            {
              href: "/student/assessment",
              label: "Student Assessment Lab",
              description: "Sandbox for student routes",
            },
            {
              href: "/student/assessment/items",
              label: "Items Test Screen",
              description: "Validate item rendering",
            },
            {
              href: "/practice",
              label: "Practice Runner",
              description: "Run checks and mastery practice",
            },
            {
              href: "/student/learn",
              label: "BioSpark Quest",
              description: "Micro-challenges, adaptive difficulty, XP",
            },
            {
              href: "/student/profile",
              label: "My Profile",
              description: "XP, badges, streak, and mastery",
            },
            {
              href: "/teacher/dashboard",
              label: "Teacher Dashboard",
              description: "Builder, analytics, and assignment flow",
            },
            {
              href: "/teacher/assignments/create",
              label: "New Assignment",
              description: "Build and publish a custom assignment",
            },
          ]}
        />

        <div className="mt-5 rounded-2xl border border-[var(--bs-border)] p-4">
          <div className="text-xs font-semibold text-bs-text-sub">Status</div>
          <div className="mt-2 text-sm text-bs-text">
            <span className="font-semibold">Mode:</span> prototype
          </div>
          <div className="mt-1 text-sm text-bs-text">
            <span className="font-semibold">Next build:</span> Inline Choice
            first-class
          </div>
        </div>
      </Surface>
    </>
  );
}
