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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
      </head>
      <body className="min-h-dvh bg-bs-bg font-sans text-bs-text antialiased">
        <div className="ambient" aria-hidden="true" />
        <PageShell>{children}</PageShell>
        <OfflineSupport />
      </body>
    </html>
  );
}
