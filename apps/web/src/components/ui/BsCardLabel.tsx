import { ReactNode } from "react";

interface BsCardLabelProps {
  children: ReactNode;
  className?: string;
}

export default function BsCardLabel({ children, className = "" }: BsCardLabelProps) {
  return (
    <p className={`mb-[7px] text-[10px] font-semibold uppercase tracking-[0.08em] text-bs-muted ${className}`}>
      {children}
    </p>
  );
}
