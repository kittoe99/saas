import type { Metadata } from "next";
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
        className={`${interSans.variable} ${geistMono.variable} font-sans antialiased bg-white text-neutral-900`}
      >
        <Header />
        <main className="max-w-6xl mx-auto px-3 sm:px-4">{children}</main>
        <footer className="mt-20 border-t border-neutral-200 bg-neutral-50">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-10">
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
                <div className="rounded-md border border-neutral-200 bg-white p-4">
                  <div className="text-lg font-medium">Stay in the loop</div>
                  <p className="mt-1 text-sm text-neutral-600">Occasional updates on new features and tips. No spam.</p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 min-w-0 px-3 py-2 rounded-md border border-neutral-200 bg-transparent focus:bg-white outline-none w-full"
                    />
                    <button className="px-4 py-2 rounded-md bg-[#1a73e8] text-white w-full sm:w-auto">Subscribe</button>
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0 text-sm">
                <div className="font-medium">Follow us</div>
                <div className="mt-3 flex gap-5 overflow-x-auto no-scrollbar whitespace-nowrap">
                  <a href="#x" aria-label="X" className="text-neutral-700 hover:text-neutral-900">X</a>
                  <a href="#linkedin" aria-label="LinkedIn" className="text-neutral-700 hover:text-neutral-900">LinkedIn</a>
                  <a href="#github" aria-label="GitHub" className="text-neutral-700 hover:text-neutral-900">GitHub</a>
                  <a href="#instagram" aria-label="Instagram" className="text-neutral-700 hover:text-neutral-900">Instagram</a>
                </div>
              </div>
            </div>
            <div className="mt-8 text-sm flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-3 text-neutral-700">
              <a href="#overview" className="hover:text-neutral-900">Overview</a>
              <a href="#features" className="hover:text-neutral-900">Features</a>
              <a href="/showcase" className="hover:text-neutral-900">Showcase</a>
              <a href="#tools" className="hover:text-neutral-900">Tools</a>
              <a href="/blog" className="hover:text-neutral-900">News</a>
              <a href="/contact" className="hover:text-neutral-900">Contact</a>
              <a href="#privacy" className="hover:text-neutral-900">Privacy</a>
              <a href="#terms" className="hover:text-neutral-900">Terms</a>
            </div>
            <div className="mt-8 border-t border-neutral-200 pt-6 text-xs text-neutral-500">© {new Date().getFullYear()} hinn.io</div>
          </div>
        </footer>
        {/* Floating Support/Chat button */}
        <ChatWidget />
      </body>
    </html>
  );
}
