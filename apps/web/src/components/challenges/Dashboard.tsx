import type { StudentProfile } from "@/types/challenge";
import { NoiseBackground } from "@/components/ui/noise-background";
import { ImagesBadge } from "@/components/ui/images-badge";
import { Tooltip as TooltipCard } from "@/components/ui/tooltip-card";

type Props = {
  profile: StudentProfile;
  levelTitle: string;
  xpInLevel: number;
  xpToNextLevel: number;
  dailyHook: string;
  topicMastery: Array<{ topic: string; percent: number }>;
  onQuickStart: () => void;
};

export default function Dashboard({
  profile,
  levelTitle,
  xpInLevel,
  xpToNextLevel,
  dailyHook,
  topicMastery,
  onQuickStart,
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round((xpInLevel / xpToNextLevel) * 100)));

  return (
    <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-bs-text">BioSpark Quest</h1>
            <p className="mt-1 text-sm text-bs-text-sub">Bite-sized missions. Instant feedback. Real-world biology.</p>
            <div className="mt-2">
              <ImagesBadge
                text="Your active biology mission feed"
                images={[
                  "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=240&q=60",
                  "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=240&q=60",
                  "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=240&q=60",
                ]}
                className="ia-vh-text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={onQuickStart}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Start Mission
          </button>
        </div>

        <div className="mt-3">
          <NoiseBackground
            containerClassName="rounded-xl border border-[var(--bs-border)] p-1.5"
            className="rounded-lg bg-bs-surface p-2.5"
            gradientColors={[
              "rgb(99, 102, 241)",
              "rgb(16, 185, 129)",
              "rgb(59, 130, 246)",
            ]}
            noiseIntensity={0.12}
            speed={0.06}
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">Today’s Hook</div>
            <p className="mt-1 text-sm text-bs-text">{dailyHook}</p>
          </NoiseBackground>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--bs-border)] p-2.5">
          <div className="flex items-center justify-between text-sm font-semibold text-bs-text">
            <span>XP Progress</span>
            <span>{xpInLevel}/{xpToNextLevel}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/5">
            <div className="ia-xp-fill h-full rounded-full bg-linear-to-r from-violet-500 to-emerald-400" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 text-xs text-bs-text-sub">Level {profile.level}: {levelTitle}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-3 sm:p-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-bs-text-sub">Explorer Profile</h2>
        <div className="mt-3 text-sm text-bs-text">
          <div><span className="font-semibold">Name:</span> {profile.name || "New Explorer"}</div>
          <div><span className="font-semibold">Class Code:</span> {profile.classCode}</div>
          <div><span className="font-semibold">Total XP:</span> {profile.xp}</div>
          <div><span className="font-semibold">Badges:</span> {profile.badges.length}</div>
        </div>

        <div className="mt-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-bs-text-sub">Topic Mastery</div>
          <div className="mt-2 grid gap-1.5">
            {topicMastery.map((row) => (
              <div key={row.topic} className="rounded-lg border border-[var(--bs-border)] p-1.5 text-xs">
                <div className="mb-1 flex items-center justify-between text-bs-text-sub">
                  <TooltipCard
                    content={`Mastery for ${row.topic}. Keep answering mission checks correctly to raise this percentage.`}
                  >
                    <span className="cursor-help underline decoration-dotted underline-offset-2">
                      {row.topic}
                    </span>
                  </TooltipCard>
                  <span>{row.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${row.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
