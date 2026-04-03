"use client";

import { useDevBypass } from "@/lib/devBypass";

/**
 * Wires in the dev bypass hook and renders the amber "DEV BYPASS ACTIVE"
 * badge when NEXT_PUBLIC_DEV_BYPASS=true.
 * Renders nothing in production.
 */
export default function DevBypassProvider() {
  useDevBypass();

  if (process.env.NEXT_PUBLIC_DEV_BYPASS !== "true") return null;

  return (
    <div className="fixed bottom-3 left-3 z-[9999] pointer-events-none bg-[#f5a800] text-[#412402] text-[11px] font-bold font-mono py-1 px-2.5 rounded-full tracking-[0.05em]">
      DEV BYPASS ACTIVE
    </div>
  );
}
