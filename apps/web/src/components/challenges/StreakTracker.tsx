type Props = {
  streak: number;
};

export default function StreakTracker({ streak }: Props) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-amber-900">Quest Streak</div>
          <div className="text-xs text-amber-800">Keep practicing every day to grow rewards.</div>
        </div>
        <div className="flex items-center gap-2 text-2xl font-bold text-amber-700">
          <span className="ia-flame">🔥</span>
          <span>{streak}</span>
        </div>
      </div>
    </div>
  );
}
