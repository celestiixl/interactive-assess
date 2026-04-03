"use client";
import { ReactNode } from "react";

type BtnVariant = "teal" | "coral" | "ghost" | "hero";

const variantClasses: Record<BtnVariant, string> = {
  teal:  "bg-bs-teal-dark text-white border-transparent hover:opacity-90",
  coral: "bg-bs-coral text-white border-transparent hover:opacity-90",
  ghost: "bg-transparent text-bs-ink-2 border-[rgba(0,0,0,0.12)] hover:bg-bs-teal-soft",
  hero:  "bg-bs-teal text-bs-teal-deep border-transparent font-bold hover:opacity-90",
};

interface BsBtnProps {
  children: ReactNode;
  variant?: BtnVariant;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
  title?: string;
}

export default function BsBtn({
  children,
  variant = "ghost",
  className = "",
  ...props
}: BsBtnProps) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center gap-1 rounded-bs-sm border px-4 py-2 text-[13px] font-medium font-body transition-opacity ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
