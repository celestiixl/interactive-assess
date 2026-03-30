import Link from "next/link";
import type { QuestLeaderRow } from "@/lib/questRankings";

type Props = {
  rows: QuestLeaderRow[];
};

export default function RankingsPreview({ rows }: Props) {
  const topStudents = [...rows].sort((a, b) => b.xp - a.xp).slice(0, 3);

  const classTotals = [...rows].reduce<Record<string, number>>((acc, row) => {
    acc[row.classCode] = (acc[row.classCode] ?? 0) + row.xp;
    return acc;
  }, {});

  const topClasses = Object.entries(classTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  return (
    <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-bs-text-sub">Rankings Snapshot</h3>
        <Link
          href="/student/learn/rankings"
          className="rounded-lg border border-[var(--bs-border)] px-2.5 py-1 text-xs font-semibold text-bs-text-sub hover:bg-[var(--bs-raised)]"
        >
          Open full
        </Link>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">Top classes</div>
          <div className="mt-2 space-y-1.5 text-xs">
            {topClasses.map(([code, xp], idx) => (
              <div key={code} className="flex items-center justify-between">
                <span className="font-semibold text-bs-text">#{idx + 1} {code}</span>
                <span className="font-bold text-violet-700">{xp}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--bs-border)] bg-[var(--bs-raised)] p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">Top students</div>
          <div className="mt-2 space-y-1.5 text-xs">
            {topStudents.map((student, idx) => (
              <div key={student.name} className="flex items-center justify-between">
                <span className="font-semibold text-bs-text">
                  {student.avatar} #{idx + 1} {student.name}
                </span>
                <span className="font-bold text-violet-700">{student.xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
