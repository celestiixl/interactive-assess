"use client";

import { useEffect, useSyncExternalStore } from "react";

export type UILang = "en" | "es";

const KEY = "acc.v1";
const EVT = "acc:change";

function readLang(): UILang {
  if (typeof window === "undefined") return "en";
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return "en";
    const parsed = JSON.parse(raw);
    const lang = parsed?.lang;
    return lang === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

function writeLang(next: UILang) {
  if (typeof window === "undefined") return;
  let prev: any = {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) prev = JSON.parse(raw);
  } catch {}
  const updated = { ...prev, lang: next };
  window.localStorage.setItem(KEY, JSON.stringify(updated));

  // Keep the existing <html data-acc-lang="..."> behavior in sync
  try {
    document.documentElement.dataset.accLang = next;
  } catch {}

  // Notify same-tab subscribers
  window.dispatchEvent(new Event(EVT));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  const onLocal = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVT, onLocal as any);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVT, onLocal as any);
  };
}

export function useLang(): { lang: UILang; setLang: (l: UILang) => void; toggleLang: () => void } {
  const lang = useSyncExternalStore<UILang>(subscribe, readLang, () => "en");

  // On first mount, ensure html dataset matches persisted lang
  useEffect(() => {
    try {
      document.documentElement.dataset.accLang = lang;
    } catch {}
  }, [lang]);

  return {
    lang,
    setLang: (l) => writeLang(l),
    toggleLang: () => writeLang(lang === "es" ? "en" : "es"),
  };
}
