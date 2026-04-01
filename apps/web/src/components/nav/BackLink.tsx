"use client";

import Link from "next/link";
import type { BackLinkProps } from "@/types/navigation";

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="fixed left-16 top-4 z-50 font-[DynaPuff] text-[13px] text-[#9abcb0] no-underline transition-colors hover:text-[#e8f4f0] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4aa]"
    >
      ← {label}
    </Link>
  );
}
