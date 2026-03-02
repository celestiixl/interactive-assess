import * as React from "react";
import { GradientHeader } from "@/components/ui/GradientHeader";

export default function PageBanner({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <GradientHeader title={title} subtitle={subtitle}>
      {children}
    </GradientHeader>
  );
}
