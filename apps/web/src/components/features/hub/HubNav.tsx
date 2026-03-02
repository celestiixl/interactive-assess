import { NavigationSidebar } from "@/components/ui/NavigationSidebar";

export function HubNav() {
  return (
    <NavigationSidebar
      items={[
        { href: "/assessment", label: "Assessment Hub", description: "Choose student or teacher route" },
        { href: "/student/dashboard", label: "Student Dashboard", description: "Mastery progress and streaks" },
        { href: "/teacher/builder", label: "Question Builder", description: "Author and preview items" },
      ]}
    />
  );
}
