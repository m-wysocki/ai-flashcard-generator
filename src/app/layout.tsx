import type { Metadata } from "next";
import "./globals.scss";

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
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
