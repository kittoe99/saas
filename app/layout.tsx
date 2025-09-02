import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import { Inter } from "next/font/google";
import "./globals.css";

const interSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Removed mono font to avoid Turbopack internal font resolver issue

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
      <body className={`${interSans.variable} font-sans antialiased text-neutral-900`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
