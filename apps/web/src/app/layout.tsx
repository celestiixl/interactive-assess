import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, DM_Sans } from "next/font/google";
import OfflineSupport from "@/components/common/OfflineSupport";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "BioSpark", template: "%s | BioSpark" },
  description:
    "FBISD 9th Grade Biology — mastery-based learning platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head />
      <body className="min-h-dvh antialiased">
        <div className="ambient" aria-hidden="true" />
        {children}
        <OfflineSupport />
      </body>
    </html>
  );
}
