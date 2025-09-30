"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export default function AmaBar() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("down");
  const lastYRef = useRef<number>(0);
  const [nearBottom, setNearBottom] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Show sticky bar when the section is mostly out of view (<20% visible)
        setShowSticky(entry.intersectionRatio < 0.2);
      },
      { root: null, threshold: [0, 0.2, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Track scroll direction
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      const last = lastYRef.current;
      if (y < last - 2) {
        setScrollDir("up");
      } else if (y > last + 2) {
        setScrollDir("down");
      }
      lastYRef.current = y;

      // Detect near-bottom to keep input accessible at bottom
      const doc = document.documentElement;
      const scrollHeight = doc.scrollHeight;
      const viewport = window.innerHeight;
      const threshold = 200; // px from bottom (increased for reliability)
      setNearBottom(y + viewport >= scrollHeight - threshold);
    };
    lastYRef.current = window.scrollY || window.pageYOffset;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Simple no-op submit handler (prevent page reload)
  const onSubmit = useMemo(
    () => (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // TODO: Wire to chat endpoint
    },
    []
  );

  const isBottom = nearBottom || scrollDir === "up";

  return (
    <>
      {/* Sticky minimal bar shown when section scrolled away */}
      <div
        className={`fixed inset-x-0 z-50 transition-transform duration-300 ${
          isBottom ? "" : "top-0"
        } ${(showSticky || nearBottom) ? "translate-y-0" : (isBottom) ? "translate-y-full" : "-translate-y-full"}`}
        style={isBottom ? { bottom: "calc(env(safe-area-inset-bottom) + 8px)" } : undefined}
        aria-hidden={!(showSticky || nearBottom)}
      >
        <div className={`backdrop-blur bg-white/80 border-neutral-200 ${
          isBottom ? "border-t" : "border-b"
        }`}>
          <div className={`max-w-3xl mx-auto px-3 sm:px-4 py-2 ${
            isBottom ? "" : ""
          }`}>
            <form onSubmit={onSubmit} className="">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything about pricing, features, timelines..."
                  aria-label="Ask Me Anything"
                  className="w-full rounded-full border border-neutral-200 bg-white px-4 py-2 pr-28 text-sm text-primary shadow-xs focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-accent-primary text-white shadow-[0_6px_20px_rgba(217,119,89,0.18)] transition-all hover:brightness-95"
                >
                  Ask
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Full section in-flow */}
      <section ref={sectionRef} className="py-6 md:py-8">
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-primary text-center flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5 text-accent-primary"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 3.866-3.582 7-8 7-1.168 0-2.272-.22-3.254-.615L4 20l1.748-3.059C5.27 16.02 5 14.997 5 14c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
            </svg>
            <span>Ask Me Anything</span>
          </h2>
          <style>{`
            /* Hide scrollbar for chips slider */
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .hide-scrollbar::-webkit-scrollbar { display: none; }
          `}</style>
          <p className="mt-2 text-sm md:text-base text-secondary text-center">Ask about pricing, features, timelines, or your website needs—I'll help instantly.</p>
          <form onSubmit={onSubmit} className="mt-5">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask about pricing, features, timelines, content updates..."
                aria-label="Ask Me Anything"
                className="w-full rounded-full border border-neutral-200 bg-white px-5 py-3 pr-28 text-sm md:text-base text-primary shadow-soft focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
              />
              <button
                type="submit"
                className="absolute right-1 top-1.5 inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold bg-accent-primary text-white shadow-[0_6px_20px_rgba(217,119,89,0.18)] transition-all hover:brightness-95"
              >
                Ask
              </button>
            </div>
          </form>
          <div className="mt-3 md:mt-4 -mx-3 sm:mx-0">
            <div className="overflow-x-auto hide-scrollbar px-3 sm:px-0" aria-label="Suggested questions">
              <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap sm:justify-center snap-x snap-mandatory">
                <a href="#" className="shrink-0 snap-start px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs md:text-sm text-primary hover:bg-neutral-50">What’s included in the plan?</a>
                <a href="#" className="shrink-0 snap-start px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs md:text-sm text-primary hover:bg-neutral-50">How fast can you launch?</a>
                <a href="#" className="shrink-0 snap-start px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs md:text-sm text-primary hover:bg-neutral-50">Can you use my domain?</a>
                <a href="#" className="shrink-0 snap-start px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs md:text-sm text-primary hover:bg-neutral-50">Do you handle updates?</a>
                <a href="#" className="shrink-0 snap-start px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs md:text-sm text-primary hover:bg-neutral-50">How much does it cost?</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
