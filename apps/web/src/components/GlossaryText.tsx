import * as React from "react";
import { parseGlossaryMarkup } from "@/lib/parseGlossaryMarkup";
import GlossaryToken from "./GlossaryToken";
import type { GlossaryEntry } from "@/types/item";

export default function GlossaryText({
  text,
  glossary,
  defaultLang = "es",
  showSupport = false,
}: {
  text: string;
  glossary: GlossaryEntry[];
  defaultLang?: "es" | "en";
  showSupport?: boolean;
}) {
  const segments = React.useMemo(() => parseGlossaryMarkup(text), [text]);

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === "text")
          return <React.Fragment key={i}>{seg.value}</React.Fragment>;
        const entry = glossary.find((e) => e.key === seg.key);
        if (!entry) return <React.Fragment key={i}>{seg.value}</React.Fragment>;
        return (
          <GlossaryToken
            key={i}
            entry={entry}
            tokenSurface={seg.value}
            defaultLang={showSupport ? defaultLang : "en"}
            showSupport={showSupport}
          />
        );
      })}
    </>
  );
}
