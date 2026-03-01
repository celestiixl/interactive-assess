"use client";

import { Pill } from "./Pill";
import { useLang } from "@/lib/useLang";

export default function LangToggle() {
  const { lang, setLang } = useLang();

  const active = (v: "en" | "es") =>
    v === lang
      ? "border-slate-900/20 bg-slate-900/5 text-slate-900"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${active("en")}`}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("es")}
        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${active("es")}`}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
      {/* Small visual cue in the existing Pill style (optional) */}
      <Pill tone="slate">{lang === "es" ? "Español" : "English"}</Pill>
    </div>
  );
}
