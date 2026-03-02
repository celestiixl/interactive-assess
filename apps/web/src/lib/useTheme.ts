"use client";

import { useEffect, useSyncExternalStore } from "react";

export type UITheme = "light" | "dark";

const KEY = "ia.theme.v1";
const EVT = "ia:theme:change";

function detectInitialTheme(): UITheme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readTheme(): UITheme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  return detectInitialTheme();
}

function applyTheme(next: UITheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = next;
  document.documentElement.classList.toggle("dark", next === "dark");
}

function writeTheme(next: UITheme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {}
  applyTheme(next);
  window.dispatchEvent(new Event(EVT));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  const onLocal = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener(EVT, onLocal as EventListener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVT, onLocal as EventListener);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore<UITheme>(subscribe, readTheme, () => "light");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return {
    theme,
    setTheme: (next: UITheme) => writeTheme(next),
    toggleTheme: () => writeTheme(theme === "dark" ? "light" : "dark"),
  };
}
