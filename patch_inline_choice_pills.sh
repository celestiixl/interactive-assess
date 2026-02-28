#!/usr/bin/env bash
set -euo pipefail

REPO="${REPO:-/workspaces/interactive-assess}"
cd "$REPO" || { echo "❌ repo not found at $REPO"; exit 1; }

# --- locate apps/web root ---
if [ -d apps/web/src ]; then
  WEB="apps/web/src"
elif [ -d apps/web ]; then
  WEB="apps/web"
else
  echo "❌ can't find apps/web"
  exit 1
fi

echo "✅ WEB=$WEB"

# --- create shared InlineChoice pill renderer (safe, no hook-order traps) ---
COMP_DIR="$WEB/components/items"
mkdir -p "$COMP_DIR"

cat > "$COMP_DIR/InlineChoicePills.tsx" <<'TSX'
"use client";

import { useMemo, useState } from "react";

type AnyFn = (...args: any[]) => any;

export default function InlineChoicePills({
  item,
  mode,
  onAnswer,
}: {
  item: any;
  mode?: "learn" | "test";
  onAnswer?: AnyFn;
}) {
  // Always declare hooks at top-level (prevents hook-order errors)
  const prompt: string = String(item?.prompt ?? item?.stem ?? item?.text ?? "");
  const blanks: any[] = Array.isArray(item?.blanks) ? item.blanks : Array.isArray(item?.inlineChoices) ? item.inlineChoices : [];

  const blankIndexById = useMemo(() => {
    const m = new Map<string, number>();
    blanks.forEach((b, i) => {
      const id = String(b?.id ?? b?.blankId ?? i);
      m.set(id, i);
    });
    return m;
  }, [blanks]);

  const [sel, setSel] = useState<Record<string, string>>({});

  const tokens = useMemo(() => {
    // Supports {{blankId}} tokens. If none exist, we just show prompt.
    const re = /{{\s*([^}]+)\s*}}/g;
    const out: Array<{ t: "text" | "blank"; v: string }> = [];
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(prompt))) {
      if (m.index > last) out.push({ t: "text", v: prompt.slice(last, m.index) });
      out.push({ t: "blank", v: m[1] });
      last = m.index + m[0].length;
    }
    if (last < prompt.length) out.push({ t: "text", v: prompt.slice(last) });
    return out.length ? out : [{ t: "text", v: prompt }];
  }, [prompt]);

  function getOptions(blank: any) {
    const opts = blank?.options ?? blank?.choices ?? blank?.answerChoices ?? [];
    return Array.isArray(opts) ? opts : [];
  }

  function pick(blankId: string, optId: string) {
    setSel((p) => {
      const next = { ...p, [blankId]: optId };
      onAnswer?.(next);
      return next;
    });
  }

  function Blank({ blankId }: { blankId: string }) {
    const idx = blankIndexById.get(blankId) ?? blankIndexById.get(String(parseInt(blankId, 10))) ?? 0;
    const blank = blanks[idx];
    const options = getOptions(blank);
    const chosen = sel[blankId] ?? "";

    if (!blank || !options.length) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full border text-sm text-muted-foreground align-baseline">
          [{blankId}]
        </span>
      );
    }

    return (
      <span className="inline-flex flex-wrap gap-2 align-baseline">
        {options.map((o: any, i: number) => {
          const id = String(o?.id ?? o?.value ?? i);
          const label = String(o?.label ?? o?.text ?? o?.value ?? id);
          const active = chosen === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => pick(blankId, id)}
              className={[
                "inline-flex items-center rounded-full border px-3 py-1 text-sm transition",
                "hover:bg-muted",
                active ? "bg-foreground text-background border-foreground" : "bg-background",
              ].join(" ")}
              aria-pressed={active}
            >
              {label}
            </button>
          );
        })}
      </span>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-base leading-relaxed">
        {tokens.map((x, i) =>
          x.t === "text" ? (
            <span key={i}>{x.v}</span>
          ) : (
            <span key={i} className="mx-1 inline-block">
              <Blank blankId={String(x.v)} />
            </span>
          )
        )}
      </div>

      {/* Optional tiny debug for dev (kept subtle) */}
      {process.env.NODE_ENV !== "production" && (
        <div className="text-xs text-muted-foreground">
          {Object.keys(sel).length ? "Selected: " + JSON.stringify(sel) : ""}
        </div>
      )}
    </div>
  );
}
TSX

