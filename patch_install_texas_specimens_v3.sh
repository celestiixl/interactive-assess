#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/workspaces/interactive-assess}"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

WEB_SRC="apps/web/src"
if [ ! -d "$WEB_SRC" ]; then
  echo "❌ can't find $WEB_SRC"
  exit 1
fi

echo "== Create specimen files =="
mkdir -p "$WEB_SRC/lib/specimens" "$WEB_SRC/components/student"

cat > "$WEB_SRC/lib/specimens/texasSpecimens.ts" <<'TS'
export type Specimen = {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  unlockHint: string;
  icon: string; // placeholder; swap to SVG later
};

// Keys must match your Reporting Category keys (segment.key).
// If your keys are not RC1–RC6, replace them here to match.
export const TEXAS_SPECIMENS: Record<string, Specimen> = {
  RC1: {
    id: "bluebonnet",
    title: "Texas Bluebonnet",
    subtitle: "State flower • Structure & function",
    region: "Central Texas",
    unlockHint: "Reach 80% mastery to unlock",
    icon: "🌸",
  },
  RC2: {
    id: "kemp-ridley",
    title: "Kemp’s Ridley Sea Turtle",
    subtitle: "Endangered • Gulf Coast food webs",
    region: "Gulf Coast",
    unlockHint: "Reach 80% mastery to unlock",
    icon: "🐢",
  },
  RC3: {
    id: "horned-lizard",
    title: "Texas Horned Lizard",
    subtitle: "Adaptations • Survival & selection",
    region: "West/Central Texas",
    unlockHint: "Reach 80% mastery to unlock",
    icon: "🦎",
  },
  RC4: {
    id: "free-tailed-bat",
    title: "Mexican Free-tailed Bat",
    subtitle: "Bracken Cave • Populations & energy flow",
    region: "Hill Country",
    unlockHint: "Reach 80% mastery to unlock",
    icon: "🦇",
  },
  RC5: {
    id: "golden-cheeked-warbler",
    title: "Golden-cheeked Warbler",
    subtitle: "Endemic • Habitat + biodiversity",
    region: "Edwards Plateau",
    unlockHint: "Reach 80% mastery to unlock",
    icon: "🐦",
  },
  RC6: {
    id: "salt-marsh",
    title: "Gulf Coast Salt Marsh",
    subtitle: "Nutrient cycling • Estuary systems",
    region: "Coastal Texas",
    unlockHint: "Reach 80% mastery to unlock",
    icon: "🌾",
  },
};
TS

cat > "$WEB_SRC/lib/specimens/unlocks.ts" <<'TS'
const KEY = "specimen_unlocks_v1";

export type UnlockState = Record<string, boolean>;

