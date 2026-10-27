import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  weight: ["400", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flashcards AI",
  description: "Private app for AI-assisted English learning.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: "Flashcards AI",
    capable: true,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // iOS PWA: Safari auto-zoomuje po focusie na input i nie oddala widoku
  // po schowaniu klawiatury, przez co layout "rozjeżdża się" za ekran.
  // maximumScale=1 blokuje ten zoom. Pola mają też min. 16px (globals.css).
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#fef9ea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={quicksand.variable}>
      <body>{children}</body>
    </html>
  );
}