echo "✅ wrote $COMP_DIR/InlineChoicePills.tsx"

# --- patch student runner renderer to use component as JSX (prevents hook errors) ---
# We look for any switch/case handling inline choice and force it to return <InlineChoicePills ... />
RUNNER_CAND="$(rg -l --hidden --glob '!.next/**' --glob '!dist/**' --glob '!node_modules/**' \
  'case\\s+["'"'"']inline|InlineChoice' "$WEB/app" "$WEB/components" 2>/dev/null | head -n 1 || true)"

if [ -z "${RUNNER_CAND:-}" ]; then
  RUNNER_CAND="$(rg -l --hidden --glob '!.next/**' --glob '!dist/**' --glob '!node_modules/**' \
    'practice/page\\.tsx|Items Test Screen|ItemRenderer' "$WEB/app" "$WEB/components" 2>/dev/null | head -n 1 || true)"
fi

if [ -n "${RUNNER_CAND:-}" ]; then
  cp -a "$RUNNER_CAND" "$RUNNER_CAND.bak.$(date +%Y%m%d_%H%M%S)"
  echo "✅ runner candidate: $RUNNER_CAND"

  # Ensure import exists (idempotent)
  if ! rg -q 'InlineChoicePills' "$RUNNER_CAND"; then
    perl -0777 -i -pe 's/(import[^;]*;\s*)/$1import InlineChoicePills from "@/components\/items\/InlineChoicePills";\n/s if $.==1' "$RUNNER_CAND" || true
  fi

  # Replace case blocks for inline choice to render component (best-effort)
  perl -0777 -i -pe '
    s/case\s+["'\'']inline[-_ ]?choice["'\'']\s*:\s*([\s\S]*?)break\s*;/
      case "inline-choice":\n      case "inline_choice":\n        return <InlineChoicePills item={item} mode={mode} onAnswer={onAnswer} />;\n/s
  ' "$RUNNER_CAND" || true

  # Also catch direct function-call usage like InlineChoicePills({...})
  perl -i -pe 's/\bInlineChoicePills\s*\(\s*\{/<InlineChoicePills {.../g; s/\}\s*\)\s*;?\s*$/} \/>/g' "$RUNNER_CAND" || true

else
  echo "⚠️ could not find runner renderer automatically (no changes there)"
fi

# --- patch builder preview to use same component (so pills show in builder) ---
BUILDER_CAND="$(rg -l --hidden --glob '!.next/**' --glob '!dist/**' --glob '!node_modules/**' \
  'Builder|Item Preview|Preview|renderItem|case\\s+["'"'"']inline' "$WEB" 2>/dev/null | head -n 1 || true)"

if [ -n "${BUILDER_CAND:-}" ]; then
  cp -a "$BUILDER_CAND" "$BUILDER_CAND.bak.$(date +%Y%m%d_%H%M%S)"
  echo "✅ builder candidate: $BUILDER_CAND"

  if ! rg -q 'InlineChoicePills' "$BUILDER_CAND"; then
    perl -0777 -i -pe 's/(import[^;]*;\s*)/$1import InlineChoicePills from "@/components\/items\/InlineChoicePills";\n/s if $.==1' "$BUILDER_CAND" || true
  fi

  perl -0777 -i -pe '
    s/case\s+["'\'']inline[-_ ]?choice["'\'']\s*:\s*([\s\S]*?)break\s*;/
      case "inline-choice":\n      case "inline_choice":\n        return <InlineChoicePills item={item} mode={mode} onAnswer={onAnswer} />;\n/s
  ' "$BUILDER_CAND" || true
else
  echo "⚠️ could not find builder preview automatically (no changes there)"
fi

echo "✅ done. If TS errors happen, paste the exact error line + file path."
