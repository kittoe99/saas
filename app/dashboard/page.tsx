"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/app/components/Loader";

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
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [deployments, setDeployments] = useState<Array<{ id: string; url: string | null; status: string | null; created_at: string }>>([]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // no-op, still navigate away
    } finally {
      window.location.replace("/login");
    }
  };

  // Auth guard: redirect to /login if there is no session (preserve next)
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        try {
          const next = `${window.location.pathname}${window.location.search}`;
          window.location.replace(`/login?next=${encodeURIComponent(next)}`);
        } catch {
          window.location.replace("/login");
        }
      } else {
        // capture email for greeting
        const { data: u } = await supabase.auth.getUser();
        setUserEmail(u?.user?.email ?? null);
        setAuthChecked(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Check onboarding status for current user
  useEffect(() => {
    if (!authChecked) return;
    let mounted = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!mounted || !user) return;
      const { data } = await supabase.from('onboarding').select('user_id').eq('user_id', user.id).maybeSingle();
      if (!mounted) return;
      setNeedsOnboarding(!data);
      setOnboardingChecked(true);
      // Load latest deployments for this user to show preview cards
      const { data: deps } = await supabase
        .from('v0_deployments')
        .select('v0_deployment_id, url, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);
      if (mounted && deps) {
        setDeployments(
          deps.map((d: any) => ({ id: d.v0_deployment_id as string, url: d.url as string | null, status: d.status as string | null, created_at: d.created_at as string }))
        );
      }
    })();
    return () => { mounted = false; };
  }, [authChecked]);

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
      <Loader fullScreen message="Checking authentication..." />
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
          {/* Mobile logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto sm:hidden px-3 py-1.5 rounded-md border border-neutral-300 bg-white text-neutral-900 text-sm hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
          >
            Logout
          </button>
          {/* Desktop tabs moved to sidebar */}
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white text-neutral-900 text-sm hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
            >
              Logout
            </button>
          </div>
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
            <div
              className="rounded-xl border border-neutral-200 bg-white shadow-soft min-h-[40vh]"
              role="tabpanel"
              id={`panel-${active.toLowerCase()}`}
              aria-labelledby={`tab-${active.toLowerCase()}`}
              aria-label={active}
            >
              {/* Mobile (native-like) Home */}
              {active === "Home" && (
                <div className="sm:hidden">
                  {/* Greeting / hero */}
                  <div className="bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 p-4 rounded-t-xl border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-neutral-600">Welcome{userEmail ? "," : ""}</div>
                        <div className="text-lg font-semibold text-neutral-900 truncate max-w-[80%]">{userEmail ?? "to your dashboard"}</div>
                      </div>
                      <div className="h-9 w-9 rounded-full bg-success-accent/20 text-success-ink inline-flex items-center justify-center font-semibold">H</div>
                    </div>
                    {onboardingChecked && needsOnboarding && (
                      <div className="mt-3">
                        <a href="/dashboard/onboarding" className="w-full inline-flex items-center justify-center rounded-lg bg-success-accent px-3 py-2 text-white text-sm shadow-hover">
                          Start onboarding
                        </a>
                      </div>
                    )}
                  </div>

                  {/* KPI cards */}
                  <div className="grid grid-cols-2 gap-3 p-4">
                    <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-card">
                      <div className="text-[11px] text-neutral-500">Site status</div>
                      <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-neutral-900">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /> Online
                      </div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-card">
                      <div className="text-[11px] text-neutral-500">Visitors</div>
                      <div className="mt-1 text-lg font-semibold text-neutral-900">—</div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-card">
                      <div className="text-[11px] text-neutral-500">Leads</div>
                      <div className="mt-1 text-lg font-semibold text-neutral-900">—</div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-card">
                      <div className="text-[11px] text-neutral-500">Domains</div>
                      <div className="mt-1 text-sm font-semibold text-neutral-900">Setup</div>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="px-4">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-soft">
                      <div className="text-xs text-neutral-600 mb-2">Quick actions</div>
                      <div className="grid grid-cols-3 gap-2">
                        <a href="/dashboard?tab=Website" className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-neutral-700"><path d="M4 5h16v14H4z"/><path d="M4 9h16"/></svg>
                          <span className="text-[11px] text-neutral-700">Edit site</span>
                        </a>
                        <a href="/dashboard?tab=Domains" className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-neutral-700"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18"/></svg>
                          <span className="text-[11px] text-neutral-700">Buy domain</span>
                        </a>
                        <a href="mailto:support@hinn.io" className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-neutral-700"><path d="M4 4h16v16H4z"/><path d="M22 6 12 13 2 6"/></svg>
                          <span className="text-[11px] text-neutral-700">Support</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Recent activity placeholder */}
                  <div className="p-4">
                    {/* Your site(s) */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-soft mb-4">
                      <div className="text-xs text-neutral-600 mb-2">Your site{deployments.length !== 1 ? 's' : ''}</div>
                      {deployments.length === 0 ? (
                        <div className="text-sm text-neutral-700">No deployments yet. Build your site to see it here.</div>
                      ) : (
                        <ul className="space-y-2">
                          {deployments.map((d) => (
                            <li key={d.id} className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-neutral-900 truncate max-w-[12rem]">{d.url ?? 'Pending URL'}</div>
                                <div className="text-[11px] text-neutral-500">{d.status ?? 'unknown'} • {new Date(d.created_at).toLocaleString()}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {d.url && (
                                  <a href={d.url} target="_blank" rel="noreferrer" className="px-2.5 py-1.5 rounded-md border border-neutral-200 text-[12px] text-neutral-800 hover:bg-neutral-50">View</a>
                                )}
                                {d.url && (
                                  <button
                                    onClick={async () => { try { await navigator.clipboard.writeText(d.url!); } catch {} }}
                                    className="px-2.5 py-1.5 rounded-md border border-neutral-200 text-[12px] text-neutral-800 hover:bg-neutral-50"
                                  >
                                    Copy URL
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-soft">
                      <div className="text-xs text-neutral-600 mb-2">Recent</div>
                      <ul className="divide-y divide-neutral-200">
                        <li className="py-2 flex items-center justify-between">
                          <div className="text-sm text-neutral-800">Welcome to hinn.io</div>
                          <span className="text-[11px] text-neutral-500">now</span>
                        </li>
                        <li className="py-2 flex items-center justify-between">
                          <div className="text-sm text-neutral-800">Get started by completing onboarding</div>
                          <span className="text-[11px] text-neutral-500">1m</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop or other tabs content placeholder */}
              {onboardingChecked && needsOnboarding && active === "Home" && (
                <div className="hidden sm:flex min-h-[40vh] items-center justify-center p-8 text-center">
                  <div className="max-w-md space-y-4">
                    <div className="flex justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-amber-600"><path d="M12 9v4m0 4h.01"/><circle cx="12" cy="12" r="9"/></svg>
                    </div>
                    <h2 className="text-base font-semibold text-neutral-900">Complete your onboarding to get the most out of your dashboard.</h2>
                    <div>
                      <a href="/dashboard/onboarding" className="inline-flex items-center gap-2 rounded-md bg-success-accent px-3 py-1.5 text-white hover:opacity-90">Start onboarding</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom tab bar (hides on scroll down, shows on scroll up) */}
      <nav
        className={classNames(
          "fixed bottom-0 left-0 right-0 z-40 sm:hidden transition-transform duration-200",
          showMobileTabs ? "translate-y-0" : "translate-y-full"
        )}
        aria-label="Primary"
      >
        <div className="mx-auto max-w-6xl px-3 pb-[max(8px,env(safe-area-inset-bottom))]">
          <div className="rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur shadow-soft">
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
                        "mx-1 my-1 flex-1 py-2 text-center text-[11px] leading-tight flex flex-col items-center gap-1 rounded-xl",
                        selected
                          ? "bg-success-accent/10 text-success-ink border border-success"
                          : "text-neutral-700 border border-transparent"
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
        </div>
      </nav>
    </div>
  );
}
