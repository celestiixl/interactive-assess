"use client";

import { useSyncExternalStore } from "react";
import {
  ACC_EVENT,
  ACC_KEY,
  DEFAULT_ACC,
  loadAcc,
  saveAcc,
  type Accommodations,
} from "@/lib/accommodations";

let lastRawSnapshot: string | null = null;
let lastParsedSnapshot: Accommodations = DEFAULT_ACC;

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === ACC_KEY) cb();
  };

  const onLocal = () => cb();

  window.addEventListener("storage", onStorage);
  window.addEventListener(ACC_EVENT, onLocal as EventListener);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(ACC_EVENT, onLocal as EventListener);
  };
}

function getSnapshot(): Accommodations {
  if (typeof window === "undefined") return DEFAULT_ACC;

  try {
    const raw = window.localStorage.getItem(ACC_KEY);
    if (raw === lastRawSnapshot) {
      return lastParsedSnapshot;
    }

    lastRawSnapshot = raw;
    lastParsedSnapshot = loadAcc();
    return lastParsedSnapshot;
  } catch {
    return lastParsedSnapshot;
  }
}

export function useAccommodations() {
  const acc = useSyncExternalStore<Accommodations>(
    subscribe,
    getSnapshot,
    () => DEFAULT_ACC,
  );

  return {
    acc,
    setAcc: saveAcc,
  };
}
