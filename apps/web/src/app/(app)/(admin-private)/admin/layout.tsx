"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/adminAuth";

/**
 * Guards all /admin/* routes (except /admin/login which lives in (admin-public)).
 * Redirects to /admin/login when no admin session exists.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!admin) {
      router.replace("/admin/login");
    }
  }, [admin, router]);

  // Render nothing until the client store has hydrated to avoid authenticated-content flash.
  if (!admin) return null;

  return <>{children}</>;
}
