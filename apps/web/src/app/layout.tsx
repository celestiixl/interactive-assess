import "./globals.css";
import type { ReactNode } from "react";
import PageShell from "@/components/ui/PageShell";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh text-slate-900 antialiased">
        <PageShell>{children}</PageShell>
      </body>
    </html>
  );
}
