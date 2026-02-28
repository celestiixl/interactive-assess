#!/usr/bin/env bash
set -euo pipefail

REPO="/workspaces/interactive-assess"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

echo "🧩 Adding accommodations (Dashboard + Practice)"

# ---- Paths (best-effort) ----
DASH="apps/web/src/app/(app)/student/dashboard/page.tsx"
PRACTICE="apps/web/src/app/(app)/practice/page.tsx"
GLOBALS="apps/web/src/app/globals.css"

if [ ! -f "$DASH" ]; then
  echo "❌ Missing: $DASH"
  exit 1
fi
if [ ! -f "$PRACTICE" ]; then
  echo "❌ Missing: $PRACTICE"
  exit 1
fi
if [ ! -f "$GLOBALS" ]; then
  echo "⚠️  globals.css not found at $GLOBALS (will skip global styles)"
fi

backup () {
  local f="$1"
  [ -f "$f" ] || return 0
  cp "$f" "${f}.bak.$(date +%Y%m%d_%H%M%S)"
}

backup "$DASH"
backup "$PRACTICE"
backup "$GLOBALS"

# ---- 1) Create accommodations lib ----
mkdir -p apps/web/src/lib
cat > apps/web/src/lib/accommodations.ts <<'TS'
export type Accommodations = {
  // language for UI supports / read-aloud
  lang: "en" | "es";

  // presentation
  largeText: boolean;
  highContrast: boolean;

  // environment
  focusMode: boolean;

  // response supports (UI toggles; can be wired into item renderers later)
  reduceChoices: 0 | 2;
  tts: boolean;
};

export const ACC_KEY = "acc.v1";

export const DEFAULT_ACC: Accommodations = {
  lang: "en",
  largeText: false,
  highContrast: false,
  focusMode: false,
  reduceChoices: 0,
  tts: false,
};

export function loadAcc(): Accommodations {
  if (typeof window === "undefined") return DEFAULT_ACC;
  try {
    const raw = window.localStorage.getItem(ACC_KEY);
    if (!raw) return DEFAULT_ACC;
    const parsed = JSON.parse(raw) as Partial<Accommodations>;
    return {
      ...DEFAULT_ACC,
      ...parsed,
      lang: parsed.lang === "es" ? "es" : "en",
      reduceChoices: parsed.reduceChoices === 2 ? 2 : 0,
    };
  } catch {
    return DEFAULT_ACC;
  }
}

export function saveAcc(acc: Accommodations) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACC_KEY, JSON.stringify(acc));
  } catch {}
}

export function applyAccToDocument(acc: Accommodations) {
  if (typeof window === "undefined") return;

  // apply to <html> so both dashboard + practice can react via CSS
  const el = document.documentElement;
  el.dataset.accLang = acc.lang; // "en" | "es"
  el.dataset.accLarge = acc.largeText ? "1" : "0";
  el.dataset.accContrast = acc.highContrast ? "1" : "0";
  el.dataset.accFocus = acc.focusMode ? "1" : "0";
  el.dataset.accReduceChoices = String(acc.reduceChoices); // "0" | "2"
  el.dataset.accTts = acc.tts ? "1" : "0";
}
TS

# ---- 2) Create accommodations UI component ----
mkdir -p apps/web/src/components/student
cat > apps/web/src/components/student/AccommodationsButton.tsx <<'TSX'
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { applyAccToDocument, DEFAULT_ACC, loadAcc, saveAcc, type Accommodations } from "@/lib/accommodations";

type Props = {
  label?: string; // e.g., "Accommodations"
  compact?: boolean; // icon-ish button
};

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start justify-between gap-4 rounded-2xl border bg-white px-4 py-3 text-left shadow-sm"
    >
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {desc ? <div className="mt-1 text-xs text-slate-600">{desc}</div> : null}
      </div>
      <div
        className={[
          "h-6 w-11 rounded-full border transition",
          checked ? "bg-slate-900" : "bg-slate-200",
        ].join(" ")}
      >
        <div
          className={[
            "mt-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "translate-x-5" : "translate-x-0.5",
          ].join(" ")}
        />
      </div>
    </button>
  );
}

