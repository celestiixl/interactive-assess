#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/workspaces/interactive-assess}"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

# ---- locate apps/web root (supports common Next layouts) ----
if [ -d "apps/web/src" ]; then
  WEB_ROOT="apps/web/src"
elif [ -d "apps/web" ]; then
  WEB_ROOT="apps/web"
else
  echo "❌ can't find apps/web (looked for apps/web/src and apps/web)"
  exit 1
fi

mkdir -p "$WEB_ROOT/lib/specimens" "$WEB_ROOT/components/student"

# ---- create Texas specimen map ----
cat > "$WEB_ROOT/lib/specimens/texasSpecimens.ts" <<'TS'
export type Specimen = {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  unlockHint: string;
  icon: string; // placeholder; swap to SVG later if you want
};

// NOTE: Keys should match your Reporting Category keys.
// If your segments keys are like "BIO.1A" etc, replace RC1..RC6 with those keys later.
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

# ---- create unlock helpers (localStorage) ----
cat > "$WEB_ROOT/lib/specimens/unlocks.ts" <<'TS'
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
  const already = !!prev[rcKey];
  const shouldUnlock = masteryPct >= threshold;

  if (already || !shouldUnlock) return { changed: false, state: prev };

  const next = { ...prev, [rcKey]: true };
  writeUnlocks(next);
  return { changed: true, state: next };
}
TS

# ---- create SpecimenGrid component ----
cat > "$WEB_ROOT/components/student/SpecimenGrid.tsx" <<'TSX'
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

  // Attempt unlocks when segments update (client-side)
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
    // Use TEXAS_SPECIMENS for known keys; otherwise fall back to a generic locked card per segment
    return segments.map((s) => {
      const specimen = TEXAS_SPECIMENS[s.key];
      return {
        key: s.key,
        rcLabel: s.label ?? s.key,
        masteryPct: s.value ?? 0,
        specimen: specimen ?? ({
          id: `generic-${s.key}`,
          title: "Texas Specimen",
          subtitle: "Add a specimen mapping for this category key.",
          region: "Texas",
          unlockHint: "Reach 80% mastery to unlock",
          icon: "🧪",
        } as Specimen),
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
        Tip: If your category keys aren’t RC1–RC6, update TEXAS_SPECIMENS keys to match your segments keys.
      </p>
    </section>
  );
}
TSX

# ---- patch Student Dashboard to render SpecimenGrid (best-effort) ----
DASH_PAGE="$(rg -l "Student Dashboard" apps/web 2>/dev/null | head -n 1 || true)"
if [ -z "${DASH_PAGE:-}" ]; then
  # common fallback
  if [ -f "apps/web/src/app/(app)/student/dashboard/page.tsx" ]; then
    DASH_PAGE="apps/web/src/app/(app)/student/dashboard/page.tsx"
  elif [ -f "apps/web/src/app/student/dashboard/page.tsx" ]; then
    DASH_PAGE="apps/web/src/app/student/dashboard/page.tsx"
  else
    DASH_PAGE=""
  fi
fi

if [ -n "${DASH_PAGE:-}" ] && [ -f "$DASH_PAGE" ]; then
  echo "✅ Found dashboard page: $DASH_PAGE"
  cp "$DASH_PAGE" "$DASH_PAGE.bak.$(date +%Y%m%d_%H%M%S)"

  # 1) add import if missing
  if ! rg -q 'SpecimenGrid' "$DASH_PAGE"; then
    perl -0777 -i -pe 's/(^.*from\s+["'\''][^"'\'']+["'\''];\s*\n)/$1import SpecimenGrid from "@/components\/student\/SpecimenGrid";\n/m' "$DASH_PAGE" || true
  fi

  # 2) inject component near MasteryDonut render
  if ! rg -q 'SpecimenGrid segments=\{segments\}' "$DASH_PAGE"; then
    perl -0777 -i -pe 's/(<MasteryDonut[^>]*segments=\{segments\}[^>]*\/>\s*)/$1\n          <SpecimenGrid segments={segments} \/>\n/s' "$DASH_PAGE" || true
  fi

  echo "✅ Dashboard patched (renders Texas Specimens grid)."
else
  echo "⚠️ Could not auto-find Student Dashboard page to patch."
  echo "   You can manually render it wherever you want with:"
  echo '   <SpecimenGrid segments={segments} />'
fi

echo ""
echo "✅ Added Texas specimen cards + unlock system."
echo "Next: update TEXAS_SPECIMENS keys to match your real segment keys (RCs)."
