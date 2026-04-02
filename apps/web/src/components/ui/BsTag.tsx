import { ReactNode } from "react";

type TagVariant = "teal" | "coral" | "amber" | "purple" | "gray" | "teal-inv";

const variantClasses: Record<TagVariant, string> = {
  teal:      "bg-[rgba(0,110,85,0.12)] text-bs-teal-dark",
  coral:     "bg-[rgba(255,79,43,0.13)] text-[#c02a10]",
  amber:     "bg-[rgba(245,168,0,0.18)] text-[#8a5e00]",
  purple:    "bg-[rgba(124,92,252,0.15)] text-[#4a2fc0]",
  gray:      "bg-[rgba(0,0,0,0.07)] text-bs-muted",
  "teal-inv":"bg-[rgba(0,196,154,0.18)] text-bs-teal",
};

interface BsTagProps {
  children: ReactNode;
  variant?: TagVariant;
  className?: string;
}

export default function BsTag({
  children,
  variant = "teal",
  className = "",
}: BsTagProps) {
  return (
    <span
      className={`inline-block rounded-bs-pill px-[10px] py-[3px] text-[10px] font-bold tracking-[0.04em] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
