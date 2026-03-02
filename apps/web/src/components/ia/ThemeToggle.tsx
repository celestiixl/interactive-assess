"use client";

import { useTheme } from "@/lib/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 z-50 rounded-full border border-[rgb(var(--ia-border))] bg-[rgba(var(--ia-card),0.92)] px-3 py-2 text-xs font-semibold text-[rgb(var(--ia-ink))] shadow-sm backdrop-blur hover:bg-[rgb(var(--ia-card))]"
      aria-label={`Toggle theme. Current mode: ${isDark ? "dark" : "light"}`}
      title={`Theme: ${isDark ? "dark" : "light"}`}
    >
      {isDark ? "🌙 Dark mode" : "☀️ Light mode"}
    </button>
  );
}
