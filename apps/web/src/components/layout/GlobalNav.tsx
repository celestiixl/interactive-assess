"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import T from "@/lib/tokens";

export interface GlobalNavProps {
  role: "student" | "teacher";
  userName: string;
  avatarEmoji?: string;
}

function buildBreadcrumb(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments
    .map((seg) =>
      seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
    )
    .join(" / ");
}

export default function GlobalNav({
  role,
  userName,
  avatarEmoji = "👩🏽‍🔬",
}: GlobalNavProps) {
  const pathname = usePathname();
  const breadcrumb = buildBreadcrumb(pathname);

  return (
    <nav
      aria-label="Global navigation"
      style={{
        height: 56,
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: T.surface + "ee",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {/* Left: BioSpark logo mark */}
      <Link
        href="/"
        aria-label="BioSpark home"
        style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${T.teal}, #0099aa)`,
            boxShadow: T.tealGlow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          ⚡
        </div>
        <span style={{ fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: T.text }}>Bio</span>
          <span style={{ color: T.teal }}>Spark</span>
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: T.rPill,
            background: T.amberDim,
            color: T.amber,
            border: `1px solid ${T.amber}44`,
            fontSize: 10,
            fontWeight: 700,
            padding: "1px 7px",
          }}
        >
          Beta
        </span>
      </Link>

      {/* Center: breadcrumb */}
      {breadcrumb && (
        <span
          aria-label="Current location"
          style={{
            fontSize: 12,
            color: T.textMuted,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
            maxWidth: 340,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {breadcrumb}
        </span>
      )}

      {/* Right: role pill + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-label={`Role: ${role}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: T.rPill,
            background: role === "student" ? T.tealDim : T.amberDim,
            color: role === "student" ? T.teal : T.amber,
            border: `1px solid ${role === "student" ? T.teal : T.amber}44`,
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            textTransform: "capitalize",
          }}
        >
          {role}
        </span>
        <button
          aria-label={`${userName} — account menu`}
          style={{
            width: 34,
            height: 34,
            borderRadius: T.rPill,
            background: T.tealDim,
            border: `1.5px solid ${T.teal}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            cursor: "pointer",
            transition: `box-shadow ${T.durFast} ${T.easeOut}`,
          }}
          title={userName}
          aria-haspopup="menu"
        >
          {avatarEmoji}
        </button>
      </div>
    </nav>
  );
}
