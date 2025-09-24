"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "./Header";
import FooterLinks from "./FooterLinks";
import ChatWidget from "./ChatWidget";
import Image from "next/image";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Treat dashboard-like areas as those under /dashboard, /onboarding, and nested /website/* (manage pages).
  // The marketing page at exactly /website should use the standard header/footer layout.
  const isDashboardArea = (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/website/") // note trailing slash to exclude the marketing page at /website
  );
  const suppressBreadcrumb = isDashboardArea;

  if (isDashboardArea) {
    // Hide main site nav/footer/chat for dashboard; page provides its own UI.
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {/* Breadcrumbs (container width, simple chevron-separated). Hidden on dashboard and website pages */}
      {pathname && pathname !== "/" && !suppressBreadcrumb && (
        <div className="max-w-5xl mx-auto px-3 sm:px-4 mt-2">
          <nav aria-label="Breadcrumb" className="text-[11px] sm:text-xs">
            <ol className="flex items-center flex-wrap gap-1 text-neutral-600">
              <li className="flex items-center">
                <Link href="/" className="inline-flex items-center hover:text-success-ink transition-colors">
                  <span>Home</span>
                </Link>
              </li>
              {(() => {
                const parts = pathname.split("/").filter(Boolean);
                let hrefAcc = "";
                return parts.map((seg, idx) => {
                  hrefAcc += `/${seg}`;
                  const isLast = idx === parts.length - 1;
                  const label = seg
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");
                  return (
                    <li key={hrefAcc} className="flex items-center">
                      <span aria-hidden className="mx-1 text-neutral-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </span>
                      {isLast ? (
                        <span aria-current="page" className="text-neutral-900 font-medium">{label}</span>
                      ) : (
                        <Link href={hrefAcc} className="hover:text-success-ink transition-colors">{label}</Link>
                      )}
                    </li>
                  );
                });
              })()}
            </ol>
          </nav>
        </div>
      )}
      <main className="max-w-5xl mx-auto px-3 sm:px-4">{children}</main>
      <footer className="mt-20 border-t border-[#2a2119] bg-[#0e0b08] text-[#faf6ec]">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-8 sm:py-10">
          <div className="flex items-center gap-2 sm:gap-2 mb-6">
            <Image src="/logo.svg" alt="Hinn.dev" width={32} height={32} className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className="text-lg sm:text-xl font-semibold tracking-tight !text-white">Hinn.dev</span>
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
          <div className="mt-8 border-t border-neutral-800 pt-6 text-xs text-white">© {new Date().getFullYear()} Hinn.dev</div>
        </div>
      </footer>
      {/* Floating Support/Chat button */}
      <ChatWidget />
    </>
  );
}
