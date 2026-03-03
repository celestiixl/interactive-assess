import { BADGE_MILESTONES } from "@/lib/challengeData";
import { Tooltip as TooltipCard } from "@/components/ui/tooltip-card";

type Props = {
  earnedBadges: string[];
};

export default function BadgeShelf({ earnedBadges }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <h3 className="text-sm font-bold text-slate-900">Trophy Vault</h3>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {BADGE_MILESTONES.map((badge) => {
          const unlocked = earnedBadges.includes(badge.key);
          return (
            <TooltipCard
              key={badge.key}
              content={
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {badge.label}
                  </div>
                  <p className="mt-1 text-xs">{badge.description}</p>
                  <p className="mt-2 text-[11px] opacity-80">
                    {unlocked ? "Unlocked in your vault." : "Locked: complete the milestone to unlock."}
                  </p>
                </div>
              }
            >
              <div
                className={`cursor-help rounded-xl border p-2.5 transition ${
                  unlocked
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">
                  {unlocked ? "🏅" : "🔒"} {badge.label}
                </div>
                <p className="mt-1 text-xs text-slate-600">{badge.description}</p>
              </div>
            </TooltipCard>
          );
        })}
      </div>
    </div>
  );
}
