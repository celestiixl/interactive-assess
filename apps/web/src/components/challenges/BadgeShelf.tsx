import { BADGE_MILESTONES } from "@/lib/challengeData";
import { Tooltip as TooltipCard } from "@/components/ui/tooltip-card";

type Props = {
  earnedBadges: string[];
};

export default function BadgeShelf({ earnedBadges }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--bs-border)] bg-bs-surface p-3">
      <h3 className="text-sm font-bold text-bs-text">Trophy Vault</h3>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {BADGE_MILESTONES.map((badge) => {
          const unlocked = earnedBadges.includes(badge.key);
          return (
            <TooltipCard
              key={badge.key}
              content={
                <div>
                  <div className="font-semibold text-bs-text dark:text-bs-text">
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
                    ? "border-emerald-200 bg-[rgba(74,222,128,0.06)]"
                    : "border-[var(--bs-border)] bg-[var(--bs-raised)]"
                }`}
              >
                <div className="text-sm font-semibold text-bs-text">
                  {unlocked ? "🏅" : "🔒"} {badge.label}
                </div>
                <p className="mt-1 text-xs text-bs-text-sub">{badge.description}</p>
              </div>
            </TooltipCard>
          );
        })}
      </div>
    </div>
  );
}
