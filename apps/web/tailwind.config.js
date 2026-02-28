/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      // wosTokens: bioscience design system (do not remove)
      colors: {
        bg: "var(--bg-main)",
        surface: "var(--bg-elev)",
        ink: "var(--text-main)",
        muted: "var(--text-muted)",
        border: "var(--border-soft)",
        growth: "var(--accent-growth)",
        teal: "var(--accent-teal)",
        amber: "var(--accent-amber)",
        slate: "var(--accent-slate)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
