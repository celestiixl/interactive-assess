import * as React from "react";
import type { GlossaryEntry } from "@/types/item";

export default function GlossaryToken({
  entry,
  tokenSurface,
  defaultLang = "es",
  showSupport = false,
}: {
  entry: GlossaryEntry;
  tokenSurface?: string;
  defaultLang?: "es" | "en";
  showSupport?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [lang, setLang] = React.useState(defaultLang);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLSpanElement>(null);
  const closeTimerRef = React.useRef<number | null>(null);
  const englishTerm = (tokenSurface ?? entry.en ?? entry.surface).trim();
  const spanishTerm = (entry.esSurface ?? entry.surface).trim();
  const englishDefinition = entry.en?.trim() || "No English definition found yet.";
  const spanishDefinition = entry.es?.trim() || "No se encontró definición en español todavía.";
  const showSpanishTerm =
    showSupport &&
    spanishTerm.length > 0 &&
    spanishTerm.toLowerCase() !== englishTerm.toLowerCase();

  const close = React.useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(false);
    setLang(showSupport ? defaultLang : "en");
    buttonRef.current?.focus();
  }, [defaultLang, showSupport]);

  const cancelScheduledClose = React.useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = React.useCallback(() => {
    cancelScheduledClose();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setLang(showSupport ? defaultLang : "en");
      closeTimerRef.current = null;
    }, 180);
  }, [cancelScheduledClose, defaultLang, showSupport]);

  const toggleLang = React.useCallback(() => {
    if (!showSupport) return;
    setLang((prev) => (prev === "es" ? "en" : "es"));
  }, [showSupport]);

  React.useEffect(() => {
    if (!open) return;
    setLang(showSupport ? defaultLang : "en");
  }, [open, defaultLang, showSupport]);

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, close]);

  return (
    <span className="relative inline-block" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        className="underline decoration-dotted focus:outline-none"
        aria-expanded={open}
        aria-controls={`glossary-${entry.key}`}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => {
          cancelScheduledClose();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && containerRef.current?.contains(next)) return;
          setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
          if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
        }}
      >
          {englishTerm}
      </button>
      {open && (
        <span
          id={`glossary-${entry.key}`}
          role="dialog"
          className="absolute z-50 mt-1 block w-64 rounded-lg bg-bs-surface p-4 shadow-lg"
            onMouseEnter={cancelScheduledClose}
            onMouseLeave={scheduleClose}
        >
            <span className="block font-semibold text-bs-text">{englishTerm}</span>
            {showSpanishTerm ? (
              <span className="mt-0.5 block text-xs text-bs-text-sub italic">
                {spanishTerm}
              </span>
            ) : null}
            <span className="mt-2 block text-sm text-bs-text-sub">
              {showSupport && lang === "es"
                ? spanishDefinition
                : englishDefinition}
            </span>
            {showSupport ? (
              <button
                type="button"
                className="mt-2 text-xs text-bs-text-sub"
                onClick={toggleLang}
              >
                {lang === "es"
                  ? "Show English definition"
                  : "Mostrar definición en español"}
              </button>
            ) : null}
          {entry.partOfSpeech && (
              <span className="mt-1 block text-xs text-bs-text-sub italic">
              {entry.partOfSpeech}
              </span>
          )}
          </span>
      )}
    </span>
  );
}
