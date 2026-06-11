import type { Metadata } from "next";
import { Cormorant_Garamond, Mulish } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Brand wordmark font — used for the "Sama" / "Sangha" logo lockup
const samaFont = localFont({
  src: "./fonts/SamaFont.ttf",
  variable: "--font-sama",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SamaSangha | Sufi Community in Massachusetts",
    template: "%s | SamaSangha",
  },
  description:
    "Sama Sangha — a Sufi spiritual community in Massachusetts dedicated to the path of love, harmony, and beauty.",
  openGraph: {
    siteName: "SamaSangha",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${cormorant.variable} ${mulish.variable} ${samaFont.variable}`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
