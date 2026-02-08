import type { ReactNode } from "react";
import { ActiveShell } from "@/components/ia/ActiveShell";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <ActiveShell>{children}</ActiveShell>;
}
