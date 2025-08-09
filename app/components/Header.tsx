"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const featuresMenuRef = useRef<HTMLDivElement | null>(null);
  const toolsMenuRef = useRef<HTMLDivElement | null>(null);
  const featuresCloseTimerRef = useRef<number | null>(null);
  const toolsCloseTimerRef = useRef<number | null>(null);

  function cancelFeaturesClose() {
    if (featuresCloseTimerRef.current !== null) {
      window.clearTimeout(featuresCloseTimerRef.current);
      featuresCloseTimerRef.current = null;
    }
  }
  function scheduleFeaturesClose() {
    cancelFeaturesClose();
    featuresCloseTimerRef.current = window.setTimeout(() => setFeaturesOpen(false), 220);
  }
  function cancelToolsClose() {
    if (toolsCloseTimerRef.current !== null) {
      window.clearTimeout(toolsCloseTimerRef.current);
      toolsCloseTimerRef.current = null;
    }
  }
  function scheduleToolsClose() {
    cancelToolsClose();
    toolsCloseTimerRef.current = window.setTimeout(() => setToolsOpen(false), 220);
  }

  // Nav items are rendered inline to allow the Tools megamenu

  // Close Tools menu when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (featuresMenuRef.current && !featuresMenuRef.current.contains(target)) {
        setFeaturesOpen(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(target)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => {
      document.removeEventListener("click", onDocClick);
      cancelFeaturesClose();
      cancelToolsClose();
    };
  }, []);

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
            {/* Overview */}
            <a
              href="#overview"
              className="px-2 py-2 rounded-md hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
            >
              Overview
            </a>
            {/* Features (megamenu) */}
            <div
              className="relative"
              ref={featuresMenuRef}
              onMouseEnter={() => {
                cancelFeaturesClose();
                setFeaturesOpen(true);
              }}
              onMouseLeave={scheduleFeaturesClose}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={featuresOpen}
                className="px-2 py-2 rounded-md hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] inline-flex items-center gap-1"
                onClick={() => setFeaturesOpen((v) => !v)}
              >
                <span>Features</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {featuresOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-[min(90vw,40rem)]" onMouseEnter={cancelFeaturesClose} onMouseLeave={scheduleFeaturesClose}>
                  <div className="rounded-xl border border-neutral-200 bg-white shadow-xl p-4 grid grid-cols-2 md:grid-cols-2 gap-3">
                    <a href="#features-website" className="rounded-lg p-3 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]">
                      <div className="text-sm font-medium">Website</div>
                      <div className="mt-1 text-xs text-neutral-600">Design + hosting + updates included.</div>
                    </a>
                    <a href="#features-sales" className="relative rounded-lg p-3 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]">
                      <div className="text-sm font-medium">Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-600">Funnels, forms, and workflows.</div>
                    </a>
                    <a href="#features-ai" className="relative rounded-lg p-3 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]">
                      <div className="text-sm font-medium">Artificial Intelligence <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-600">Content, insights, and assistance.</div>
                    </a>
                    <a href="#features-payments" className="relative rounded-lg p-3 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]">
                      <div className="text-sm font-medium">Payments <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-600">Subscriptions and one‑time purchases.</div>
                    </a>
                  </div>
                </div>
              )}
            </div>
            {/* Showcase */}
            <a
              href="/showcase"
              className="px-2 py-2 rounded-md hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
            >
              Showcase
            </a>
            {/* Tools (megamenu) */}
            <div
              className="relative"
              ref={toolsMenuRef}
              onMouseEnter={() => {
                cancelToolsClose();
                setToolsOpen(true);
              }}
              onMouseLeave={scheduleToolsClose}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={toolsOpen}
                className="px-2 py-2 rounded-md hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] inline-flex items-center gap-1"
                onClick={() => setToolsOpen((v) => !v)}
              >
                <span>Tools</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {toolsOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-[min(90vw,44rem)]" onMouseEnter={cancelToolsClose} onMouseLeave={scheduleToolsClose}>
                  <div className="rounded-xl border border-neutral-200 bg-white shadow-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* Columnized tool links */}
                    <a href="#tools-ai-website-builder" className="relative rounded-lg p-3 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]">
                      <div className="text-sm font-medium">Ai Website Builder <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-600">Generate and launch sites with AI assistance.</div>
                    </a>
                    <a href="#tools-ai-agents" className="relative rounded-lg p-3 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]">
                      <div className="text-sm font-medium">Ai Agents <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-600">Automate support and operations with agents.</div>
                    </a>
                    <a href="#tools-sales" className="relative rounded-lg p-3 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]">
                      <div className="text-sm font-medium">Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-600">Funnels, workflows, and lead capture.</div>
                    </a>
                    <a href="#tools-payments" className="relative rounded-lg p-3 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]">
                      <div className="text-sm font-medium">Payment Processing <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-600">Subscriptions and one‑time payments.</div>
                    </a>
                    <a href="#tools-custom-ai" className="relative rounded-lg p-3 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]">
                      <div className="text-sm font-medium">Custom Ai solution <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-600">Tailored AI workflows for your business.</div>
                    </a>
                  </div>
                </div>
              )}
            </div>
            {/* News */}
            <Link
              href="/blog"
              className="px-2 py-2 rounded-md hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
            >
              News
            </Link>
            {/* Contact */}
            <a
              href="/contact"
              className="px-2 py-2 rounded-md hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
            >
              Contact
            </a>
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
              {/* Overview */}
              <a
                href="#overview"
                className="px-4 py-3.5 text-base text-neutral-800 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
                onClick={() => setOpen(false)}
              >
                Overview
              </a>
              {/* Features - collapsible group */}
              <details>
                <summary className="px-4 py-3.5 text-base text-neutral-800 hover:bg-neutral-50 cursor-pointer select-none">Features</summary>
                <div className="pb-3">
                  <a href="#features-website" className="block px-6 py-2 text-neutral-700 hover:bg-neutral-50" onClick={() => setOpen(false)}>Website</a>
                  <a href="#features-sales" className="block px-6 py-2 text-neutral-700 hover:bg-neutral-50" onClick={() => setOpen(false)}>Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#features-ai" className="block px-6 py-2 text-neutral-700 hover:bg-neutral-50" onClick={() => setOpen(false)}>Artificial Intelligence <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#features-payments" className="block px-6 py-2 text-neutral-700 hover:bg-neutral-50" onClick={() => setOpen(false)}>Payments <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                </div>
              </details>
              {/* Showcase */}
              <a
                href="/showcase"
                className="px-4 py-3.5 text-base text-neutral-800 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
                onClick={() => setOpen(false)}
              >
                Showcase
              </a>
              {/* Tools - collapsible group */}
              <details>
                <summary className="px-4 py-3.5 text-base text-neutral-800 hover:bg-neutral-50 cursor-pointer select-none">Tools</summary>
                <div className="pb-3">
                  <a href="#tools-ai-website-builder" className="block px-6 py-2 text-neutral-700 hover:bg-neutral-50" onClick={() => setOpen(false)}>Ai Website Builder <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#tools-ai-agents" className="block px-6 py-2 text-neutral-700 hover:bg-neutral-50" onClick={() => setOpen(false)}>Ai Agents <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#tools-sales" className="block px-6 py-2 text-neutral-700 hover:bg-neutral-50" onClick={() => setOpen(false)}>Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#tools-payments" className="block px-6 py-2 text-neutral-700 hover:bg-neutral-50" onClick={() => setOpen(false)}>Payment Processing <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#tools-custom-ai" className="block px-6 py-2 text-neutral-700 hover:bg-neutral-50" onClick={() => setOpen(false)}>Custom Ai solution <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                </div>
              </details>
              {/* News */}
              <Link
                href="/blog"
                className="px-4 py-3.5 text-base text-neutral-800 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
                onClick={() => setOpen(false)}
              >
                News
              </Link>
              {/* Contact */}
              <a
                href="/contact"
                className="px-4 py-3.5 text-base text-neutral-800 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8]"
                onClick={() => setOpen(false)}
              >
                Contact
              </a>
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
