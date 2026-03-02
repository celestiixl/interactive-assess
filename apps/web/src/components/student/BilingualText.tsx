"use client";

import type { SupportLanguage } from "./supportsStore";
import GlossaryText from "@/components/GlossaryText";
import type { GlossaryEntry } from "@/types/item";

export type Bilingual = Partial<Record<SupportLanguage, string>> & {
  en: string;
};

export function BilingualText(props: {
  text: string | Bilingual | null | undefined;
  showSupport?: boolean;
  supportLanguage?: SupportLanguage;
  classNameEn?: string;
  classNameSupport?: string;
  /**
   * Optional glossary entries to render tokens within the text
   */
  glossary?: GlossaryEntry[];
  /**
   * Which language to show inside a glossary popover by default.
   */
  glossaryLang?: "es" | "en";
}) {
  const { text, showSupport, supportLanguage = "es" } = props;
  const glossary = props.glossary ?? [];
  const glossLang = props.glossaryLang ?? "es";
  const glossarySupportOn = Boolean(showSupport && supportLanguage === "es");
  const glossaryDefaultLang: "es" | "en" = glossarySupportOn
    ? glossLang
    : "en";

  if (!text) return null;

  // plain string: render only English line
  if (typeof text === "string") {
    return (
      <div className={props.classNameEn ?? ""}>
        {glossary.length ? (
          <GlossaryText
            text={text}
            glossary={glossary}
            defaultLang={glossaryDefaultLang}
            showSupport={glossarySupportOn}
          />
        ) : (
          text
        )}
      </div>
    );
  }

  const en = text.en ?? "";
  const sup = showSupport ? (text[supportLanguage] ?? "") : "";

  return (
    <div>
      <div className={props.classNameEn ?? ""}>
        {glossary.length ? (
          <GlossaryText
            text={en}
            glossary={glossary}
            defaultLang={glossaryDefaultLang}
            showSupport={glossarySupportOn}
          />
        ) : (
          en
        )}
      </div>
      {sup ? (
        <div
          className={
            props.classNameSupport ?? "mt-1 text-xs text-slate-500 italic"
          }
        >
          {glossary.length ? (
            <GlossaryText
              text={sup}
              glossary={glossary}
              defaultLang={glossaryDefaultLang}
              showSupport={glossarySupportOn}
            />
          ) : (
            sup
          )}
        </div>
      ) : null}
    </div>
  );
}

export default BilingualText;
