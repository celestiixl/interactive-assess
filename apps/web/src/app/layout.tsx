import "./globals.css";
import type { ReactNode } from "react";
import PageShell from "@/components/ui/PageShell";
import ThemeToggle from "@/components/ia/ThemeToggle";

const initThemeScript = `(() => {
  try {
    const key = "ia.theme.v1";
    const stored = window.localStorage.getItem(key);
    const theme =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
  } catch {}
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <PageShell>{children}</PageShell>
        <ThemeToggle />
      </body>
    </html>
  );
}
