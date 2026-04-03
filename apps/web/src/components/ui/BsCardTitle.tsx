import { ReactNode } from "react";

interface BsCardTitleProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-[15px]",
  md: "text-[17px]",
  lg: "text-[22px]",
};

export default function BsCardTitle({
  children,
  size = "md",
  className = "",
}: BsCardTitleProps) {
  return (
    <h3
      className={`font-display font-bold leading-snug tracking-tight text-bs-ink ${sizeClasses[size]} ${className}`}
    >
      {children}
    </h3>
  );
}
