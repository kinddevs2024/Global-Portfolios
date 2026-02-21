import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AutoTranslator } from "@/components/auto-translator";
import { ThemeController } from "@/components/theme-controller";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Global Portfolios",
  description: "Student ↔ University Intelligent Bridge Platform",
  icons: {
    icon: "/logo_logo.png",
    shortcut: "/logo_logo.png",
    apple: "/logo_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeController />
        <AutoTranslator />
        {children}
      </body>
    </html>
  );
}
