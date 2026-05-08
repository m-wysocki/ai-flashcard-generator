import type { Metadata } from "next";
import { EB_Garamond, Figtree } from "next/font/google";
import "./globals.scss";

const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Flashcard Generator",
  description: "Private app for AI-assisted English learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${figtree.variable} ${ebGaramond.variable}`}>
      <body>{children}</body>
    </html>
  );
}