export default function AccommodationsButton({ label = "Accommodations", compact = false }: Props) {
  // Hydration-safe: start with defaults, then load after mount
  const [open, setOpen] = useState(false);
  const [acc, setAcc] = useState<Accommodations>(DEFAULT_ACC);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const a = loadAcc();
    setAcc(a);
    applyAccToDocument(a);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveAcc(acc);
    applyAccToDocument(acc);
  }, [acc, hydrated]);

  const buttonText = useMemo(() => {
    if (!hydrated) return label;
    const enabledCount =
      (acc.largeText ? 1 : 0) +
      (acc.highContrast ? 1 : 0) +
      (acc.focusMode ? 1 : 0) +
      (acc.reduceChoices === 2 ? 1 : 0) +
      (acc.tts ? 1 : 0) +
      (acc.lang === "es" ? 1 : 0);
    return enabledCount ? `${label} (${enabledCount})` : label;
  }, [acc, hydrated, label]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "rounded-full border bg-white px-3 py-2 text-sm font-semibold shadow-sm"
            : "rounded-full border bg-white px-4 py-2 text-sm font-semibold shadow-sm"
        }
      >
        {buttonText}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-xl rounded-3xl border bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold text-slate-900">Accommodations</div>
                <div className="mt-1 text-xs text-slate-600">
                  These settings apply to the Student Dashboard and Practice.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border bg-white px-3 py-1.5 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-800">Language</div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAcc((p) => ({ ...p, lang: "en" }))}
                    className={[
                      "rounded-full border px-3 py-1.5 text-sm font-semibold",
                      acc.lang === "en" ? "bg-slate-900 text-white" : "bg-white text-slate-900",
                    ].join(" ")}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setAcc((p) => ({ ...p, lang: "es" }))}
                    className={[
                      "rounded-full border px-3 py-1.5 text-sm font-semibold",
                      acc.lang === "es" ? "bg-slate-900 text-white" : "bg-white text-slate-900",
                    ].join(" ")}
                  >
                    Español
                  </button>
                </div>
              </div>

              <ToggleRow
                title="Large text"
                desc="Bigger font + spacing across the app."
                checked={acc.largeText}
                onChange={(v) => setAcc((p) => ({ ...p, largeText: v }))}
              />
              <ToggleRow
                title="High contrast"
                desc="Stronger contrast for readability."
                checked={acc.highContrast}
                onChange={(v) => setAcc((p) => ({ ...p, highContrast: v }))}
              />
              <ToggleRow
                title="Focus mode"
                desc="Reduce distractions (hides XP/streak/specimen flair where possible)."
                checked={acc.focusMode}
                onChange={(v) => setAcc((p) => ({ ...p, focusMode: v }))}
              />

              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Answer supports</div>
                <div className="mt-2 text-xs text-slate-600">
                  These toggles are saved now; wiring into every item type can be done next.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAcc((p) => ({ ...p, reduceChoices: 0 }))}
                    className={[
                      "rounded-full border px-3 py-1.5 text-sm font-semibold",
                      acc.reduceChoices === 0 ? "bg-slate-900 text-white" : "bg-white text-slate-900",
                    ].join(" ")}
                  >
                    Choices: Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setAcc((p) => ({ ...p, reduceChoices: 2 }))}
                    className={[
                      "rounded-full border px-3 py-1.5 text-sm font-semibold",
                      acc.reduceChoices === 2 ? "bg-slate-900 text-white" : "bg-white text-slate-900",
                    ].join(" ")}
                  >
                    Choices: -2
                  </button>
                </div>

                <div className="mt-3">
                  <ToggleRow
                    title="Read aloud (TTS)"
                    desc="Enables read-aloud UI (best on Practice items)."
                    checked={acc.tts}
                    onChange={(v) => setAcc((p) => ({ ...p, tts: v }))}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAcc(DEFAULT_ACC)}
                className="rounded-2xl border bg-white px-4 py-3 text-sm font-semibold shadow-sm"
              >
                Reset accommodations
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Note: This is not an official IEP/504 manager; it’s student-facing supports you can toggle on/off.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
TSX

# ---- 3) Add global CSS hooks (optional but helpful) ----
if [ -f "$GLOBALS" ]; then
  if ! rg -n "data-acc-large|data-acc-contrast|data-acc-focus" "$GLOBALS" >/dev/null 2>&1; then
    cat >> "$GLOBALS" <<'CSS'

