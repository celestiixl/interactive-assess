type Props = {
  streak: number;
};

export default function StreakTracker({ streak }: Props) {
  return (
    <div className="rounded-2xl border border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.06)] p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-bs-amber">Quest Streak</div>
          <div className="text-xs text-bs-amber">Keep practicing every day to grow rewards.</div>
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold text-bs-amber">
          <span className="ia-flame">🔥</span>
          <span>{streak}</span>
        </div>
      </div>
    </div>
  );
}
