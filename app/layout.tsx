import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import PixelInit from "@/components/PixelInit";
import AnalyticsInit from "@/components/AnalyticsInit";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600"],
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finmonk — Loan Against Car | Instant Cash Up to ₹10 Lakhs",
  description:
    "Get a loan against your car without selling it. Approval in 24 hours, car stays with you. Check eligibility free in 2 minutes.",
  keywords: "loan against car, LAC, car loan India, instant cash, Finmonk",
  icons: {
    icon: "/finmonk-logo.png",
  },
  openGraph: {
    title: "Finmonk — Turn Your Car Into Instant Cash",
    description: "Get up to ₹10 Lakhs against your car. Keep driving. Get funded.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${dmSans.variable} ${spaceMono.variable}`}
        style={{ fontFamily: "var(--font-dm), sans-serif" }}
      >
        <PixelInit />
        <AnalyticsInit />
        {children}
      </body>
    </html>
  );
}
