"use client";

import BilingualText from "@/components/student/BilingualText";

import { useMemo, useState } from "react";
import { useLang } from "@/lib/useLang";

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
  const { lang } = useLang();
  // Always declare hooks at top-level (prevents hook-order errors)
  const prompt: string = String(item?.prompt ?? item?.stem ?? item?.text ?? "");
  const blanks: any[] = Array.isArray(item?.blanks)
    ? item.blanks
    : Array.isArray(item?.inlineChoices)
      ? item.inlineChoices
      : [];

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
      if (m.index > last)
        out.push({ t: "text", v: prompt.slice(last, m.index) });
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
    const idx =
      blankIndexById.get(blankId) ??
      blankIndexById.get(String(parseInt(blankId, 10))) ??
      0;
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
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background",
              ].join(" ")}
              aria-pressed={active}
            >
              {<BilingualText text={label as any} showSupport={lang === "es"} />}
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
          ),
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
