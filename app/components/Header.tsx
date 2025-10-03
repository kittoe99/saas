"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const router = useRouter();
  const [loginHref, setLoginHref] = useState<string>("/login");
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

  // Compute login link with next param
  useEffect(() => {
    try {
      const next = `${window.location.pathname}${window.location.search}`;
      setLoginHref(`/login?next=${encodeURIComponent(next)}`);
    } catch {
      setLoginHref(`/login`);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-page border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          <Link href="/" aria-label="Hinn.dev home" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Hinn.dev" width={28} height={28} className="h-6 w-6 sm:h-7 sm:w-7" priority />
            <span className="text-lg sm:text-xl font-semibold tracking-tight">Hinn.dev</span>
          </Link>

          {/* Inline nav on md+ */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4 text-base text-neutral-900 bg-page">
            {/* Overview */}
            <a
              href="#overview"
              className="font-semibold hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
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
              <div className="inline-flex items-center gap-1">
                <span className="cursor-default select-none font-semibold">Features</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>

              {featuresOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-[min(90vw,44rem)]" onMouseEnter={cancelFeaturesClose} onMouseLeave={scheduleFeaturesClose}>
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 grid grid-cols-2 md:grid-cols-2 gap-4 text-neutral-900">
                    <a href="#features-website" className="block px-3 py-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                      <div className="text-sm font-medium">Website</div>
                      <div className="mt-1 text-xs text-neutral-800">Design + hosting + updates included.</div>
                    </a>
                    <a href="#features-sales" className="block px-3 py-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                      <div className="text-sm font-medium">Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-800">Funnels, forms, and workflows.</div>
                    </a>
                    <a href="#features-ai" className="block px-3 py-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                      <div className="text-sm font-medium">Artificial Intelligence <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-800">Content, insights, and assistance.</div>
                    </a>
                    <a href="#features-payments" className="block px-3 py-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                      <div className="text-sm font-medium">Payments <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-800">Subscriptions and one‑time purchases.</div>
                    </a>
                  </div>
                </div>
              )}
            </div>
            {/* Showcase */}
            <Link
              href="/showcase"
              className="font-semibold hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
            >
              Showcase
            </Link>
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
              <div className="inline-flex items-center gap-1">
                <span className="cursor-default select-none font-semibold">Tools</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>

              {toolsOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-[min(90vw,48rem)]" onMouseEnter={cancelToolsClose} onMouseLeave={scheduleToolsClose}>
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-neutral-900">
                    {/* Columnized tool links */}
                    <a href="#tools-ai-website-builder" className="block px-3 py-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                      <div className="text-sm font-medium">Ai Website Builder <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-800">Generate and launch sites with AI assistance.</div>
                    </a>
                    <a href="#tools-ai-agents" className="block px-3 py-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                      <div className="text-sm font-medium">Ai Agents <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-800">Automate support and operations with agents.</div>
                    </a>
                    <a href="#tools-sales" className="block px-3 py-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                      <div className="text-sm font-medium">Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-800">Funnels, workflows, and lead capture.</div>
                    </a>
                    <a href="#tools-payments" className="block px-3 py-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                      <div className="text-sm font-medium">Payment Processing <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-800">Subscriptions and one‑time payments.</div>
                    </a>
                    <a href="#tools-custom-ai" className="block px-3 py-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                      <div className="text-sm font-medium">Custom Ai solution <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
                      <div className="mt-1 text-xs text-neutral-800">Tailored AI workflows for your business.</div>
                    </a>
                  </div>
                </div>
              )}
            </div>
            {/* News removed */}
            {/* Contact */}
            <Link
              href="/contact"
              className="font-semibold hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
            >
              Contact
            </Link>
          </nav>

          {/* Actions (pill buttons) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <a
              href="/signup"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold bg-black text-white border border-black text-sm md:text-base transition-colors hover:bg-neutral-900 focus:outline-none whitespace-nowrap"
            >
              <span>Get started</span>
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
              href={loginHref}
              className="inline-flex items-center px-3 lg:px-4 py-2 rounded-full font-semibold bg-accent-primary text-white text-sm lg:text-base shadow-[0_6px_20px_rgba(217,119,89,0.18)] transition-all hover:brightness-95 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(217,119,89,0.22)]"
            >
              Login
            </a>
          </div>

          {/* Hamburger on <md */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-md border border-neutral-300 p-2.5 text-neutral-900 bg-white hover:bg-neutral-50 active:bg-neutral-100 transition-colors no-btn-shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              className="h-5 w-5"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 8l8 8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l-8 8" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" d="M7.5 9.5h9" />
                  <path strokeLinecap="round" d="M7.5 12h9" />
                  <path strokeLinecap="round" d="M7.5 14.5h9" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile/Tablet collapsible menu */}
        {open && (
          <>
            {/* Backdrop overlay */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 md:hidden" onClick={() => setOpen(false)} />
            {/* Dropdown sheet */}
            <div className="absolute left-0 right-0 top-full z-50 md:hidden">
              <nav className="mx-3 sm:mx-4 mt-2 flex flex-col rounded-xl border border-neutral-200 bg-white text-neutral-900 overflow-hidden animate-mobile-menu">
              {/* Overview */}
              <a
                href="#overview"
                className="block px-4 py-4 text-base hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
                onClick={() => setOpen(false)}
              >
                Overview
              </a>
              <div className="h-px bg-neutral-100" />
              {/* Features - collapsible group */}
              <details>
                <summary className="flex items-center justify-between px-4 py-4 text-base hover:bg-neutral-50 cursor-pointer select-none">
                  <span>Features</span>
                  <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                </summary>
                <div className="pb-3">
                  <a href="#features-website" className="block px-6 py-2 hover:bg-neutral-50" onClick={() => setOpen(false)}>Website</a>
                  <a href="#features-sales" className="block px-6 py-2 hover:bg-neutral-50" onClick={() => setOpen(false)}>Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#features-ai" className="block px-6 py-2 hover:bg-neutral-50" onClick={() => setOpen(false)}>Artificial Intelligence <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                </div>
              </details>
              <div className="h-px bg-neutral-100" />
              {/* Showcase */}
              <Link
                href="/showcase"
                className="block px-4 py-4 text-base hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
                onClick={() => setOpen(false)}
              >
                Showcase
              </Link>
              <div className="h-px bg-neutral-100" />
              {/* Tools - collapsible group */}
              <details>
                <summary className="flex items-center justify-between px-4 py-4 text-base hover:bg-neutral-50 cursor-pointer select-none">
                  <span>Tools</span>
                  <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                </summary>
                <div className="pb-3">
                  <a href="#tools-ai-website-builder" className="block px-6 py-2 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent" onClick={() => setOpen(false)}>Ai Website Builder <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#tools-ai-agents" className="block px-6 py-2 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent" onClick={() => setOpen(false)}>Ai Agents <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#tools-sales" className="block px-6 py-2 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent" onClick={() => setOpen(false)}>Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#tools-payments" className="block px-6 py-2 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent" onClick={() => setOpen(false)}>Payment Processing <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                  <a href="#tools-custom-ai" className="block px-6 py-2 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent" onClick={() => setOpen(false)}>Custom Ai solution <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></a>
                </div>
              </details>
              <div className="h-px bg-neutral-100" />
              {/* News removed */}
              <div className="h-px bg-neutral-100" />
              {/* Contact */}
              <Link
                href="/contact"
                className="block px-4 py-4 text-base hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
                onClick={() => setOpen(false)}
              >
                Contact
              </Link>
              <div className="p-3.5 flex flex-col gap-2 bg-white">
                <a
                  href="/signup"
                  className="w-full inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold bg-black text-white border border-black text-base transition-colors hover:bg-neutral-900 focus:outline-none whitespace-nowrap"
                  onClick={() => setOpen(false)}
                >
                  <span>Get started</span>
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
                  href={loginHref}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-full font-semibold bg-accent-primary text-white text-base shadow-[0_6px_20px_rgba(217,119,89,0.18)] transition-all hover:brightness-95 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(217,119,89,0.22)]"
                  onClick={() => setOpen(false)}
                >
                  Login
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
