import type { Metadata } from "next";
import { Cormorant_Garamond, Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { getSiteDesign } from "@/lib/design";

// Brand wordmark font, used for the "Sama" / "Sangha" logo lockup
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

const openSans = Open_Sans({
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
    "Sama Sangha, a Sufi spiritual community in Massachusetts dedicated to the path of love, harmony, and beauty.",
  openGraph: {
    siteName: "SamaSangha",
    locale: "en_US",
    type: "website",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The content column's colour is editable in /admin/design. Both tokens are
  // the same cream by default and together form one surface — the column and
  // the cards sitting on it — so a change to one without the other leaves the
  // cards as visibly lighter patches.
  const { bgColor } = await getSiteDesign();

  return (
    <html
      lang="en"
      className={`h-full ${cormorant.variable} ${openSans.variable} ${samaFont.variable}`}
      style={{ "--column-cream": bgColor, "--bg-raised": bgColor } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
