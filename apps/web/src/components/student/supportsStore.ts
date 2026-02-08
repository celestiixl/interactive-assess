"use client";

import { useEffect, useMemo, useState } from "react";

export type SupportLanguage = "en" | "es" | "vi" | "zh";

export type SupportsState = {
  /** Show helper translations/glosses under English (keeps English visible). */
  showSupport: boolean;
  /** Which helper language to show (Spanish for EB students by default). */
  supportLanguage: SupportLanguage;
};

const KEY = "ia.supports.v1";

const DEFAULTS: SupportsState = {
  showSupport: false,
  supportLanguage: "es",
};

function safeParse(json: string | null): SupportsState | null {
  if (!json) return null;
  try {
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== "object") return null;
    const showSupport = !!(obj as any).showSupport;
    const supportLanguage = (obj as any).supportLanguage;
    if (!["en", "es", "vi", "zh"].includes(supportLanguage)) return null;
    return { showSupport, supportLanguage } as SupportsState;
  } catch {
    return null;
  }
}

export function useSupports() {
  const [state, setState] = useState<SupportsState>(DEFAULTS);

  // load
  useEffect(() => {
    const v = safeParse(typeof window !== "undefined" ? localStorage.getItem(KEY) : null);
    if (v) setState(v);
  }, []);

  // persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const api = useMemo(() => {
    return {
      state,
      setShowSupport: (v: boolean) => setState((s) => ({ ...s, showSupport: v })),
      setSupportLanguage: (v: SupportLanguage) => setState((s) => ({ ...s, supportLanguage: v })),
    };
  }, [state]);

  return api;
}
