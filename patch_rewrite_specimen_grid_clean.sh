#!/usr/bin/env bash
set -euo pipefail

FILE="apps/web/src/components/student/SpecimenGrid.tsx"
if [ ! -f "$FILE" ]; then
  echo "❌ Can't find $FILE"
  exit 1
fi

cp "$FILE" "$FILE.bak.$(date +%s)"

cat > "$FILE" <<'TSX'
export type Segment = {
  key: string;
  label: string;
  value: number; // expected 0..1
  group: string;
};

type Props = {
  segments: Segment[];
};

const ORGANISMS = [
  { match: "cell", name: "Amoeba", icon: "🦠" },
  { match: "cycle", name: "Zebrafish", icon: "🐟" },
  { match: "photosynthesis", name: "Elodea", icon: "🌿" },
  { match: "genetic", name: "Fruit Fly", icon: "🪰" },
  { match: "selection", name: "Finch", icon: "🐦" },
  { match: "ecosystem", name: "Wolf", icon: "🐺" },
  { match: "energy", name: "Mushroom", icon: "🍄" },
];

function pickOrganism(label: string) {
  const lower = (label || "").toLowerCase();
  return ORGANISMS.find((o) => lower.includes(o.match)) ?? { name: "Unknown organism", icon: "❔" };
}

export default function SpecimenGrid({ segments }: Props) {
  const unlocked = segments.map((seg) => ({
    ...seg,
    organism: pickOrganism(seg.label),
    unlocked: (Number(seg.value) || 0) >= 0.75,
    pct: Math.round((Number(seg.value) || 0) * 100),
  }));

  return (
    <div className="mt-6">
      <div className="mb-2 text-sm font-semibold text-slate-900">Specimens</div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {unlocked.map((s, i) => (
          <div
            key={s.key || i}
            className={`rounded-2xl border p-3 text-center transition ${
              s.unlocked ? "bg-white shadow-sm" : "bg-slate-50 opacity-50"
            }`}
            title={s.label}
          >
            <div className="text-3xl">{s.organism.icon}</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{s.organism.name}</div>
            <div className="text-xs text-slate-500">{s.pct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
TSX

echo "✅ Rewrote SpecimenGrid.tsx cleanly."
echo "Restart:"
echo "pnpm dev:web"
