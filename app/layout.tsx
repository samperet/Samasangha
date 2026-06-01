import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SamaSangha | Northeast Sufi Community",
    template: "%s | SamaSangha",
  },
  description:
    "SamaSangha (Northeast Sufi Circle) — a Sufi spiritual community in Massachusetts dedicated to the path of love, harmony, and beauty.",
  openGraph: {
    siteName: "SamaSangha",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
