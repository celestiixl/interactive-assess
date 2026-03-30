"use client";

import { Pill } from "./Pill";
import { useLang } from "@/lib/useLang";

export default function LangToggle() {
  const { lang, setLang } = useLang();

  const active = (v: "en" | "es") =>
    v === lang
      ? "border-[var(--bs-border)] bg-[var(--bs-raised)] text-bs-text"
      : "border-[var(--bs-border)] bg-bs-surface text-bs-text-sub hover:bg-[var(--bs-raised)]";

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
