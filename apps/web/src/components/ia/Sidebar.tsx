import { Surface } from "./Surface";
import { NavigationSidebar } from "@/components/ui";

export function Sidebar({
  activeKey: _activeKey,
}: {
  activeKey?: "assessment" | "student_lab" | "items" | "practice" | "teacher";
}) {
  return (
    <Surface className="p-4">
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
        ]}
      />

      <div className="mt-5 rounded-2xl border border-[var(--bs-border)]  p-4">
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
  );
}
