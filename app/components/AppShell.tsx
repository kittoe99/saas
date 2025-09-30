"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "./Header";
import FooterLinks from "./FooterLinks";
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
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-10">
          {/* Top brand row */}
          <div className="flex items-center gap-2 sm:gap-2 mb-8">
            <Image src="/logo.svg" alt="Hinn.dev" width={32} height={32} className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className="text-lg sm:text-xl font-semibold tracking-tight !text-white">Hinn.dev</span>
          </div>

          {/* Content grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Newsletter card */}
            <div className="md:col-span-1">
              <div className="rounded-3xl border border-[#2a2119] bg-white/95 text-neutral-900 p-4 sm:p-5 backdrop-blur ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] transition-all">
                <div className="text-base sm:text-lg font-semibold">Stay in the loop</div>
                <p className="mt-1 text-sm text-neutral-700">Occasional updates on features and tips. No spam.</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <label htmlFor="footer-email" className="sr-only">Email address</label>
                  <input
                    id="footer-email"
                    type="email"
                    aria-label="Email address"
                    placeholder="Enter your email"
                    className="flex-1 min-w-0 px-3 py-2 rounded-md border border-neutral-300 bg-white outline-none w-full text-neutral-900 placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-sm"
                  />
                  <button className="px-4 py-2 rounded-full bg-accent-primary text-white w-full sm:w-auto transition-all hover:brightness-95 focus:outline-none">Subscribe</button>
                </div>
              </div>
            </div>

            {/* Link columns */}
            <div className="md:col-span-2">
              <div className="grid sm:grid-cols-3 gap-8">
                <div className="sm:col-span-2">
                  <nav aria-label="Footer">
                    <FooterLinks />
                  </nav>
                </div>
                {/* Socials */}
                <div>
                  <div className="text-sm font-medium text-[#faf6ec]">Follow</div>
                  <div className="mt-3 flex gap-3">
                    <a href="#x" aria-label="X" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2119] bg-white/5 hover:bg-white/10 transition-colors focus:outline-none">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-[#faf6ec]"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16M20 4L4 20"/></svg>
                    </a>
                    <a href="#linkedin" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2119] bg-white/5 hover:bg-white/10 transition-colors focus:outline-none">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#faf6ec]"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.1C12.7 8.9 14.6 8 16.9 8 22 8 24 11.4 24 16.1V24h-4v-6.9c0-1.6 0-3.7-2.3-3.7s-2.6 1.8-2.6 3.6V24h-4V8z"/></svg>
                    </a>
                    <a href="#github" aria-label="GitHub" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2119] bg-white/5 hover:bg-white/10 transition-colors focus:outline-none">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#faf6ec]"><path fillRule="evenodd" d="M12 .5a11.5 11.5 0 00-3.64 22.41c.58.11.79-.25.79-.56v-2c-3.22.7-3.9-1.4-3.9-1.4-.53-1.33-1.3-1.68-1.3-1.68-1.06-.72.08-.71.08-.71 1.18.08 1.8 1.22 1.8 1.22 1.04 1.8 2.72 1.28 3.38.98.11-.76.41-1.28.74-1.57-2.57-.29-5.27-1.29-5.27-5.72 0-1.26.45-2.28 1.2-3.08-.12-.29-.52-1.47.11-3.05 0 0 .98-.31 3.21 1.18a11.1 11.1 0 015.84 0c2.23-1.49 3.21-1.18 3.21-1.18.63 1.58.23 2.76.11 3.05.75.8 1.2 1.82 1.2 3.08 0 4.44-2.71 5.42-5.29 5.71.42.37.79 1.1.79 2.22v3.29c0 .31.21.67.8.56A11.5 11.5 0 0012 .5z" clipRule="evenodd"/></svg>
                    </a>
                    <a href="#instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2119] bg-white/5 hover:bg-white/10 transition-colors focus:outline-none">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#faf6ec]"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3.5A5.5 5.5 0 1017.5 13 5.5 5.5 0 0012 7.5zm0 2A3.5 3.5 0 1115.5 13 3.5 3.5 0 0112 9.5zM18 6.5a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 border-t border-[#2a2119] pt-6 text-xs !text-white/90 flex items-center justify-between gap-4 flex-wrap">
            <div>© {new Date().getFullYear()} Hinn.dev</div>
            <div className="text-white/60">All rights reserved.</div>
          </div>
        </div>
      </footer>
      {/* Floating Support/Chat button removed per request */}
    </>
  );
}
