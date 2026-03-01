import * as React from "react";
import Card from "./Card";

export default function StatCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Card variant="sm" className={className}>{children}</Card>;
}
