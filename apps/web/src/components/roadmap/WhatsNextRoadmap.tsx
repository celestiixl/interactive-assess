import { Pill } from "@/components/ia/Pill";
import { Surface } from "@/components/ia/Surface";
import {
  buildRoadmapSections,
  type RoadmapItem,
  type RoadmapTone,
} from "@/lib/roadmap";

const ROADMAP_TONE_STYLES: Record<
  RoadmapTone,
  {
    panel: string;
    title: string;
    badge: string;
    text: string;
  }
> = {
  emerald: {
    panel: "border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.06)]",
    title: "text-[#4ade80]",
    badge: "border-emerald-300 text-[#4ade80]",
    text: "text-[#4ade80]",
  },
  teal: {
    panel: "border-[rgba(0,212,170,0.2)] bg-[rgba(0,212,170,0.06)]",
    title: "text-bs-teal",
    badge: "border-teal-300 text-bs-teal",
    text: "text-bs-teal",
  },
  amber: {
    panel: "border-[rgba(245,166,35,0.25)] bg-[rgba(245,166,35,0.06)]/80",
    title: "text-bs-amber",
    badge: "border-[rgba(245,166,35,0.25)] text-bs-amber",
    text: "text-bs-amber",
  },
};

export function WhatsNextRoadmap({
  items,
  footer,
}: {
  items: RoadmapItem[];
  footer?: string;
}) {
  const sections = buildRoadmapSections(items);

  return (
    <Surface className="p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-bs-text">What’s next</div>
        <Pill tone="amber">roadmap</Pill>
      </div>
      <div className="mt-4 space-y-3">
        {sections.map((section) => {
          const toneStyles = ROADMAP_TONE_STYLES[section.tone];

          return (
            <div
              key={section.title}
              className={`rounded-xl border p-3 ${toneStyles.panel}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`text-xs font-semibold uppercase tracking-wide ${toneStyles.title}`}
                >
                  {section.title}
                </div>
                <span
                  className={`rounded-full border bg-bs-surface px-2 py-0.5 text-[10px] font-semibold ${toneStyles.badge}`}
                >
                  {section.statusLabel}
                </span>
              </div>
              {section.items.length === 1 ? (
                <p className={`mt-1 text-sm ${toneStyles.text}`}>
                  {section.items[0]?.title}
                </p>
              ) : (
                <ul className={`mt-1 space-y-1 text-sm ${toneStyles.text}`}>
                  {section.items.map((item) => (
                    <li key={item.id}>{item.title}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      {footer ? (
        <div className="mt-4 text-xs text-bs-text-sub">{footer}</div>
      ) : null}
    </Surface>
  );
}
