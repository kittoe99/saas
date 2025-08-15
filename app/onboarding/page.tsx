"use client";

import React, { useState, useEffect } from "react";

type SiteType =
  | "Small business"
  | "Nonprofit"
  | "Agency"
  | "Hobby site"
  | "Ecommerce"
  | "Portfolio"
  | "Blog"
  | "SaaS"
  | "Community"
  | "Personal brand";

const SITE_TYPES: SiteType[] = [
  "Small business",
  "Nonprofit",
  "Agency",
  "Hobby site",
  "Ecommerce",
  "Portfolio",
  "Blog",
  "SaaS",
  "Community",
  "Personal brand",
];

export default function OnboardingPage() {
  const [siteType, setSiteType] = useState<SiteType | null>(null);
  const [name, setName] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [nameCommitted, setNameCommitted] = useState(false);
  const [hasCurrent, setHasCurrent] = useState<"yes" | "no" | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [searching, setSearching] = useState(false);
  const [summary, setSummary] = useState<
    | null
    | {
        summary?: string;
        details?: {
          name?: string;
          tagline?: string;
          industries?: string[];
          offerings?: string[];
          audience?: string[];
          locations?: string[];
          contact?: { email?: string; phone?: string };
          socialLinks?: string[];
        };
        about?: string;
        purpose?: string;
        services?: string[];
      }
  >(null);
  const [showManual, setShowManual] = useState(false);
  const [manualDesc, setManualDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [siteAdded, setSiteAdded] = useState(false);
  const [skipped, setSkipped] = useState(false);
  // Auto-scroll refs
  const nameRef = React.useRef<HTMLDivElement | null>(null);
  const nameInputRef = React.useRef<HTMLInputElement | null>(null);
  const hasRef = React.useRef<HTMLDivElement | null>(null);
  const urlRef = React.useRef<HTMLDivElement | null>(null);
  const actionsRef = React.useRef<HTMLDivElement | null>(null);
  const composingRef = React.useRef(false);

  // Minimal nudge scrolling: only scroll enough so the element is slightly in view
  function scrollIntoViewWithOffset(el: HTMLElement | null, _offset = 0, margin = 16, maxNudge = 120) {
    if (!el) return;
    try {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      let delta = 0;
      if (rect.top < margin) {
        delta = rect.top - margin;
      } else if (rect.bottom > vh - margin) {
        delta = rect.bottom - (vh - margin);
      }
      if (Math.abs(delta) < 8) return; // already good enough
      // Cap nudge to avoid large jumps
      if (delta > 0) delta = Math.min(delta, maxNudge);
      else delta = Math.max(delta, -maxNudge);
      const target = window.scrollY + delta;
      window.scrollTo({ top: target, behavior: "smooth" });
    } catch {}
  }

  // Scroll to name when type chosen
  useEffect(() => {
    if (siteType) setTimeout(() => {
      // When a Continue button is present for this step, do not auto-scroll.
      // We only restore focus to the input so the user can start typing immediately.
      try { nameInputRef.current?.focus({ preventScroll: true } as any); } catch {}
    }, 120);
  }, [siteType]);

  // If the input is intended to be focused, ensure it stays focused across re-renders
  useEffect(() => {
    if (!nameFocused) return;
    if (document.activeElement !== nameInputRef.current) {
      try { nameInputRef.current?.focus({ preventScroll: true } as any); } catch {}
    }
  }, [nameFocused, name]);
  // Do NOT auto-scroll on every keystroke; next step reveals only on explicit commit (Enter/Continue)
  // Scroll to URL or actions when hasCurrent set
  useEffect(() => {
    if (!hasCurrent) return;
    const target = hasCurrent === "yes" ? urlRef.current : actionsRef.current;
    setTimeout(() => {
      // Avoid scroll if user is typing name to prevent focus loss
      if (document.activeElement === nameInputRef.current) return;
      scrollIntoViewWithOffset(target as HTMLElement);
    }, 100);
  }, [hasCurrent]);
  // After site added or skipped (with yes), scroll to actions
  useEffect(() => {
    if (hasCurrent === "yes" && (siteAdded || skipped)) {
      setTimeout(() => {
        if (document.activeElement === nameInputRef.current) return;
        scrollIntoViewWithOffset(actionsRef.current as HTMLElement);
      }, 100);
    }
  }, [siteAdded, skipped, hasCurrent]);

  // Animated reveal wrapper for step-by-step UX
  function StepBlock({ show, children }: { show: boolean; children: React.ReactNode }) {
    const [visible, setVisible] = useState(show);
    useEffect(() => {
      if (show) setVisible(true);
    }, [show]);
    return (
      <div
        className={`transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}
        style={{ maxHeight: show ? undefined : 0, overflow: show ? undefined : "hidden" }}
        aria-hidden={!show}
      >
        {visible && children}
      </div>
    );
  }
  // Animated status for searching UX
  const SEARCH_STEPS = [
    "Searching website",
    "Analyzing pages",
    "Gathering info",
    "Extracting details",
    "Summarizing findings",
  ];
  const [searchStepIndex, setSearchStepIndex] = useState(0);
  // Advance step every ~1.6s while searching, and stop at the last step (no repeats).
  // Stable dependency array to avoid Fast Refresh error about changing size.
  useEffect(() => {
    if (!searching) {
      setSearchStepIndex(0);
      return;
    }
    // restart from beginning on each new search
    setSearchStepIndex(0);
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + 1, SEARCH_STEPS.length - 1);
      setSearchStepIndex(i);
      if (i >= SEARCH_STEPS.length - 1) {
        clearInterval(id);
      }
    }, 1600);
    return () => clearInterval(id);
  }, [searching]);
  const [searchedCount, setSearchedCount] = useState<number | null>(null);
  const [searchedPreview, setSearchedPreview] = useState<Array<{ index: number; title: string; url: string; snippet?: string }>>([]);
  const [showSources, setShowSources] = useState(false);

  async function summarizeUrl() {
    if (!currentUrl) return;
    setError(null);
    setSummary(null);
    setShowManual(false);
    setSearching(true);
    setNotFound(false);
    setSiteAdded(false);
    setSkipped(false);
    setSearchedCount(null);
    setSearchedPreview([]);
    setShowSources(false);
    try {
      // Use chat-style search to fetch live info about the provided URL/domain
      const res = await fetch("/api/ai/stream-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "What is this website about, services and relevant info, add bullet list and headings where necessary",
          site: currentUrl,
          // Always use fast (chat) mode
          reasoning: false,
        }),
      });
      if (!res.ok || !res.body) {
        let msg = "Search failed";
        try { const data = await res.json(); msg = data?.error || msg; } catch {}
        throw new Error(msg);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffered = "";
      let searchHeaderHandled = false;
      let metaHeaderHandled = false;
      let live = ""; // incremental narrative buffer for UI streaming
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffered += chunk;
        // Strip special header lines if present
        let progressed = true;
        while (progressed && buffered.includes("\n") && (!searchHeaderHandled || !metaHeaderHandled)) {
          progressed = false;
          const idx = buffered.indexOf("\n");
          const first = buffered.slice(0, idx);
          const rest = buffered.slice(idx + 1);
          if (!searchHeaderHandled && first.startsWith("__SEARCH__")) {
            // Parse search header: { count, results }
            try {
              const json = first.slice("__SEARCH__".length);
              const info = JSON.parse(json || '{}');
              if (typeof info?.count === 'number') setSearchedCount(info.count);
              if (Array.isArray(info?.results)) setSearchedPreview(info.results);
            } catch {}
            searchHeaderHandled = true; buffered = rest; progressed = true; continue;
          }
          if (!metaHeaderHandled && first.startsWith("__META__")) {
            metaHeaderHandled = true; buffered = rest; progressed = true; continue;
          }
        }

        // Incrementally render narrative once headers are consumed
        if (searchHeaderHandled && metaHeaderHandled) {
          if (buffered.length > live.length) {
            const partial = buffered
              .replace(/\s*\[[0-9]+\]\s*$/g, "") // trim dangling citation at the very end of the stream
              .trim();
            live = partial;
            setSummary({
              summary: live,
              details: {},
              about: "",
              purpose: "",
              services: [],
            });
          }
        }
      }
      // Post-process: strip 'References' section and inline [n] citations
      let narrative = buffered.trim();
      const refIdx = narrative.toLowerCase().indexOf("\nreferences");
      if (refIdx > -1) narrative = narrative.slice(0, refIdx).trim();
      // If output contains bullets, preserve bullet structure
      const rawLines = narrative.split(/\r?\n/);
      const bulletRegex = /^[-•\*]\s+/;
      const bulletLines = rawLines
        .map((l) => l.trim())
        .filter((l) => bulletRegex.test(l))
        .map((l) => l.replace(/^[-•\*]\s+/, "").replace(/\s*\[\d+\]\s*$/g, "").trim())
        .filter(Boolean);
      const hasBullets = bulletLines.length > 0;
      // capture any intro paragraph lines before the first bullet
      let intro = "";
      if (hasBullets) {
        const firstBulletIdx = rawLines.findIndex((l) => bulletRegex.test(l.trim()));
        if (firstBulletIdx > 0) {
          intro = rawLines.slice(0, firstBulletIdx).join(" ").replace(/\s*\[\d+\]/g, "").replace(/\s+/g, " ").trim();
          if (intro) {
            // limit intro to 2–4 sentences
            const parts = intro.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
            intro = parts.slice(0, Math.max(2, Math.min(4, parts.length))).join(" ").trim();
          }
        }
      }
      if (hasBullets) {
        const limited = bulletLines.slice(0, Math.min(7, Math.max(4, bulletLines.length)));
        // store bullets as a newline-joined string prefixed with '- ' so renderer can detect
        narrative = limited.map((b) => `- ${b}`).join("\n");
      } else {
        // No bullets: clean citations and whitespace and ensure punctuation
        narrative = narrative.replace(/\s*\[\d+\]/g, "").replace(/\s+/g, " ").trim();
        if (!/[.!?]$/.test(narrative) && narrative.length > 0) narrative += ".";
        // Constrain to 3–6 sentences and remove accidental repeats
        if (narrative) {
          const parts = narrative
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter(Boolean);
          const seen = new Set<string>();
          const unique = parts.filter((s) => {
            const key = s.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key); return true;
          });
          const limited = unique.slice(0, Math.max(3, Math.min(6, unique.length)));
          narrative = limited.join(" ").trim();
        }
      }
      if (!narrative) {
        setNotFound(true);
        setSummary(null);
        return;
      }
      setSummary({
        summary: narrative,
        details: {},
        about: intro || narrative,
        purpose: "",
        services: [],
      });
      setSiteAdded(true);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setSearching(false);
    }
  }

  // Small local component for a typewriter effect on generated text
  function Typewriter({ text }: { text: string }) {
    const [display, setDisplay] = useState("");
    useEffect(() => {
      setDisplay("");
      if (!text) return;
      let i = 0;
      const step = Math.max(10, 1200 / Math.max(24, text.length));
      const id = setInterval(() => {
        i += 1;
        setDisplay(text.slice(0, i));
        if (i >= text.length) clearInterval(id);
      }, step);
      return () => clearInterval(id);
    }, [text]);
    return (
      <div className="mt-1 text-sm text-gray-700">
        <span className="whitespace-pre-wrap">{display}</span>
        <span className="inline-block w-0.5 h-4 align-middle ml-0.5 bg-[#1a73e8] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Onboarding</h1>
      <p className="mt-1 text-sm text-gray-600">Step 1: Tell us about your site</p>

      <div className="mt-8 space-y-6">
        {/* 1) Type of site */}
        <div>
          <label className="block text-sm font-medium">Type of site</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SITE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSiteType(t)}
                className={`rounded-md border px-3 py-2 text-sm text-left transition-colors ${siteType === t ? "border-[#1a73e8] ring-1 ring-[#1a73e8] bg-[#1a73e8]/5" : "border-gray-300 hover:bg-[#1a73e8]/5"} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]`}
              >
                {t}
              </button>
            ))}
          </div>
          {siteType && (
            <div className="mt-2 text-xs text-gray-600">Selected: {siteType}</div>
          )}
        </div>

        {/* 2) Name of site/business/organization */}
        <StepBlock show={!!siteType}>
          <div
            ref={nameRef}
            className="scroll-mt-24"
            onMouseDown={(e) => {
              // Clicking within the block should not cause a blur flicker
              if (e.target instanceof HTMLElement && e.currentTarget.contains(e.target)) {
                requestAnimationFrame(() => {
                  try { nameInputRef.current?.focus({ preventScroll: true } as any); } catch {}
                });
              }
            }}
          >
            <label className="block text-sm font-medium">Name of site / business / organization</label>
            <input
              ref={nameInputRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              onBlur={() => {
                // Do not auto-advance on blur to avoid unwanted step change while typing
                setNameFocused(false);
              }}
              onFocus={() => setNameFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (composingRef.current) return; // ignore IME composition
                  if (name.trim().length >= 2) {
                    setNameCommitted(true);
                  }
                }
              }}
              onCompositionStart={() => { composingRef.current = true; }}
              onCompositionEnd={() => { composingRef.current = false; }}
              autoComplete="off"
              placeholder="e.g. Bello Moving"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
            />
            {/* Continue control to explicitly commit */}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-[#1a73e8] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1664c4] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
                disabled={name.trim().length < 2}
                onMouseDown={(e) => { e.preventDefault(); /* keep focus on input until click processed */ }}
                onClick={() => {
                  setNameCommitted(true);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </StepBlock>

        {/* 3) Do you have a current site? */}
        <StepBlock show={nameCommitted}>
          <div ref={hasRef} className="scroll-mt-24">
            <label className="block text-sm font-medium">Do you have a current website?</label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setHasCurrent("yes")}
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${hasCurrent === "yes" ? "border-[#1a73e8] ring-1 ring-[#1a73e8] bg-[#1a73e8]/5" : "border-gray-300 hover:bg-[#1a73e8]/5"} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setHasCurrent("no")}
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${hasCurrent === "no" ? "border-[#1a73e8] ring-1 ring-[#1a73e8] bg-[#1a73e8]/5" : "border-gray-300 hover:bg-[#1a73e8]/5"} focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]`}
              >
                No
              </button>
            </div>
          </div>
        </StepBlock>

        {/* 4) Current URL (conditional) */}
        {hasCurrent === "yes" && (
          <div ref={urlRef} className="scroll-mt-24">
            <label className="block text-sm font-medium">Current website URL</label>
            <input
              type="url"
              inputMode="url"
              value={currentUrl}
              onChange={(e) => {
                setCurrentUrl(e.target.value);
                setSummary(null);
                setNotFound(false);
                setSiteAdded(false);
                setSkipped(false);
              }}
              placeholder="https://example.com"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
            />
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={summarizeUrl}
                className="rounded-md px-3 py-2 text-sm border border-[#1a73e8] text-[#1a73e8] bg-white transition-colors hover:border-[#1664c4] hover:text-[#1664c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
                disabled={!currentUrl || searching}
              >
                {searching ? "Adding…" : "Add Site"}
              </button>
              <span className="text-xs text-gray-500">We’ll fetch public info from the site.</span>
            </div>

            {/* Searching animation */}
            {searching && (
              <div className="mt-4 rounded-md border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5 animate-spin text-[#1a73e8]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <div className="font-medium text-[#1a73e8]" aria-live="polite">
                    {SEARCH_STEPS[searchStepIndex]}…
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-md bg-gray-100 animate-pulse" />
                  <div className="h-20 rounded-md bg-gray-100 animate-pulse" />
                  <div className="h-20 rounded-md bg-gray-100 animate-pulse" />
                </div>
              </div>
            )}

            {/* Not found state */}
            {notFound && !searching && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <div className="font-medium">Site Not Found</div>
                <p className="mt-1 text-red-900">We couldn’t find enough public information for this URL.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md px-3 py-2 text-sm border border-[#1a73e8] text-[#1a73e8] bg-white transition-colors hover:border-[#1664c4] hover:text-[#1664c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
                    onClick={() => {
                      setNotFound(false);
                      setSummary(null);
                    }}
                  >
                    Retry
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-[#1a73e8] px-3 py-2 text-sm text-white transition-colors hover:bg-[#1664c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
                    onClick={() => {
                      setSkipped(true);
                    }}
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {/* Summary results */}
            {summary && !searching && (
              <div className="mt-4 space-y-3 rounded-md border border-gray-200 p-4">
                {typeof searchedCount === 'number' && (
                  <div className="mb-1 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      <svg className="h-3.5 w-3.5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
                      </svg>
                      <span>
                        Searched {searchedCount} {searchedCount === 1 ? 'page' : 'pages'}
                      </span>
                    </div>
                    {searchedPreview.length > 0 && (
                      <button
                        type="button"
                        className="text-xs text-[#1a73e8] hover:text-[#1664c4] underline-offset-2 hover:underline"
                        onClick={() => setShowSources((v) => !v)}
                      >
                        {showSources ? 'Hide sources' : 'View sources'}
                      </button>
                    )}
                  </div>
                )}
                {showSources && searchedPreview.length > 0 && (
                  <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                    <ul className="space-y-1">
                      {searchedPreview.slice(0, 10).map((r) => (
                        <li key={r.index} className="text-xs text-gray-700">
                          <span className="text-gray-500">[{r.index}]</span>{' '}
                          <a className="hover:underline" href={r.url} target="_blank" rel="noreferrer">
                            {r.title || r.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Narrative summary when available */}
                {summary.summary ? (
                  <div>
                    <div className="text-sm font-medium">Summary</div>
                    {/^\s*-\s+/.test(summary.summary) ? (
                      <ul className="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-1">
                        {summary.summary.split(/\r?\n/).filter(Boolean).map((line: string, idx: number) => {
                          const raw = line.replace(/^\s*-\s+/, "").trim();
                          // Match **Heading**: content or Heading: content
                          const mdMatch = raw.match(/^\*\*(.+?)\*\*:\s*(.*)$/);
                          const plainMatch = raw.match(/^([A-Z][A-Za-z\s]+):\s*(.*)$/);
                          let heading: string | null = null;
                          let content: string = raw;
                          if (mdMatch) {
                            heading = mdMatch[1].trim();
                            content = mdMatch[2].trim();
                          } else if (plainMatch) {
                            heading = plainMatch[1].trim();
                            content = plainMatch[2].trim();
                          }
                          return (
                            <li key={idx}>
                              {heading ? (
                                <>
                                  <span className="font-semibold text-base">{heading}:</span> {content}
                                </>
                              ) : (
                                raw
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <Typewriter text={summary.summary} />
                    )}
                  </div>
                ) : null}

                {/* Fallback fields if narrative missing */}
                {!summary.summary && (summary.about || summary.purpose) ? (
                  <div className="space-y-3">
                    {summary.about ? (
                      <div>
                        <div className="text-sm font-medium">About</div>
                        <div className="mt-1 text-sm text-gray-700">{summary.about}</div>
                      </div>
                    ) : null}
                    {summary.purpose ? (
                      <div>
                        <div className="text-sm font-medium">Purpose</div>
                        <div className="mt-1 text-sm text-gray-700">{summary.purpose}</div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {summary.services && summary.services.length > 0 ? (
                  <div>
                    <div className="text-sm font-medium">Offerings</div>
                    <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                      {summary.services.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Lightweight details if present */}
                {summary.details && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {summary.details.tagline ? (
                      <div>
                        <div className="text-xs font-medium text-gray-500">Tagline</div>
                        <div className="text-sm text-gray-700">{summary.details.tagline}</div>
                      </div>
                    ) : null}
                    {summary.details.industries && summary.details.industries.length > 0 ? (
                      <div>
                        <div className="text-xs font-medium text-gray-500">Industries</div>
                        <div className="text-sm text-gray-700">{summary.details.industries.join(', ')}</div>
                      </div>
                    ) : null}
                    {summary.details.locations && summary.details.locations.length > 0 ? (
                      <div>
                        <div className="text-xs font-medium text-gray-500">Locations</div>
                        <div className="text-sm text-gray-700">{summary.details.locations.join(', ')}</div>
                      </div>
                    ) : null}
                    {summary.details.contact && (summary.details.contact.email || summary.details.contact.phone) ? (
                      <div>
                        <div className="text-xs font-medium text-gray-500">Contact</div>
                        <div className="text-sm text-gray-700">{[summary.details.contact.email, summary.details.contact.phone].filter(Boolean).join(' \u2022 ')}</div>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-[#1a73e8] px-3 py-2 text-sm text-white transition-colors hover:bg-[#1664c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
                    onClick={() => {
                      const offerings = (summary.services && summary.services.length ? `\n\nOfferings:\n- ${summary.services.join('\n- ')}` : "");
                      const desc = [summary.summary || "", summary.about || "", summary.purpose || ""].filter(Boolean).join('\n\n') + offerings;
                      setManualDesc(desc.trim());
                      setShowManual(true);
                    }}
                  >
                    Confirm Info
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-gray-50"
                    onClick={() => setShowManual(true)}
                  >
                    Add Info Manually
                  </button>
                </div>
              </div>
            )}

            {/* Manual description editor */}
            {showManual && (
              <div className="mt-4">
                <label className="block text-sm font-medium">Describe the site in your own words</label>
                <textarea
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  rows={4}
                  placeholder="Short description, purpose, and key services"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
                />
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}
          </div>
        )}

        {/* Actions */}
        {(() => {
          const canShowActions = !!siteType && !!name.trim() && (
            hasCurrent === "no" || (hasCurrent === "yes" && (siteAdded || skipped))
          );
          return (
            <StepBlock show={canShowActions}>
              <div ref={actionsRef} className="flex items-center justify-between border-t pt-6 scroll-mt-24">
                <div className="text-xs text-gray-500">You can change these later.</div>
                <button
                  className="rounded-md bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1664c4] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
                  disabled={
                    !siteType ||
                    !name ||
                    (hasCurrent === "yes" && (!currentUrl || (!siteAdded && !skipped)))
                  }
                  onClick={() => {
                    // Placeholder submit. Persisting can be wired next.
                    const payload = {
                      siteType,
                      name,
                      hasCurrent,
                      currentUrl: hasCurrent === "yes" ? currentUrl : "",
                      description: manualDesc,
                      autoSummary: summary,
                      siteAdded,
                      skipped,
                    };
                    alert(`Saved!\n${JSON.stringify(payload, null, 2)}`);
                  }}
                >
                  Save and continue
                </button>
              </div>
            </StepBlock>
          );
        })()}
      </div>
    </div>
  );
}
