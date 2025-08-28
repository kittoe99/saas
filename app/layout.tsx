import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hinn.io",
  description: "Pay‑by‑month, all‑inclusive website design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${interSans.variable} ${geistMono.variable} font-sans antialiased text-neutral-900`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