/* --- Accommodations (applied on <html data-acc-...>) --- */
html[data-acc-large="1"] {
  font-size: 18px;
}
html[data-acc-large="1"] .text-xs { font-size: 0.85rem; }
html[data-acc-large="1"] .text-sm { font-size: 1.0rem; }
html[data-acc-large="1"] .text-base { font-size: 1.1rem; }
html[data-acc-large="1"] .leading-tight { line-height: 1.35; }

html[data-acc-contrast="1"] {
  filter: contrast(1.05);
}
html[data-acc-contrast="1"] .text-slate-600 { color: rgb(15 23 42); } /* slate-900-ish */
html[data-acc-contrast="1"] .text-slate-500 { color: rgb(30 41 59); } /* slate-800-ish */

html[data-acc-focus="1"] [data-focus-hide="1"] {
  display: none !important;
}
CSS
  fi
fi

# ---- 4) Patch Student Dashboard page: add button near header controls ----
python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/student/dashboard/page.tsx")
t = p.read_text(encoding="utf-8")

# Ensure import exists
imp = 'import AccommodationsButton from "@/components/student/AccommodationsButton";\n'
if imp not in t:
    # insert near other imports
    t = re.sub(r'(^import .*?\n)+', lambda m: m.group(0) + imp, t, count=1, flags=re.M)

# Insert button near "Reset Specimen Unlocks" if present
if "Reset Specimen Unlocks" in t and "AccommodationsButton" not in t:
    # Try to place right after the reset button element
    # Pattern: >Reset Specimen Unlocks< within a <button ...>
    t2, n = re.subn(
        r'(<button[^>]*>[^<]*Reset Specimen Unlocks[^<]*</button>)',
        r'\1\n              <AccommodationsButton />',
        t,
        count=1,
        flags=re.S
    )
    if n == 0:
        # fallback: after the heading "Student Dashboard"
        t2 = re.sub(r'(Student Dashboard[^<]*</h1>)', r'\1\n            <div className="mt-3"><AccommodationsButton /></div>', t, count=1)
    t = t2
else:
    # fallback if reset button text differs: insert under top header if not already inserted
    if "AccommodationsButton" not in t:
        t = re.sub(r'(Student Dashboard[^<]*</h1>)', r'\1\n            <div className="mt-3"><AccommodationsButton /></div>', t, count=1)

# Mark common distraction widgets to hide in focus mode (best-effort)
# If practice CTA/streak/accuracy cards exist, add data-focus-hide=1 on their wrappers if we can detect headings.
t = t.replace('>Streak<', ' data-focus-hide="1">Streak<')
t = t.replace('>Accuracy<', ' data-focus-hide="1">Accuracy<')

p.write_text(t, encoding="utf-8")
print("✅ Patched Student Dashboard page")
PY

# ---- 5) Patch Practice page: add a compact gear button in header/top-right ----
python3 - <<'PY'
from pathlib import Path
import re

p = Path("apps/web/src/app/(app)/practice/page.tsx")
t = p.read_text(encoding="utf-8")

imp = 'import AccommodationsButton from "@/components/student/AccommodationsButton";\n'
if imp not in t:
    t = re.sub(r'(^import .*?\n)+', lambda m: m.group(0) + imp, t, count=1, flags=re.M)

# Insert a compact accommodations button near the top of the page content.
# Best-effort: after the first main container div in the return.
if "AccommodationsButton" in t and 'compact={true}' not in t:
    # Find the first occurrence of "<main" and insert a top bar inside it
    t2, n = re.subn(
        r'(<main[^>]*>)',
        r'\1\n        <div className="mb-3 flex items-center justify-end gap-2">\n          <AccommodationsButton compact={true} label="Accommodations" />\n        </div>',
        t,
        count=1
    )
    if n == 0:
        # fallback: insert after first "<div className=" inside return
        t2 = re.sub(
            r'(\n\s*return\s*\(\s*\n)',
            r'\1      <AccommodationsButton compact={true} label="Accommodations" />\n',
            t,
            count=1
        )
    t = t2

# Mark XP/streak header areas as focus-hide if they exist
t = t.replace("<PracticeXPHeader", '<PracticeXPHeader data-focus-hide="1"')

p.write_text(t, encoding="utf-8")
print("✅ Patched Practice page")
PY

echo "✅ Accommodations added."
echo "Run:"
echo "  pnpm -C apps/web dev"
