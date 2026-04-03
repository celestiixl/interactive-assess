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
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        zIndex: 9999,
        background: "#f5a800",
        color: "#412402",
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 20,
        letterSpacing: "0.05em",
        fontFamily: "monospace",
        pointerEvents: "none",
      }}
    >
      DEV BYPASS ACTIVE
    </div>
  );
}
