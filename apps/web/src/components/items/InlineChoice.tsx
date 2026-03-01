"use client";

import BilingualText from "@/components/student/BilingualText";

import { useMemo, useState } from "react";
import { useLang } from "@/lib/useLang";

type InlineChoiceOpt = {
  id?: string;
  value?: string;
  label?: string;
  text?: string;
};
type InlineChoiceBlank = {
  id?: string;
  blankId?: string;
  options?: InlineChoiceOpt[];
  choices?: InlineChoiceOpt[];
};

export default function InlineChoice({
  item,
  value,
  onChange,
  disabled,
}: {
  item: any;
  value?: Record<string, string>;
  onChange?: (v: Record<string, string>) => void;
  disabled?: boolean;
}) {
  const text: string = String(
    item?.clozeText ?? item?.prompt ?? item?.stem ?? "",
  );
  const blanks: InlineChoiceBlank[] = Array.isArray(item?.blanks)
    ? item.blanks
    : Array.isArray(item?.inlineChoices)
      ? item.inlineChoices
      : [];

  const [resp, setResp] = useState<Record<string, string>>(() => value ?? {});

  const parts = useMemo(() => {
    const re = /\[\[([^\]]+)\]\]/g;
    const out: Array<{ t: "text" | "blank"; v: string }> = [];
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = re.exec(text))) {
      const start = m.index;
      const end = re.lastIndex;
      if (start > last) out.push({ t: "text", v: text.slice(last, start) });
      out.push({ t: "blank", v: (m[1] || "").trim() });
      last = end;
    }

    if (last < text.length) out.push({ t: "text", v: text.slice(last) });
    return out.length ? out : [{ t: "text", v: text }];
  }, [text]);

  const blankById = useMemo(() => {
    const m = new Map<string, InlineChoiceBlank>();
    blanks.forEach((b, i) => {
      const id = String(b?.id ?? b?.blankId ?? i);
      m.set(id, b);
    });
    return m;
  }, [blanks]);

  function optsFor(blankId: string): InlineChoiceOpt[] {
    const b = blankById.get(blankId);
    const opts = (b?.options ?? b?.choices ?? []) as InlineChoiceOpt[];
    return Array.isArray(opts) ? opts : [];
  }

  function pick(blankId: string, optId: string) {
    if (disabled) return;
    setResp((p) => {
      const next = { ...p, [blankId]: optId };
      onChange?.(next);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="text-base leading-relaxed">
        {parts.map((p, i) =>
          p.t === "text" ? (
            <span key={i}>{p.v}</span>
          ) : (
            <span
              key={i}
              className="mx-1 inline-flex flex-wrap gap-2 align-baseline"
            >
              {optsFor(p.v).map((o, j) => {
                const id = String(o?.id ?? o?.value ?? j);
                const label = String(o?.label ?? o?.text ?? o?.value ?? id);
                const active = (resp[p.v] ?? "") === id;
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => pick(p.v, id)}
                    className={[
                      "inline-flex items-center rounded-full border px-3 py-1 text-sm transition",
                      disabled ? "opacity-60" : "hover:bg-muted",
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
          ),
        )}
      </div>
    </div>
  );
}
