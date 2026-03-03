import * as React from "react";

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export default function Card({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "sm";
}) {
  const base =
    variant === "sm"
      ? "rounded-2xl border bg-white/70 backdrop-blur-sm p-5 shadow-sm"
      : "rounded-[28px] border bg-white/75 backdrop-blur-sm p-6 shadow-sm";

  return <div className={cx(base, className)}>{children}</div>;
}
