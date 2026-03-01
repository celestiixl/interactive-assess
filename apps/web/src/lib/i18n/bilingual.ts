export type BilingualString =
  | string
  | {
      en: string;
      es?: string;
      vi?: string;
      zh?: string;
    };

export function getEnglishText(v: BilingualString | null | undefined): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return String(v.en ?? "");
}

export function getSpanishText(v: BilingualString | null | undefined): string {
  if (!v) return "";
  if (typeof v === "string") return "";
  return String(v.es ?? "");
}

export function asBilingual(en: string, es?: string): BilingualString {
  return es ? { en, es } : en;
}
