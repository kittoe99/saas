"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function classNames(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

const TABS = ["Home", "Website", "Domains", "More"] as const;
type TabKey = typeof TABS[number];

function TabIcon({ tab, selected }: { tab: TabKey; selected?: boolean }) {
  const cls = selected ? "text-success-ink" : "text-neutral-500";
  switch (tab) {
    case "Home":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={"h-5 w-5 " + cls} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5l9-7 9 7" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v8a2 2 0 01-2 2h-2m-6 0H7a2 2 0 01-2-2v-8" />
        </svg>
      );
    case "Website":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={"h-5 w-5 " + cls} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3c2.5 3 2.5 15 0 18M7 7.5h10M7 16.5h10" />
        </svg>
      );
    case "Domains":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={"h-5 w-5 " + cls} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16M8 13h4M8 17h8" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={"h-5 w-5 " + cls} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

export default function DashboardPage() {
  const [active, setActive] = useState<TabKey>("Home");
  const [showMobileTabs, setShowMobileTabs] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth guard: redirect to /login if there is no session
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        window.location.replace("/login");
      } else {
        setAuthChecked(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Initialize from URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("tab");
    const lc = window.localStorage.getItem("dash.activeTab") as TabKey | null;
    const isValid = (v: any): v is TabKey => !!v && (TABS as readonly string[]).includes(v);
    if (isValid(fromUrl)) {
      setActive(fromUrl);
    } else if (isValid(lc)) {
      setActive(lc);
    }
  }, []);

  // Sync to URL and localStorage when active changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", active);
    window.history.replaceState({}, "", url.toString());
    window.localStorage.setItem("dash.activeTab", active);
  }, [active]);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      const currentY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentY > lastY + 5) {
            // Scrolling down
            setShowMobileTabs(false);
          } else if (currentY < lastY - 5) {
            // Scrolling up
            setShowMobileTabs(true);
          }
          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Show a lightweight loading state until auth check completes
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-600">
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* App header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-success-accent/20 text-success-ink inline-flex items-center justify-center font-semibold">
            H
          </div>
          <div className="text-sm text-neutral-600">Dashboard</div>
          {/* Desktop tabs moved to sidebar */}
          <div className="ml-auto hidden sm:flex items-center gap-2" />
        </div>
      </header>

      {/* App content area with desktop sidebar */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 pb-24 sm:pb-10">
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar (desktop only) */}
          <aside className="hidden sm:block sm:col-span-3 lg:col-span-2">
            <div className="sticky top-[64px]">
              <nav aria-label="Sections" className="rounded-xl border border-neutral-200 bg-white shadow-soft p-2">
                <ul
                  className="space-y-1"
                  role="tablist"
                  aria-orientation="vertical"
                  onKeyDown={(e) => {
                    const items = Array.from(
                      (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button[role="tab"]')
                    );
                    const idx = items.findIndex((el) => el === document.activeElement);
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault();
                      const next = items[(idx + 1 + items.length) % items.length];
                      next?.focus();
                    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const prev = items[(idx - 1 + items.length) % items.length];
                      prev?.focus();
                    } else if (e.key === "Home") {
                      e.preventDefault();
                      items[0]?.focus();
                    } else if (e.key === "End") {
                      e.preventDefault();
                      items[items.length - 1]?.focus();
                    }
                  }}
                >
                  {TABS.map((tab) => {
                    const selected = active === tab;
                    return (
                      <li key={tab}>
                        <button
                          type="button"
                          onClick={() => setActive(tab)}
                          className={classNames(
                            "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left",
                            selected
                              ? "bg-success-accent/15 text-success-ink border border-success"
                              : "text-neutral-800 hover:bg-neutral-50 border border-transparent"
                          )}
                          role="tab"
                          aria-selected={selected}
                          aria-controls={`panel-${tab.toLowerCase()}`}
                          id={`tab-${tab.toLowerCase()}`}
                          tabIndex={selected ? 0 : -1}
                          aria-current={selected ? "page" : undefined}
                        >
                          <TabIcon tab={tab} selected={selected} />
                          <span>{tab}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main panel */}
          <main className="col-span-12 sm:col-span-9 lg:col-span-10">
            {/* Keep tab panels empty as requested */}
            <div
              className="rounded-xl border border-neutral-200 bg-white shadow-soft min-h-[40vh]"
              role="tabpanel"
              id={`panel-${active.toLowerCase()}`}
              aria-labelledby={`tab-${active.toLowerCase()}`}
              aria-label={active}
            >
              {/* Intentionally left blank inside tabs */}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom tab bar (hides on scroll down, shows on scroll up) */}
      <nav
        className={classNames(
          "fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur sm:hidden transition-transform duration-200",
          showMobileTabs ? "translate-y-0" : "translate-y-full"
        )}
        aria-label="Primary"
      >
        <div className="mx-auto max-w-6xl px-2">
          <ol
            className="grid grid-cols-4"
            role="tablist"
            aria-orientation="horizontal"
            onKeyDown={(e) => {
              const items = Array.from(
                (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('button[role="tab"]')
              );
              const idx = items.findIndex((el) => el === document.activeElement);
              if (e.key === "ArrowRight") {
                e.preventDefault();
                const next = items[(idx + 1 + items.length) % items.length];
                next?.focus();
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                const prev = items[(idx - 1 + items.length) % items.length];
                prev?.focus();
              } else if (e.key === "Home") {
                e.preventDefault();
                items[0]?.focus();
              } else if (e.key === "End") {
                e.preventDefault();
                items[items.length - 1]?.focus();
              }
            }}
          >
            {TABS.map((tab) => {
              const selected = active === tab;
              return (
                <li key={tab} className="flex">
                  <button
                    type="button"
                    onClick={() => setActive(tab)}
                    className={classNames(
                      "flex-1 py-2.5 text-center text-[11px] leading-tight flex flex-col items-center gap-1",
                      selected ? "text-success-ink font-medium" : "text-neutral-700"
                    )}
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`panel-${tab.toLowerCase()}`}
                    id={`tab-${tab.toLowerCase()}`}
                    tabIndex={selected ? 0 : -1}
                    aria-current={selected ? "page" : undefined}
                  >
                    <TabIcon tab={tab} selected={selected} />
                    <span>{tab}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </div>
  );
}
