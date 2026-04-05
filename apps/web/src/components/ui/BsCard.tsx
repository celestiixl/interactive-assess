import { ReactNode } from "react";

type CardVariant = "default" | "teal" | "coral" | "amber" | "purple" | "dark";

const variantClasses: Record<CardVariant, string> = {
  default: "bg-bs-surface border-bs-card-border",
  teal:    "bg-bs-teal-soft border-[rgba(0,196,154,0.15)]",
  coral:   "bg-bs-coral-soft border-[rgba(255,79,43,0.12)]",
  amber:   "bg-bs-amber-soft border-[rgba(245,168,0,0.15)]",
  purple:  "bg-bs-purple-soft border-[rgba(124,92,252,0.15)]",
  dark:    "bg-bs-ink border-transparent",
};

interface BsCardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
}

export default function BsCard({
  children,
  variant = "default",
  className = "",
}: BsCardProps) {
  return (
    <div
      className={`rounded-bs border p-4 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
