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
  ttsVoice: "auto" | "female" | "male";
  ttsSpeed: "normal" | "slow";
};

export type TtsLanguage = "en" | "es";

type SpeakTextOptions = {
  text: string;
  language: TtsLanguage;
  voicePreference?: Accommodations["ttsVoice"];
  speedPreference?: Accommodations["ttsSpeed"];
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
};

export type Supports = Accommodations;

export const ACC_KEY = "acc.v1";
export const ACC_EVENT = "acc:change";

export const DEFAULT_ACC: Accommodations = {
  lang: "en",
  largeText: false,
  highContrast: false,
  focusMode: false,
  reduceChoices: 0,
  tts: false,
  ttsVoice: "auto",
  ttsSpeed: "normal",
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
      ttsVoice:
        parsed.ttsVoice === "female" || parsed.ttsVoice === "male"
          ? parsed.ttsVoice
          : "auto",
      ttsSpeed: parsed.ttsSpeed === "slow" ? "slow" : "normal",
    };
  } catch {
    return DEFAULT_ACC;
  }
}

export function saveAcc(acc: Accommodations) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACC_KEY, JSON.stringify(acc));
    // Notify same-tab listeners so accommodations update immediately.
    window.dispatchEvent(new Event(ACC_EVENT));
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
  el.dataset.accTtsVoice = acc.ttsVoice;
  el.dataset.accTtsSpeed = acc.ttsSpeed;
}

function toSpeechLang(language: TtsLanguage): string {
  return language === "es" ? "es-US" : "en-US";
}

function scoreVoice(
  voice: SpeechSynthesisVoice,
  langCode: string,
  voicePreference: Accommodations["ttsVoice"],
): number {
  const voiceName = voice.name.toLowerCase();
  const scoreLang = voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
    ? 100
    : 0;

  // Prefer newer neural/natural voices when available.
  const qualityBoost =
    /(neural|natural|premium|enhanced|wavenet|google|microsoft|siri)/.test(
      voiceName,
    )
      ? 40
      : 0;

  const nonDefaultBoost = voice.default ? 0 : 5;
  const localBoost = voice.localService ? 3 : 0;

  const feminineMatch =
    /(female|woman|zira|aria|samantha|allison|ava|jenny)/.test(voiceName)
      ? 22
      : 0;
  const masculineMatch = /(male|man|david|mark|guy|andrew|roger|thomas)/.test(
    voiceName,
  )
    ? 22
    : 0;

  let preferenceBoost = 0;
  if (voicePreference === "female") {
    preferenceBoost = feminineMatch - (masculineMatch ? 8 : 0);
  } else if (voicePreference === "male") {
    preferenceBoost = masculineMatch - (feminineMatch ? 8 : 0);
  }

  return (
    scoreLang + qualityBoost + nonDefaultBoost + localBoost + preferenceBoost
  );
}

async function resolvePreferredVoice(
  synth: SpeechSynthesis,
  langCode: string,
  voicePreference: Accommodations["ttsVoice"],
): Promise<SpeechSynthesisVoice | null> {
  const pickVoice = (): SpeechSynthesisVoice | null => {
    const voices = synth.getVoices();
    if (!voices.length) return null;

    const sorted = [...voices].sort(
      (a, b) =>
        scoreVoice(b, langCode, voicePreference) -
        scoreVoice(a, langCode, voicePreference),
    );
    return sorted[0] ?? null;
  };

  const immediate = pickVoice();
  if (immediate) return immediate;

  return new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      synth.removeEventListener("voiceschanged", finish);
      resolve(pickVoice());
    };

    synth.addEventListener("voiceschanged", finish);
    // Some browsers do not reliably fire voiceschanged.
    window.setTimeout(finish, 200);
  });
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export async function speakText(options: SpeakTextOptions): Promise<boolean> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  const synth = window.speechSynthesis;
  const langCode = toSpeechLang(options.language);
  const voicePreference = options.voicePreference ?? "auto";
  const speedPreference = options.speedPreference ?? "normal";
  const cleanedText = options.text.replace(/\s+/g, " ").trim();
  if (!cleanedText) return false;

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  const voice = await resolvePreferredVoice(synth, langCode, voicePreference);
  const baseRate = speedPreference === "slow" ? 0.84 : 0.95;

  utterance.lang = voice?.lang ?? langCode;
  utterance.voice = voice;
  utterance.rate = options.rate ?? baseRate;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;

  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onEnd?.();

  synth.cancel();
  synth.speak(utterance);
  return true;
}
