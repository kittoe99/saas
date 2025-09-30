"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

export default function AmaBar() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("down");
  const lastYRef = useRef<number>(0);
  const lastDirChangeTsRef = useRef<number>(0);
  const [nearBottom, setNearBottom] = useState(false);
  const nearBottomRef = useRef<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [expandFrom, setExpandFrom] = useState<"top" | "bottom">("top");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [pending, setPending] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [typedText, setTypedText] = useState("");
  const typeIntervalRef = useRef<number | null>(null);
  const thinkTimeoutRef = useRef<number | null>(null);
  const messagesBoxRef = useRef<HTMLDivElement | null>(null);

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
    const MIN_DELTA = 24; // px movement before changing direction
    const COOLDOWN_MS = 150; // ms between direction flips
    const ENTER_NEAR_BOTTOM = 240; // px
    const EXIT_NEAR_BOTTOM = 320; // px (hysteresis)

    let ticking = false;

    const process = () => {
      ticking = false;
      const y = window.scrollY || window.pageYOffset;
      const now = performance.now();
      const last = lastYRef.current;
      const dy = y - last;
      if (Math.abs(dy) >= MIN_DELTA && now - lastDirChangeTsRef.current >= COOLDOWN_MS) {
        if (dy < 0) setScrollDir("up");
        else if (dy > 0) setScrollDir("down");
        lastDirChangeTsRef.current = now;
        lastYRef.current = y;
      }

      // Near-bottom with hysteresis
      const doc = document.documentElement;
      const scrollHeight = doc.scrollHeight;
      const viewport = window.innerHeight;
      const dist = scrollHeight - (y + viewport);
      if (!nearBottomRef.current && dist <= ENTER_NEAR_BOTTOM) {
        nearBottomRef.current = true;
        setNearBottom(true);
      } else if (nearBottomRef.current && dist > EXIT_NEAR_BOTTOM) {
        nearBottomRef.current = false;
        setNearBottom(false);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(process);
      }
    };

    lastYRef.current = window.scrollY || window.pageYOffset;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Simple no-op submit handler (prevent page reload)
  const onSubmit = useMemo(
    () => (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      // Read the closest input value from the submitted form
      const form = e.currentTarget;
      const inputEl = form.querySelector("input") as HTMLInputElement | null;
      const q = (inputEl?.value || "").trim();
      if (!q) return;

      // Decide expansion direction based on trigger position on screen.
      // Works for both normal (in-flow) and sticky states.
      const viewportH = window.innerHeight;
      const formRect = form.getBoundingClientRect();
      const preferFrom = formRect.top < viewportH / 2 ? "top" : "bottom";
      const fallbackFrom = nearBottom || scrollDir === "up" ? "bottom" : "top";

      // Seed modal chat and open
      setMessages([{ role: "user", content: q }]);
      setPending("");
      setExpandFrom(preferFrom || fallbackFrom);
      setModalOpen(true);
      // Kick off demo assistant response
      demoRespond(q);
      // Optional: clear the inline input
      if (inputEl) inputEl.value = "";
    },
    []
  );

  const isBottom = nearBottom || scrollDir === "up";

  // Open modal with a given prompt from an element (to determine direction)
  const handleSuggestion = (e: React.MouseEvent<HTMLButtonElement>, prompt: string) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const preferFrom = rect.top < window.innerHeight / 2 ? "top" : "bottom";
    setMessages([{ role: "user", content: prompt }]);
    setPending("");
    setExpandFrom(preferFrom);
    setModalOpen(true);
    demoRespond(prompt);
  };

  // Demo responder with typewriter effect and thinking delay
  const demoRespond = (userPrompt: string) => {
    // Prevent overlapping responses
    if (isThinking || typedText) return;
    const samples = [
      "Great question! Our plan includes design, hosting, SSL, analytics, on-page SEO, and monthly content updates.",
      "We can typically launch an initial version within 3–5 business days, followed by quick iterations.",
      "Yes — you can use your existing domain. We handle DNS and SSL setup so it’s secure from day one.",
      "We manage ongoing updates each month. Send content or requests anytime and we’ll ship it.",
      "Pricing is simple: a flat monthly rate with everything included. No hidden fees."
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];

    setIsThinking(true);
    setTypedText("");
    // Simulate thinking delay
    thinkTimeoutRef.current = window.setTimeout(() => {
      const full = pick;
      let i = 0;
      // Typewriter speed
      typeIntervalRef.current = window.setInterval(() => {
        i += 1;
        setTypedText(full.slice(0, i));
        if (i >= full.length) {
          if (typeIntervalRef.current) window.clearInterval(typeIntervalRef.current);
          setMessages((prev) => [...prev, { role: "assistant", content: full }]);
          setTypedText("");
          setIsThinking(false);
        }
      }, 18);
    }, 700) as unknown as number;
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (typeIntervalRef.current) window.clearInterval(typeIntervalRef.current);
      if (thinkTimeoutRef.current) window.clearTimeout(thinkTimeoutRef.current);
    };
  }, []);

  // Auto-scroll chat to bottom on new content
  useEffect(() => {
    const el = messagesBoxRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typedText, isThinking]);

  return (
    <>
      {/* Sticky minimal bar shown when section scrolled away */}
      <div
        className={`fixed inset-x-0 z-50 transition-transform duration-300 ${
          isBottom ? "" : "top-0"
        } ${(showSticky || nearBottom) ? "translate-y-0 pointer-events-auto" : (isBottom) ? "translate-y-full pointer-events-none" : "-translate-y-full pointer-events-none"}`}
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
          <div className="mt-3 md:mt-4">
            <div className="overflow-x-auto hide-scrollbar px-2 touch-pan-x" aria-label="Suggested questions">
              <div className="flex flex-nowrap items-center gap-2 whitespace-nowrap sm:justify-center snap-x snap-mandatory">
                <button type="button" onClick={(e) => handleSuggestion(e, "What’s included in the plan?")} className="shrink-0 snap-start px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs md:text-sm text-primary hover:bg-neutral-50">What’s included in the plan?</button>
                <button type="button" onClick={(e) => handleSuggestion(e, "How fast can you launch?")} className="shrink-0 snap-start px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs md:text-sm text-primary hover:bg-neutral-50">How fast can you launch?</button>
                <button type="button" onClick={(e) => handleSuggestion(e, "Can you use my domain?")} className="shrink-0 snap-start px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs md:text-sm text-primary hover:bg-neutral-50">Can you use my domain?</button>
                <button type="button" onClick={(e) => handleSuggestion(e, "Do you handle updates?")} className="shrink-0 snap-start px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs md:text-sm text-primary hover:bg-neutral-50">Do you handle updates?</button>
                <button type="button" onClick={(e) => handleSuggestion(e, "How much does it cost?")} className="shrink-0 snap-start px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-xs md:text-sm text-primary hover:bg-neutral-50">How much does it cost?</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-100 transition-opacity"
            onClick={() => setModalOpen(false)}
          />
          {/* Panel */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-[min(92vw,44rem)] h-[70vh] bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 ease-out ${
              expandFrom === "top" ? "top-4 translate-y-0" : "bottom-4 translate-y-0"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="AI Chat"
          >
            {/* Local styles for typing caret and dots */}
            <style>{`
              @keyframes caretBlink { 0%, 100% { opacity: 0 } 50% { opacity: 1 } }
              .typing-caret { display:inline-block; width:1px; height:1em; background: currentColor; margin-left:2px; animation: caretBlink 1s step-end infinite; vertical-align:-2px; }
              .dot { animation: dotPulse 1.2s infinite ease-in-out; }
              .dot:nth-child(2) { animation-delay: .15s }
              .dot:nth-child(3) { animation-delay: .3s }
              @keyframes dotPulse { 0%, 80%, 100% { transform: scale(0.7); opacity: .5 } 40% { transform: scale(1); opacity: 1 } }
            `}</style>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-accent-primary"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 3.866-3.582 7-8 7-1.168 0-2.272-.22-3.254-.615L4 20l1.748-3.059C5.27 16.02 5 14.997 5 14c0-3.866 3.582-7 8-7s8 3.134 8 7z"/></svg>
                <span>Assistant</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-full p-1.5 hover:bg-neutral-100" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>
            {/* Messages */}
            <div ref={messagesBoxRef} className="h-[calc(70vh-128px)] overflow-y-auto p-4 space-y-3 bg-white">
              {messages.map((m, idx) => (
                <div key={idx} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-soft ${m.role === "user" ? "ml-auto bg-[color:var(--accent-subtle)] text-primary" : "mr-auto bg-neutral-100 text-primary"}`}>
                  {m.content}
                </div>
              ))}
              {/* Thinking indicator */}
              {isThinking && !typedText && (
                <div className="mr-auto max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed bg-neutral-100 text-primary shadow-soft inline-flex items-center gap-1">
                  <span className="dot h-1.5 w-1.5 rounded-full bg-neutral-500" />
                  <span className="dot h-1.5 w-1.5 rounded-full bg-neutral-500" />
                  <span className="dot h-1.5 w-1.5 rounded-full bg-neutral-500" />
                </div>
              )}
              {/* Streaming typed text with caret */}
              {typedText && (
                <div className="mr-auto max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed bg-neutral-100 text-primary shadow-soft">
                  <span>{typedText}</span>
                  <span className="typing-caret" />
                </div>
              )}
            </div>
            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const text = pending.trim();
                if (!text) return;
                setMessages((prev) => [...prev, { role: "user", content: text }]);
                setPending("");
                // Demo: generate a response with typing
                demoRespond(text);
              }}
              className="border-t border-neutral-200 p-3"
            >
              <div className="relative">
                <input
                  value={pending}
                  onChange={(e) => setPending(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full rounded-full border border-neutral-200 bg-white px-4 py-2 pr-24 text-sm text-primary shadow-xs focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                />
                <button type="submit" className="absolute right-1 top-1 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-accent-primary text-white shadow-[0_6px_20px_rgba(217,119,89,0.18)] hover:brightness-95">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
