"use client";

import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconBook2,
  IconChartDots3,
  IconFlask2,
  IconLayoutDashboard,
  IconListCheck,
  IconUserCircle,
} from "@tabler/icons-react";

export default function StudentFloatingDock() {
  const links = [
    {
      title: "Dashboard",
      icon: (
        <IconLayoutDashboard className="h-full w-full text-neutral-600 dark:text-neutral-300" />
      ),
      href: "/student/dashboard",
    },
    {
      title: "BioSpark Quest",
      icon: <IconFlask2 className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/student/learn",
    },
    {
      title: "Assignments",
      icon: <IconListCheck className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/student/assignments",
    },
    {
      title: "Simulations",
      icon: <IconChartDots3 className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/student/learn/simulations",
    },
    {
      title: "Assessment Lab",
      icon: <IconBook2 className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: "/student/assessment",
    },
    {
      title: "My Profile",
      icon: (
        <IconUserCircle className="h-full w-full text-neutral-600 dark:text-neutral-300" />
      ),
      href: "/student/profile",
    },
  ];

  return (
    <FloatingDock
      items={links}
      desktopClassName="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 border border-[var(--bs-border)] bg-white/90 shadow-lg backdrop-blur"
      mobileClassName="fixed right-4 bottom-4 z-40"
    />
  );
}
