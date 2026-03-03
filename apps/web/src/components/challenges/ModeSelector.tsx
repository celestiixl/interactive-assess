import type { ChallengeMode } from "@/types/challenge";

type Props = {
  selectedMode: ChallengeMode;
  availableModes: Record<ChallengeMode, boolean>;
  onSelect: (mode: ChallengeMode) => void;
};

const MODE_META: Array<{ mode: ChallengeMode; label: string; icon: string }> = [
  { mode: "video", label: "Video", icon: "📹" },
  { mode: "interactive", label: "Interactive", icon: "🎮" },
  { mode: "visual", label: "Visual", icon: "🖼" },
  { mode: "text", label: "Text", icon: "📝" },
];

export default function ModeSelector({ selectedMode, availableModes, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
        Choose mission style
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MODE_META.map((item) => {
          const active = selectedMode === item.mode;
          const enabled = availableModes[item.mode];
          return (
            <button
              key={item.mode}
              type="button"
              disabled={!enabled}
              onClick={() => onSelect(item.mode)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "border-violet-400 bg-violet-50 text-violet-800"
                  : enabled
                    ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              }`}
            >
              <span className="mr-1">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
