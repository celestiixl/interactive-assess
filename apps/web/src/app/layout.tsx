import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import PageShell from "@/components/ui/PageShell";
import OfflineSupport from "@/components/common/OfflineSupport";

export const metadata: Metadata = {
  title: { default: "BioSpark", template: "%s | BioSpark" },
  description:
    "FBISD 9th Grade Biology — mastery-based learning platform",
};

const initThemeScript = `(() => {
  try {
    const root = document.documentElement;
    root.dataset.theme = "dark";
    root.classList.add("dark");
    window.localStorage.setItem("ia.theme.v1", "dark");
  } catch {}
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
      </head>
      <body className="min-h-dvh bg-bs-bg font-sans text-bs-text antialiased">
        <PageShell>{children}</PageShell>
        <OfflineSupport />
      </body>
    </html>
  );
}
