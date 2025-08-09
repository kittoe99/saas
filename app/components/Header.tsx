"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const navItems = [
    { href: "#overview", label: "Overview" },
    { href: "#services", label: "Services" },
    { href: "#work", label: "Work" },
    { href: "#process", label: "Process" },
    { href: "#blog", label: "Blog" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <Link href="/" aria-label="hinn.io home" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-6 w-6 sm:h-7 sm:w-7"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="6" fill="#1a73e8" />
              <rect x="7" y="7" width="3.5" height="10" rx="1.75" fill="#ffffff" />
              <circle cx="16.5" cy="8.5" r="1.75" fill="#ffffff" />
            </svg>
            <span className="text-lg sm:text-xl font-semibold tracking-tight">hinn.io</span>
          </Link>

          {/* Inline nav on md+ */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm text-neutral-700">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-2 py-2 rounded-md hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <a
              href="#get-started"
              className="px-3 lg:px-4 py-2 rounded-md border border-[#1a73e8] text-[#1a73e8] bg-white inline-flex items-center gap-2 text-sm lg:text-base"
            >
              <span>Get Started Today</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a href="#signin" className="px-3 lg:px-4 py-2 rounded-md bg-[#1a73e8] text-white text-sm lg:text-base">
              Sign in
            </a>
          </div>

          {/* Hamburger on <md */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md border border-neutral-300 p-2 text-neutral-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile/Tablet collapsible menu */}
        {open && (
          <>
            {/* Backdrop overlay */}
            <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setOpen(false)} />
            {/* Dropdown sheet */}
            <div className="absolute left-0 right-0 top-full z-50 md:hidden">
              <nav className="mx-3 sm:mx-4 mt-2 flex flex-col rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3.5 text-base text-neutral-800 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="p-3.5 flex flex-col gap-2 bg-neutral-50">
                <a
                  href="#get-started"
                  className="w-full px-4 py-2.5 rounded-md border border-[#1a73e8] text-[#1a73e8] bg-white inline-flex items-center justify-center gap-2 text-base"
                  onClick={() => setOpen(false)}
                >
                  <span>Get Started Today</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="#signin"
                  className="w-full px-4 py-2.5 rounded-md bg-[#1a73e8] text-white text-base text-center"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </a>
              </div>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
