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

export type Supports = Accommodations;

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
