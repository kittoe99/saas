"use client";

import React, { useRef } from "react";

type Props = {
  children: React.ReactNode;
  ariaLabel?: string;
};

export default function ShowcaseSlider({ children, ariaLabel = "Showcase slider" }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  // No drag/press behavior per request

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.max(280, Math.min(520, Math.round(el.clientWidth * 0.8))) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Drag/swipe disabled

  // Keyboard support
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") { scrollByCards(1); }
    if (e.key === "ArrowLeft") { scrollByCards(-1); }
  };

  // Press-and-hold disabled; only single clicks

  return (
    <div className="relative">
      <style>{`
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      <div
        ref={scrollerRef}
        className="overflow-x-auto hide-scrollbar snap-x snap-proximity p-2 sm:p-3 touch-auto overscroll-x-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
      {/* Controls */}
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollByCards(-1)}
        className="flex absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-white/90 ring-1 ring-neutral-200 shadow-sm hover:bg-white z-10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-800"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollByCards(1)}
        className="flex absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 items-center justify-center rounded-full bg-white/90 ring-1 ring-neutral-200 shadow-sm hover:bg-white z-10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-800"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}