export function readUnlocks(): UnlockState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeUnlocks(state: UnlockState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function unlockIfQualified(rcKey: string, masteryPct: number, threshold = 80) {
  if (typeof window === "undefined") return { changed: false, state: {} as UnlockState };

  const prev = readUnlocks();
  if (prev[rcKey]) return { changed: false, state: prev };
  if (masteryPct < threshold) return { changed: false, state: prev };

  const next = { ...prev, [rcKey]: true };
  writeUnlocks(next);
  return { changed: true, state: next };
}
TS

cat > "$WEB_SRC/components/student/SpecimenGrid.tsx" <<'TSX'
"use client";

import { useEffect, useMemo, useState } from "react";
import { TEXAS_SPECIMENS, type Specimen } from "@/lib/specimens/texasSpecimens";
import { readUnlocks, unlockIfQualified, type UnlockState } from "@/lib/specimens/unlocks";

export type SpecimenSegment = { key: string; label?: string; value: number };

function SpecimenCard({
  specimen,
  unlocked,
  masteryPct,
  rcLabel,
}: {
  specimen: Specimen;
  unlocked: boolean;
  masteryPct: number;
  rcLabel?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-neutral-500">{rcLabel ?? "Reporting Category"}</div>
          <div className="mt-1 text-lg font-semibold tracking-tight">
            {unlocked ? specimen.title : "Locked Specimen"}
          </div>
          <div className="mt-1 text-sm text-neutral-600">
            {unlocked ? specimen.subtitle : specimen.unlockHint}
          </div>
        </div>
        <div className="text-2xl leading-none select-none">{unlocked ? specimen.icon : "🔒"}</div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-neutral-600">
        <div>{unlocked ? specimen.region : "Texas specimen card"}</div>
        <div className="tabular-nums">{Math.round(masteryPct)}%</div>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full bg-neutral-900/20"
          style={{ width: `${Math.max(0, Math.min(100, masteryPct))}%` }}
        />
      </div>
    </div>
  );
}

export default function SpecimenGrid({
  segments,
  threshold = 80,
  title = "Texas Specimens",
  subtitle = "Unlock a Texas specimen card as you build mastery.",
}: {
  segments: SpecimenSegment[];
  threshold?: number;
  title?: string;
  subtitle?: string;
}) {
  const [unlocks, setUnlocks] = useState<UnlockState>({});

  useEffect(() => {
    setUnlocks(readUnlocks());
  }, []);

  useEffect(() => {
    if (!segments?.length) return;

    let next = readUnlocks();
    let changedAny = false;

    for (const s of segments) {
      const pct = typeof s.value === "number" ? s.value : 0;
      const r = unlockIfQualified(s.key, pct, threshold);
      if (r.changed) {
        changedAny = true;
        next = r.state;
      }
    }

    if (changedAny) setUnlocks(next);
  }, [segments, threshold]);

  const cards = useMemo(() => {
    return segments.map((s) => {
      const specimen = TEXAS_SPECIMENS[s.key];
      const fallback: Specimen = {
        id: `generic-${s.key}`,
        title: "Texas Specimen",
        subtitle: "Map this category key in texasSpecimens.ts",
        region: "Texas",
        unlockHint: "Reach 80% mastery to unlock",
        icon: "🧪",
      };

      return {
        key: s.key,
        rcLabel: s.label ?? s.key,
        masteryPct: s.value ?? 0,
        specimen: specimen ?? fallback,
        unlocked: !!unlocks[s.key],
      };
    });
  }, [segments, unlocks]);

  return (
    <section className="mt-8">
      <div className="mb-3">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-neutral-600">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <SpecimenCard
            key={c.key}
            specimen={c.specimen}
            unlocked={c.unlocked}
            masteryPct={c.masteryPct}
            rcLabel={c.rcLabel}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        If you don’t see unlocks: make sure TEXAS_SPECIMENS keys match your segment keys.
      </p>
    </section>
  );
}
TSX

echo "== Patch dashboard page to render SpecimenGrid =="

DASH=""
if [ -f "apps/web/src/app/(app)/student/dashboard/page.tsx" ]; then
  DASH="apps/web/src/app/(app)/student/dashboard/page.tsx"
elif [ -f "apps/web/src/app/student/dashboard/page.tsx" ]; then
  DASH="apps/web/src/app/student/dashboard/page.tsx"
else
  # best-effort search
  if command -v rg >/dev/null 2>&1; then
    DASH="$(rg -l 'Student Dashboard' apps/web/src/app 2>/dev/null | head -n 1 || true)"
  fi
fi

if [ -z "${DASH:-}" ] || [ ! -f "$DASH" ]; then
  echo "⚠️ could not find dashboard page to patch."
  echo "   Render manually wherever you want:"
  echo '   <SpecimenGrid segments={segments} />'
  exit 0
fi

cp "$DASH" "$DASH.bak.$(date +%Y%m%d_%H%M%S)"

python3 - <<PY
from pathlib import Path
p = Path("$DASH")
s = p.read_text(encoding="utf-8")

# add import if missing
if "SpecimenGrid" not in s or 'from "@/components/student/SpecimenGrid"' not in s:
    if 'import SpecimenGrid' not in s:
        lines = s.splitlines()
        import_idxs = [i for i,l in enumerate(lines) if l.startswith("import ")]
        ins = 'import SpecimenGrid from "@/components/student/SpecimenGrid";'
        if import_idxs:
            lines.insert(import_idxs[-1]+1, ins)
        else:
            lines.insert(0, ins)
        s = "\n".join(lines) + ("\n" if not s.endswith("\n") else "")

# insert render if missing
if "<SpecimenGrid" not in s:
    if "<MasteryDonut" in s and "segments={segments}" in s:
        s = s.replace(
            "<MasteryDonut segments={segments} />",
            "<MasteryDonut segments={segments} />\n          <SpecimenGrid segments={segments} />",
            1
        )
    else:
        # fallback: insert before closing </main> if present
        if "</main>" in s:
            s = s.replace("</main>", "  <SpecimenGrid segments={segments} />\n    </main>", 1)

p.write_text(s, encoding="utf-8")
print(f"✅ Patched: {p}")
PY

echo ""
echo "== Confirm files now exist =="
ls -la "$WEB_SRC/components/student/SpecimenGrid.tsx"
ls -la "$WEB_SRC/lib/specimens/texasSpecimens.ts"
ls -la "$WEB_SRC/lib/specimens/unlocks.ts"

echo ""
echo "✅ Texas specimens installed."
echo "If nothing unlocks, update TEXAS_SPECIMENS keys to match your segment keys."
