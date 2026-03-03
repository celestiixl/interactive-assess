type Props = {
  topicSummaries: Array<{
    topic: string;
    difficulty: 1 | 2 | 3;
    highStreak: number;
    lowStreak: number;
  }>;
};

export default function AdaptiveEngine({ topicSummaries }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Mission Difficulty Engine</h3>
      <p className="mt-1 text-xs text-slate-600">
        Difficulty rises after 3 consecutive &gt;80% checks and drops after 2 consecutive &lt;50% checks per topic.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {topicSummaries.map((row) => (
          <div key={row.topic} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700">
            <div className="font-semibold text-slate-900">{row.topic}</div>
            <div>Difficulty: {row.difficulty}</div>
            <div>High streak: {row.highStreak} • Low streak: {row.lowStreak}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
