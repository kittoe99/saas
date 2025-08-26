import type { Metadata } from "next";
import Link from "next/link";
import FooterLinks from "./components/FooterLinks";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import ChatWidget from "./components/ChatWidget";

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
        <Header />
        <main className="max-w-5xl mx-auto px-3 sm:px-4">{children}</main>
        <footer className="mt-20 border-t border-[#2a2119] bg-[#0e0b08] text-[#faf6ec]">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 py-8 sm:py-10">
            <div className="flex items-center gap-2 sm:gap-2 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-7 w-7 sm:h-8 sm:w-8"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="6" fill="#1a73e8" />
                <rect x="7" y="7" width="3.5" height="10" rx="1.75" fill="#ffffff" />
                <circle cx="16.5" cy="8.5" r="1.75" fill="#ffffff" />
              </svg>
              <span className="text-lg sm:text-xl font-semibold tracking-tight">hinn.io</span>
            </div>
            <div className="md:flex md:items-end md:justify-between gap-8">
              <div className="md:max-w-md">
                <div className="rounded-md border border-neutral-200 bg-white p-4 text-neutral-900 shadow-soft">
                  <div className="text-lg font-medium">Stay in the loop</div>
                  <p className="mt-1 text-sm text-neutral-700">Occasional updates on new features and tips. No spam.</p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <label htmlFor="footer-email" className="sr-only">Email address</label>
                    <input
                      id="footer-email"
                      type="email"
                      aria-label="Email address"
                      placeholder="Enter your email"
                      className="flex-1 min-w-0 px-3 py-2 rounded-md border border-neutral-300 bg-white outline-none w-full text-neutral-900 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-sm"
                    />
                    <button className="px-4 py-2 rounded-md bg-success-accent text-white w-full sm:w-auto transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white">Subscribe</button>
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0 text-sm">
                <div className="font-medium">Follow us</div>
                <div className="mt-3 flex gap-5 overflow-x-auto no-scrollbar whitespace-nowrap">
                  <a href="#x" aria-label="X" target="_blank" rel="noopener noreferrer" className="text-[#faf6ec] hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">X</a>
                  <a href="#linkedin" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="text-[#faf6ec] hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">LinkedIn</a>
                  <a href="#github" aria-label="GitHub" target="_blank" rel="noopener noreferrer" className="text-[#faf6ec] hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">GitHub</a>
                  <a href="#instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="text-[#faf6ec] hover:text-success-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/60 focus-visible:rounded-sm transition-colors">Instagram</a>
                </div>
              </div>
            </div>
            <nav aria-label="Footer">
              <FooterLinks />
            </nav>
            <div className="mt-8 border-t border-neutral-800 pt-6 text-xs text-[#faf6ec]">© {new Date().getFullYear()} hinn.io</div>
          </div>
        </footer>
        {/* Floating Support/Chat button */}
        <ChatWidget />
      </body>
    </html>
  );
}
