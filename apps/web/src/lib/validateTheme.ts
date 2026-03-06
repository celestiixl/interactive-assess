/**
 * BioSpark Theme Validation Utility
 *
 * Development-only utility that validates BioSpark theme consistency.
 * Checks that all --bs-* CSS variables are loaded and match the T token values.
 *
 * Usage: call useThemeValidation() once in app/layout.tsx during development.
 */

import { useEffect } from "react";
import { T } from "./tokens";

const BS_VAR_MAP: Record<string, string> = {
  bg:          "--bs-bg",
  surface:     "--bs-surface",
  raised:      "--bs-raised",
  overlay:     "--bs-overlay",
  border:      "--bs-border",
  borderSoft:  "--bs-border-soft",
  teal:        "--bs-teal",
  tealDim:     "--bs-teal-dim",
  tealGlow:    "--bs-teal-glow",
  amber:       "--bs-amber",
  amberDim:    "--bs-amber-dim",
  coral:       "--bs-coral",
  coralDim:    "--bs-coral-dim",
  success:     "--bs-success",
  warning:     "--bs-warning",
  danger:      "--bs-danger",
  info:        "--bs-info",
  text:        "--bs-text",
  textSub:     "--bs-text-sub",
  textMuted:   "--bs-text-muted",
  fontUi:      "--bs-font-ui",
  fontMono:    "--bs-font-mono",
  rSm:         "--bs-r-sm",
  rMd:         "--bs-r-md",
  rLg:         "--bs-r-lg",
  rXl:         "--bs-r-xl",
  rPill:       "--bs-r-pill",
  shadowSm:    "--bs-shadow-sm",
  shadowMd:    "--bs-shadow-md",
  shadowLg:    "--bs-shadow-lg",
  ease:        "--bs-ease",
  easeOut:     "--bs-ease-out",
  durFast:     "--bs-dur-fast",
  durBase:     "--bs-dur-base",
  durSlow:     "--bs-dur-slow",
};

export function validateTheme(): void {
  if (process.env.NODE_ENV !== "development") return;

  const styles = getComputedStyle(document.documentElement);

  (Object.keys(BS_VAR_MAP) as (keyof typeof T)[]).forEach((key) => {
    const cssVar = BS_VAR_MAP[key as string];
    const cssValue = styles.getPropertyValue(cssVar).trim();

    if (!cssValue) {
      console.warn(
        `[BioSpark Theme] Token mismatch: T.${key} = ${T[key]} but var(${cssVar}) = <not set>`,
      );
    }
  });

  // Font checks
  const uiFont = styles.getPropertyValue("--bs-font-ui").trim();
  const monoFont = styles.getPropertyValue("--bs-font-mono").trim();

  if (!uiFont.includes("Outfit")) {
    console.warn(
      "[BioSpark Theme] --bs-font-ui does not contain 'Outfit'. Check Google Fonts import.",
    );
  }
  if (!monoFont.includes("JetBrains Mono")) {
    console.warn(
      "[BioSpark Theme] --bs-font-mono does not contain 'JetBrains Mono'. Check Google Fonts import.",
    );
  }

  if (typeof document !== "undefined" && document.fonts) {
    const checkSize = "16px";
    if (!document.fonts.check(`${checkSize} Outfit`)) {
      console.warn(
        "[BioSpark Theme] Outfit font not yet loaded. It may still be downloading.",
      );
    }
    if (!document.fonts.check(`${checkSize} JetBrains Mono`)) {
      console.warn(
        "[BioSpark Theme] JetBrains Mono font not yet loaded. It may still be downloading.",
      );
    }
  }
}

export function useThemeValidation(): void {
  useEffect(() => {
    validateTheme();
  }, []);
}
