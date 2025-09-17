"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const [showMore, setShowMore] = useState(false);
  const desktopMoreRef = useRef<HTMLDivElement | null>(null);
  const mobileMoreRef = useRef<HTMLDivElement | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [deployments, setDeployments] = useState<Array<{ id: string; website_id: string | null; url: string | null; status: string | null; created_at: string }>>([]);
  const [websites, setWebsites] = useState<Array<{
    id: string;
    name: string | null;
    domain: string | null;
    vercel_prod_domain?: string | null;
    status: string | null;
    created_at: string;
    primary_goal?: string | null;
    contact_method?: string | null;
    contact_phone?: string | null;
    envisioned_pages?: string[] | null;
    selected_services?: string[] | null;
    progress_done?: number;
    progress_total?: number;
    progress_label?: string;
  }>>([]);

  // More tab sub-views
  const [moreView, setMoreView] = useState<'menu' | 'account' | 'billing' | 'support'>('menu');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [pfEmail, setPfEmail] = useState<string>("");
  const [pfFullName, setPfFullName] = useState<string>("");

  // Domains purchase state
  const [domainName, setDomainName] = useState<string>("");
  const [domainType, setDomainType] = useState<'new' | 'renewal' | 'transfer' | 'redemption'>("new");
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<{ price: number; period: number } | null>(null);

  const [country, setCountry] = useState<string>("US");
  const [orgName, setOrgName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [address1, setAddress1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [stateProv, setStateProv] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [renew, setRenew] = useState<boolean>(true);

  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseMode, setPurchaseMode] = useState<boolean>(false);
  const [selectedAvailability, setSelectedAvailability] = useState<boolean | null>(null);
  const [selectLoading, setSelectLoading] = useState(false);
  const [selectError, setSelectError] = useState<string | null>(null);

  // Domain suggestions
  const [suggestQuery, setSuggestQuery] = useState<string>("");
  const [suggLoading, setSuggLoading] = useState(false);
  const [suggError, setSuggError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; available: boolean | null; price: number | null; period: number | null }>>([]);

  const handleFetchSuggestions = async () => {
    setSuggError(null);
    setSuggestions([]);
    const q = (suggestQuery || domainName).trim();
    if (!q) { setSuggError('Enter a keyword, brand, or domain base'); return; }
    // Reset selection-related state for a fresh flow
    setPurchaseMode(false);
    setSelectedAvailability(null);
    setPriceData(null);
    setSuggLoading(true);
    try {
      const resp = await fetch(`/api/domains/suggestions?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed to get suggestions');
      setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
    } catch (e: any) {
      setSuggError(e?.message || 'Failed to get suggestions');
    } finally {
      setSuggLoading(false);
    }
  };

  const refreshDomainMeta = async (name: string) => {
    try {
      const [aResp, pResp] = await Promise.all([
        fetch(`/api/domains/availability?name=${encodeURIComponent(name)}`, { cache: 'no-store' }),
        fetch(`/api/domains/price?name=${encodeURIComponent(name)}&type=new`, { cache: 'no-store' }),
      ]);
      const aData = await aResp.json().catch(() => ({}));
      const pData = await pResp.json().catch(() => ({}));
      if (aResp.ok) setSelectedAvailability(Boolean(aData?.available));
      if (pResp.ok && typeof pData?.price === 'number' && typeof pData?.period === 'number') {
        setPriceData({ price: pData.price, period: pData.period });
      } else if (!pResp.ok) {
        throw new Error(pData?.error || 'Failed to get real-time price');
      }
    } catch (e: any) {
      throw new Error(e?.message || 'Failed to refresh domain metadata');
    }
  };

  const handleSelectSuggestion = async (name: string) => {
    setSelectError(null);
    setPurchaseMode(true);
    setDomainName(name);
    // Hide/close suggestions once a domain is selected
    setSuggestions([]);
    setSelectLoading(true);
    try {
      await refreshDomainMeta(name);
    } catch (e: any) {
      setSelectError(e?.message || 'Could not fetch latest availability/price');
    } finally {
      setSelectLoading(false);
    }
  };

  const handleCheckDomainPrice = async () => {
    setPriceError(null);
    setPriceData(null);
    setPurchaseSuccess(null);
    if (!domainName) {
      setPriceError('Enter a domain name');
      return;
    }
    setPriceLoading(true);
    try {
      const q = new URLSearchParams({ name: domainName, type: domainType });
      const resp = await fetch(`/api/domains/price?${q.toString()}`, { cache: 'no-store' });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed to get price');
      setPriceData({ price: data.price, period: data.period });
      // Also refresh availability real-time
      try {
        const a = await fetch(`/api/domains/availability?name=${encodeURIComponent(domainName)}`, { cache: 'no-store' });
        const aj = await a.json().catch(() => ({}));
        if (a.ok) setSelectedAvailability(Boolean(aj?.available));
      } catch {}
    } catch (e: any) {
      setPriceError(e?.message || 'Failed to get price');
    } finally {
      setPriceLoading(false);
    }
  };

  const handlePurchaseDomain = async () => {
    setPurchaseError(null);
    setPurchaseSuccess(null);
    if (!domainName) { setPurchaseError('Enter a domain name'); return; }
    if (!priceData?.price && priceData?.price !== 0) { setPurchaseError('Check price first'); return; }
    if (!country || !firstName || !lastName || !address1 || !city || !postalCode || !phone || !email) {
      setPurchaseError('Fill all required fields');
      return;
    }
    setPurchaseLoading(true);
    try {
      const resp = await fetch('/api/domains/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: domainName,
          expectedPrice: priceData!.price,
          renew,
          country,
          orgName: orgName || undefined,
          firstName,
          lastName,
          address1,
          address2: address2 || undefined,
          city,
          state: stateProv || undefined,
          postalCode,
          phone,
          email,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Failed to purchase domain');
      setPurchaseSuccess('Domain purchase initiated. You can manage it in Vercel.');
    } catch (e: any) {
      setPurchaseError(e?.message || 'Failed to purchase domain');
    } finally {
      setPurchaseLoading(false);
    }
  };

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

  // Stable helper to open a specific More subview
  const openMoreView = (view: 'account' | 'billing' | 'support') => {
    // Close any prior messages when switching views
    setProfileError(null);
    setProfileSuccess(null);
    setActive('More');
    setMoreView(view);
    setShowMore(false);
    if (view === 'account') {
      // Load profile after switching
      // Small microtask ensures state batch commits before load
      Promise.resolve().then(() => loadProfile());
    }
  };

  // Load the current user's profile (creates one if missing)
  const loadProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      const uemail = u?.user?.email ?? undefined;
      if (!uid) throw new Error("Not authenticated");
      let { data: row, error } = await supabase
        .from("profiles")
        .select("id,email,full_name")
        .eq("id", uid)
        .maybeSingle();
      if (error) throw error;
      if (!row) {
        const { error: upErr } = await supabase.from("profiles").upsert({ id: uid, email: uemail ?? null, full_name: uemail ?? null });
        if (upErr) throw upErr;
        const resel = await supabase
          .from("profiles")
          .select("id,email,full_name")
          .eq("id", uid)
          .maybeSingle();
        row = resel.data as any;
      }
      setPfEmail((row as any)?.email ?? "");
      setPfFullName((row as any)?.full_name ?? "");
    } catch (e: any) {
      setProfileError(e?.message || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const saveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);
    setProfileSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ email: pfEmail || null, full_name: pfFullName || null })
        .eq("id", uid);
      if (error) throw error;
      setProfileSuccess("Profile updated");
    } catch (e: any) {
      setProfileError(e?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  // No inline Account handlers here; Account lives at /dashboard/account

  // Create a fresh website and go to onboarding for it
  const handleCreateNewSite = async () => {
    try {
      const res = await fetch('/api/websites/create', { method: 'POST' });
      const j = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(j?.error || 'Failed to create website');
      const wid = j?.website_id as string | undefined;
      if (!wid) throw new Error('Missing website_id');
      window.location.href = `/dashboard/onboarding?website_id=${encodeURIComponent(wid)}`;
    } catch (e) {
      // fallback to plain onboarding
      window.location.href = '/dashboard/onboarding';
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

  // (Reverted) No artificial delay for loader

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
        .select('v0_deployment_id, website_id, url, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);
      if (mounted && deps) {
        setDeployments(
          deps.map((d: any) => ({ id: d.v0_deployment_id as string, website_id: d.website_id ?? null, url: d.url as string | null, status: d.status as string | null, created_at: d.created_at as string }))
        );
      }

      // Load websites for this user and detect unfinished builder steps
      const { data: sites } = await supabase
        .from('websites')
        .select('id, name, domain, vercel_prod_domain, status, created_at, onboarding(data)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (mounted && sites) {
        setWebsites((sites as any[]).map((s: any) => {
          const ob = Array.isArray(s?.onboarding)
            ? ((s.onboarding[0]?.data as any) || {})
            : ((s?.onboarding?.data as any) || {});
          return {
            id: s.id as string,
            name: (s.name as string) || null,
            domain: (s.domain as string) || null,
            vercel_prod_domain: (s.vercel_prod_domain as string) || null,
            status: (s.status as string) || null,
            created_at: s.created_at as string,
            primary_goal: (ob?.primaryGoal as string) || null,
            contact_method: (ob?.contactMethod as string) || null,
            contact_phone: (ob?.businessPhone as string) || (ob?.contact?.phone as string) || (ob?.phone as string) || null,
            envisioned_pages: Array.isArray(ob?.envisionedPages) ? ob.envisionedPages : null,
            selected_services: Array.isArray(ob?.selectedServices) ? ob.selectedServices : null,
            progress_done: 1,
            progress_total: 3,
            progress_label: 'Preparing build',
          };
        }));
      }
      // Fetch build progress for each site and enrich state
      if (mounted && sites && (sites as any[]).length) {
        const enriched = await Promise.all((sites as any[]).map(async (s: any) => {
          let statusRow: { status: string | null } | null = null;
          try {
            const { data: prog } = await supabase
              .from('site_build_progress')
              .select('status')
              .eq('website_id', s.id)
              .eq('user_id', user.id)
              .maybeSingle();
            statusRow = (prog as any) || null;
          } catch {}
          let done3 = 1;
          let label = 'Preparing build';
          const hasReady = !!s.vercel_prod_domain;
          if (hasReady) {
            done3 = 3; label = 'Ready';
          } else if (statusRow?.status === 'finalizing') {
            done3 = 2; label = 'Applying final touches';
          } else {
            done3 = 1; label = 'Preparing build';
          }
          return { id: s.id as string, done3, total3: 3, label };
        }));
        if (mounted) {
          setWebsites((prev) => prev.map((w) => {
            const e = enriched.find((x) => x.id === w.id);
            return e ? { ...w, progress_done: e.done3, progress_total: e.total3, progress_label: e.label } : w;
          }));
        }
      }
      // Incomplete builds card removed
    })();
    return () => { mounted = false; };
  }, [authChecked]);

  // Close More when clicking outside of the menu or pressing Escape
  useEffect(() => {
    if (!showMore) return;
    const handlePointer = (ev: MouseEvent | TouchEvent) => {
      const t = ev.target as HTMLElement | null;
      if (!t) return;
      const clickedTrigger = !!t.closest('[data-more-trigger="true"]');
      const insideDesktop = desktopMoreRef.current?.contains(t) ?? false;
      const insideMobile = mobileMoreRef.current?.contains(t) ?? false;
      if (!clickedTrigger && !insideDesktop && !insideMobile) {
        setShowMore(false);
      }
    };
    const handleKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setShowMore(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer, { passive: true } as AddEventListenerOptions);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showMore]);

  // No profile preload; handled in /dashboard/account

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
          {/* Mobile actions */}
          <div className="ml-auto sm:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateNewSite}
              className="px-3 py-1.5 rounded-md bg-success-accent text-white text-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
            >
              New Site
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md border border-neutral-300 bg-white text-neutral-900 text-sm hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
            >
              Logout
            </button>
          </div>
          {/* Desktop tabs moved to sidebar */}
          <div className="ml-auto hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateNewSite}
              className="px-3 py-1.5 rounded-md bg-success-accent text-white text-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent"
            >
              New Site
            </button>
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
                          onClick={() => {
                            if (tab === 'More') {
                              setShowMore((s) => !s);
                            } else {
                              setActive(tab);
                              setShowMore(false);
                              setMoreView('menu');
                            }
                          }}
                          data-more-trigger={tab === "More" ? "true" : undefined}
                          className={classNames(
                            "w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left",
                            selected
                              ? "bg-success-accent/15 text-success-ink border border-success"
                              : "text-neutral-800 hover:bg-neutral-50 border border-transparent"
                          )}
                          role="tab"
                          aria-selected={selected}
                          aria-expanded={tab === 'More' ? showMore : undefined}
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
              {/* Desktop More expandable panel (expands downward) */}
              <div
                className={classNames(
                  "mt-2 overflow-hidden transition-all duration-300 ease-out",
                  showMore ? "max-h-60 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
                )}
                aria-label="More menu (desktop)"
              >
                <div ref={desktopMoreRef} className="rounded-xl border border-neutral-200 ring-1 ring-black/5 bg-white/95 backdrop-blur shadow-lg p-3">
                  <ul className="space-y-1" role="menu" aria-orientation="vertical">
                    <li>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); openMoreView('account'); }}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
                        role="menuitem"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-neutral-500"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/></svg>
                        <span>Account</span>
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); openMoreView('billing'); }} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50" role="menuitem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-neutral-500"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
                        <span>Billing</span>
                      </a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); openMoreView('support'); }} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50" role="menuitem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-neutral-500"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M22 6 12 13 2 6"/></svg>
                        <span>Support</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
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
                <div className="hidden">
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
                        <button type="button" onClick={handleCreateNewSite} className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-neutral-700"><path d="M12 5v14M5 12h14"/></svg>
                          <span className="text-[11px] text-neutral-700">Create new site</span>
                        </button>
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
                    {/* Incomplete builds (mobile) */}

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

              {/* More tab content */}
              {active === "More" && (
                <div className="p-4 sm:p-6">
                  {moreView === 'menu' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <a href="#" onClick={(e) => { e.preventDefault(); setMoreView('account'); loadProfile(); }} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                        <div className="text-sm font-semibold text-neutral-900">Account</div>
                        <div className="mt-1 text-xs text-neutral-600">Update your profile details</div>
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); setMoreView('billing'); }} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                        <div className="text-sm font-semibold text-neutral-900">Billing</div>
                        <div className="mt-1 text-xs text-neutral-600">Manage your plan and invoices</div>
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); setMoreView('support'); }} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent">
                        <div className="text-sm font-semibold text-neutral-900">Support</div>
                        <div className="mt-1 text-xs text-neutral-600">Get help</div>
                      </a>
                    </div>
                  )}
                  {moreView === 'account' && (
                    <div className="max-w-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-900">Account</h3>
                      </div>
                      {profileError && (<div className="mb-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{profileError}</div>)}
                      {profileSuccess && (<div className="mb-2 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">{profileSuccess}</div>)}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">Full name</label>
                          <input type="text" value={pfFullName} onChange={(e) => setPfFullName(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white" placeholder="Your name" autoComplete="name" disabled={profileLoading || profileSaving} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">Email</label>
                          <input type="email" value={pfEmail} onChange={(e) => setPfEmail(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white" placeholder="you@example.com" autoComplete="email" disabled={profileLoading || profileSaving} />
                        </div>
                        <div>
                          <button type="button" onClick={saveProfile} disabled={profileLoading || profileSaving} className="inline-flex items-center gap-2 rounded-md bg-success-accent px-3 py-2 text-sm text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent disabled:opacity-60">
                            {profileSaving && (
                              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                                <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" />
                              </svg>
                            )}
                            Save changes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {moreView === 'billing' && (
                    <div className="max-w-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-900">Billing</h3>
                      </div>
                      <p className="text-sm text-neutral-700">Billing portal coming soon. For now, contact support for plan changes and invoices.</p>
                    </div>
                  )}
                  {moreView === 'support' && (
                    <div className="max-w-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-neutral-900">Support</h3>
                      </div>
                      <p className="text-sm text-neutral-700">Email us at <a className="text-success-ink hover:underline" href="mailto:support@hinn.io">support@hinn.io</a>.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Domains tab content */}
              {active === 'Domains' && (
                <div className="p-4 sm:p-6">
                  <div className="max-w-3xl space-y-6">
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
                      <div className="text-sm font-semibold text-neutral-900">Search and purchase a domain</div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-neutral-800">Keyword / Brand</label>
                          <input type="text" value={suggestQuery} onChange={(e) => setSuggestQuery(e.target.value)} placeholder="acme, mybrand, etc" className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white" />
                        </div>
                        <div className="flex items-end">
                          <button type="button" onClick={handleFetchSuggestions} disabled={suggLoading} className={classNames('w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-white', suggLoading ? 'bg-neutral-300 cursor-not-allowed' : 'bg-success-accent hover:opacity-90')}>
                            {suggLoading ? 'Searching…' : 'Search'}
                          </button>
                        </div>
                      </div>
                      {suggError && <div className="mt-2 text-sm text-red-600">{suggError}</div>}
                      {suggestions.length > 0 && !purchaseMode && (
                        <div className="mt-4 overflow-hidden rounded-md border border-neutral-200">
                          <table className="w-full text-sm">
                            <thead className="bg-neutral-50 text-neutral-700">
                              <tr>
                                <th className="text-left px-3 py-2 font-medium">Domain</th>
                                <th className="text-left px-3 py-2 font-medium">Availability</th>
                                <th className="text-left px-3 py-2 font-medium">Price</th>
                                <th className="px-3 py-2"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                              {suggestions.map((s) => (
                                <tr key={s.name} className="hover:bg-neutral-50">
                                  <td className="px-3 py-2 text-neutral-900 font-medium">{s.name}</td>
                                  <td className="px-3 py-2">
                                    {s.available === null ? (
                                      <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700">Unknown</span>
                                    ) : s.available ? (
                                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">Available</span>
                                    ) : (
                                      <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">Taken</span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-neutral-800">{s.price != null ? `$${s.price}` : '—'}</td>
                                  <td className="px-3 py-2 text-right">
                                    <button
                                      type="button"
                                      onClick={() => { handleSelectSuggestion(s.name); }}
                                      className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[12px] text-neutral-900 hover:bg-neutral-50"
                                    >
                                      Use
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    {purchaseMode && (
                      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold text-neutral-900">Selected domain</div>
                            <div className="mt-1 text-neutral-900 font-medium">{domainName}</div>
                            <div className="mt-1 flex items-center gap-2 text-sm">
                              {selectLoading && (
                                <span className="inline-flex items-center gap-2 text-neutral-700">
                                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12"/></svg>
                                  Checking…
                                </span>
                              )}
                              {typeof selectedAvailability === 'boolean' && (
                                selectedAvailability ? (
                                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">Available</span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] text-rose-700">Taken</span>
                                )
                              )}
                              {priceData && (
                                <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-800">${priceData.price} / {priceData.period} yr</span>
                              )}
                              {(!priceData && !selectLoading) && (
                                <button
                                  type="button"
                                  onClick={() => handleCheckDomainPrice()}
                                  className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-[12px] text-neutral-900 hover:bg-neutral-50"
                                >
                                  Check price
                                </button>
                              )}
                            </div>
                          </div>
                          <button type="button" onClick={() => { setPurchaseMode(false); setSelectedAvailability(null); setPriceData(null); }} className="text-xs text-neutral-600 hover:text-neutral-800">Change</button>
                        </div>
                      </div>
                    )}

                    {purchaseMode && (
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
                      <div className="text-sm font-semibold text-neutral-900">Registrant information</div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">Country</label>
                          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="US" className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">Organization (optional)</label>
                          <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">First name</label>
                          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">Last name</label>
                          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-neutral-800">Address line 1</label>
                          <input value={address1} onChange={(e) => setAddress1(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-neutral-800">Address line 2 (optional)</label>
                          <input value={address2} onChange={(e) => setAddress2(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">City</label>
                          <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">State / Province</label>
                          <input value={stateProv} onChange={(e) => setStateProv(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">Postal code</label>
                          <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">Phone</label>
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1.4158551452" className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-800">Email</label>
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
                            <input type="checkbox" checked={renew} onChange={(e) => setRenew(e.target.checked)} />
                            Auto-renew
                          </label>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <button type="button" onClick={handlePurchaseDomain} disabled={purchaseLoading} className={classNames('inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white', purchaseLoading ? 'bg-neutral-300 cursor-not-allowed' : 'bg-neutral-900 hover:bg-neutral-800')}>
                          {purchaseLoading ? 'Purchasing…' : priceData ? `Purchase for $${priceData.price}` : 'Purchase'}
                        </button>
                        {purchaseError && <span className="text-sm text-red-600">{purchaseError}</span>}
                        {purchaseSuccess && <span className="text-sm text-emerald-700">{purchaseSuccess}</span>}
                      </div>
                    </div>
                    )}
                  </div>
                </div>
              )}

              {/* Desktop Home content */}
              {active === "Home" && (
                <div className="block p-4 sm:p-6">
                  {/* Incomplete builds card removed */}

                  {/* Websites (cards) */}
                  <div className="mb-6">
                    {websites.length === 0 ? (
                      <div className="text-sm text-neutral-700">No websites yet. Click New Site to create one.</div>
                    ) : (
                      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {websites.map((w) => {
                          const dep = deployments.find(d => (d.website_id === w.id) && d.url);
                          const pagesCount = Array.isArray(w.envisioned_pages) ? w.envisioned_pages.length : 0;
                          const servicesCount = Array.isArray(w.selected_services) ? w.selected_services.length : 0;
                          return (
                            <li key={w.id} className="group rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4 shadow-soft hover:shadow-card transition-shadow">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                                  <div className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-lg bg-success-accent/15 text-success-ink inline-flex items-center justify-center font-semibold">
                                    {(w.name || 'W').slice(0,1).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-neutral-900 truncate" title={w.name || undefined}>{w.name || 'Untitled Site'}</div>
                                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-neutral-600">
                                      <span>Created {new Date(w.created_at).toLocaleDateString()}</span>
                                      <span aria-hidden>•</span>
                                      {(w.vercel_prod_domain || w.domain) ? (
                                        <a href={`https://${w.vercel_prod_domain || w.domain}`} target="_blank" rel="noreferrer" className="text-success-ink hover:underline truncate max-w-[8rem] sm:max-w-[12rem]" title={(w.vercel_prod_domain || w.domain) || undefined}>{w.vercel_prod_domain || w.domain}</a>
                                      ) : (
                                        <span className="text-neutral-500">Domain not connected</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {(() => {
                                  const ready = !!w.vercel_prod_domain;
                                  return (
                                    <span className={classNames(
                                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border",
                                      ready ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-100 text-neutral-700 border-neutral-200"
                                    )}>{ready ? 'Active' : 'Not Ready'}</span>
                                  );
                                })()}
                              </div>

                              {/* Chips */}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] text-neutral-700">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M12 5v14M5 12h14"/></svg>
                                  {pagesCount} pages
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] text-neutral-700">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M5 7h14M5 12h14M5 17h9"/></svg>
                                  {servicesCount} services
                                </span>
                                {w.primary_goal && (
                                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-success/30 bg-success-accent/10 px-2 py-1 text-[11px] text-success-ink">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M12 3v18M3 12h18"/></svg>
                                    Goal: {w.primary_goal}
                                  </span>
                                )}
                                {(w.contact_method || w.contact_phone) && (
                                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-800">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 7.18 A2 2 0 0 1 5 5h4.09a2 2 0 0 1 2 1.72l.45 2.6a2 2 0 0 1-.54 1.86l-1.27 1.27a16 16 0 0 0 6.88 6.88l1.27-1.27a2 2 0 0 1 1.86-.54l2.6.45A2 2 0 0 1 22 16.92z"/></svg>
                                    {(w.contact_phone && ((w.contact_method || '').toLowerCase() === 'phone' || !w.contact_method))
                                      ? w.contact_phone
                                      : (w.contact_method || '')}
                                  </span>
                                )}
                              </div>

                              {/* Build progress (3-step) */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-[11px] text-neutral-600">
                                  <span>{w.progress_label || 'Preparing build'}</span>
                                  <span>Step {(w.progress_done ?? 1)} of {(w.progress_total ?? 3)}</span>
                                </div>
                                <div className="mt-1 h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                                  <div
                                    className="h-full bg-success-accent transition-all"
                                    style={{ width: `${Math.round(((w.progress_done ?? 1) / (w.progress_total ?? 3)) * 100)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <a
                                  href={`/website/${w.id}`}
                                  className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 rounded-md bg-success-accent text-white px-3 py-2 text-[12px] hover:opacity-90 shadow-hover"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M4 5h16v14H4z"/><path d="M4 9h16"/></svg>
                                  Manage Site
                                </a>
                                {dep?.url && (
                                  <a
                                    href={dep.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 rounded-md bg-emerald-600 text-white px-3 py-2 text-[12px] hover:bg-emerald-700 shadow-hover"
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M5 12v7a2 2 0 0 0 2 2h7"/></svg>
                                    View Live
                                  </a>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  {/* Your sites (mobile/desktop) removed per request */}

                  {/* Onboarding prompt (desktop) */}
                  {onboardingChecked && needsOnboarding && (
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
                      <h2 className="text-base font-semibold text-neutral-900">Complete your onboarding to get the most out of your dashboard.</h2>
                      <div className="mt-3">
                        <a href="/dashboard/onboarding" className="inline-flex items-center gap-2 rounded-md bg-success-accent px-3 py-1.5 text-white hover:opacity-90">Start onboarding</a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fallback placeholder for non-Home tabs when onboarding required (exclude More so it's empty) */}
              {onboardingChecked && needsOnboarding && active !== "Home" && active !== "More" && active !== "Domains" && (
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
          "fixed bottom-0 left-0 right-0 z-50 sm:hidden transition-transform duration-200",
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
                      onClick={() => {
                        if (tab === "More") {
                          setShowMore((s) => !s);
                        } else {
                          setActive(tab);
                          setShowMore(false);
                        }
                      }}
                      data-more-trigger={tab === "More" ? "true" : undefined}
                      className={classNames(
                        "mx-1 my-1 flex-1 py-2 text-center text-[11px] leading-tight flex flex-col items-center gap-1 rounded-xl",
                        selected
                          ? "bg-success-accent/10 text-success-ink border border-success"
                          : "text-neutral-700 border border-transparent"
                      )}
                      role="tab"
                      aria-selected={selected}
                      aria-expanded={tab === "More" ? showMore : undefined}
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
      {/* Mobile More expandable panel: upward opening above bottom tabs */}
      <div
        className={classNames(
          "sm:hidden fixed left-0 right-0 bottom-[64px] z-40 px-3 transition-all duration-300 ease-out",
          showMore ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
        )}
        aria-label="More menu (mobile)"
      >
        <div ref={mobileMoreRef} className="rounded-2xl border border-neutral-200 ring-1 ring-black/5 bg-white/95 backdrop-blur shadow-lg p-3">
          <ul className="grid grid-cols-3 gap-2" role="menu" aria-orientation="horizontal">
            <li className="flex">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActive('More'); setShowMore(false); setMoreView('account'); loadProfile(); }}
                className={classNames(
                  "mx-1 my-1 flex-1 py-2 text-center text-[11px] leading-tight flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white",
                  "hover:bg-neutral-50"
                )}
                role="menuitem"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-success-accent/10 text-success-ink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/></svg>
                </span>
                <span>Account</span>
              </a>
            </li>
            <li className="flex">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActive('More'); setShowMore(false); setMoreView('billing'); }}
                className={classNames(
                  "mx-1 my-1 flex-1 py-2 text-center text-[11px] leading-tight flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white",
                  "hover:bg-neutral-50"
                )}
                role="menuitem"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-success-accent/10 text-success-ink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/></svg>
                </span>
                <span>Billing</span>
              </a>
            </li>
            <li className="flex">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setActive('More'); setShowMore(false); setMoreView('support'); }}
                className={classNames(
                  "mx-1 my-1 flex-1 py-2 text-center text-[11px] leading-tight flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white",
                  "hover:bg-neutral-50"
                )}
                role="menuitem"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-success-accent/10 text-success-ink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M22 6 12 13 2 6"/></svg>
                </span>
                <span>Support</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}
