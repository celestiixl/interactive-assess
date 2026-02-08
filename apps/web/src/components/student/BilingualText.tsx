"use client";

import type { SupportLanguage } from "./supportsStore";

export type Bilingual = Partial<Record<SupportLanguage, string>> & { en: string };

export function BilingualText(props: {
  text: string | Bilingual | null | undefined;
  showSupport?: boolean;
  supportLanguage?: SupportLanguage;
  classNameEn?: string;
  classNameSupport?: string;
}) {
  const { text, showSupport, supportLanguage = "es" } = props;

  if (!text) return null;

  // plain string: render only English line
  if (typeof text === "string") {
    return <div className={props.classNameEn ?? ""}>{text}</div>;
  }

  const en = text.en ?? "";
  const sup = showSupport ? (text[supportLanguage] ?? "") : "";

  return (
    <div>
      <div className={props.classNameEn ?? ""}>{en}</div>
      {sup ? (
        <div className={props.classNameSupport ?? "mt-1 text-xs text-slate-500 italic"}>
          {sup}
        </div>
      ) : null}
    </div>
  );
}
