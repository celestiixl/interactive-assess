/**
 * BioSpark design tokens (TypeScript)
 *
 * These values mirror the --bs-* CSS variables defined in globals.css.
 * Import T and use T.teal, T.surface, etc. for inline styles and canvas drawing.
 *
 * Usage:
 *   import T from "@/lib/tokens";
 *   style={{ color: T.teal, background: T.surface }}
 */

export const T = {
  // Backgrounds — 4 elevation levels
  bg:          "#0d1e2c",
  surface:     "#132638",
  raised:      "#1a3148",
  overlay:     "#213d58",

  // Borders
  border:      "#1e3f5a",
  borderSoft:  "#162f45",

  // Accent colors
  teal:        "#00d4aa",
  tealDim:     "rgba(0, 212, 170, 0.15)",
  /** Glow-specific box-shadow for teal accent elements (e.g. logo mark) */
  tealGlow:    "0 0 18px rgba(0, 212, 170, 0.28)",
  amber:       "#f5a623",
  amberDim:    "rgba(245, 166, 35, 0.15)",
  coral:       "#ff6b6b",
  coralDim:    "rgba(255, 107, 107, 0.15)",

  // Semantic colors
  success:     "#34d399",
  warning:     "#fbbf24",
  danger:      "#f87171",
  info:        "#60a5fa",

  // Text
  text:        "#e8f4f0",
  textSub:     "#9abcb0",
  textMuted:   "#5a8070",

  // Typography
  fontUi:      "'DynaPuff', sans-serif",
  fontMono:    "'JetBrains Mono', monospace",

  // Border radii
  rSm:         "6px",
  rMd:         "10px",
  rLg:         "16px",
  rXl:         "22px",
  rPill:       "999px",

  // Shadows
  shadowSm:    "0 1px 4px rgba(0,0,0,0.35)",
  shadowMd:    "0 4px 16px rgba(0,0,0,0.40)",
  shadowLg:    "0 8px 32px rgba(0,0,0,0.45)",

  // Motion
  ease:        "cubic-bezier(0.34, 1.2, 0.64, 1)",
  easeOut:     "cubic-bezier(0.22, 1, 0.36, 1)",
  durFast:     "120ms",
  durBase:     "220ms",
  durSlow:     "380ms",
} as const;

export type TokenKey = keyof typeof T;

export default T;
