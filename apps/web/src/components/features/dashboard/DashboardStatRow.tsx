import * as React from "react";
import StatCard from "@/components/ui/StatCard";

export function DashboardStatRow({
  stats,
}: {
  stats: Array<{ label: string; value: number | string; cta?: React.ReactNode; icon?: React.ReactNode }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          cta={stat.cta}
        />
      ))}
    </div>
  );
}
