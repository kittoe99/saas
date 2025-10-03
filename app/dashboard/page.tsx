"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/app/components/Loader";

function classNames(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

// Simple plan catalog reused from Get-Started
const PLAN_OPTIONS = [
  { id: "small", name: "Small Businesses", price: "$59/mo", amount: 59 },
  { id: "ecom_large", name: "Ecommerce / Large Businesses", price: "$99/mo", amount: 99 },
  { id: "startup", name: "Large Businesses/Startups", price: "$169/mo", amount: 169 },
] as const;
type PlanId = typeof PLAN_OPTIONS[number]["id"];

function getPlanPriceDollars(planId: string): number {
  switch (planId) {
    case "small": return 59;
    case "ecom_large": return 99;
    case "startup": return 169;
    default: return 0;
  }
}

const TABS = ["Home", "Domains", "Leads", "Branding", "More", "Settings"] as const;
type TabKey = typeof TABS[number];

// Display labels requested by user while reusing existing content keys
const TAB_LABELS: Record<TabKey, string> = {
  Home: "Home",
  Domains: "Website",
  Leads: "Agents",
  Branding: "Branding",
  More: "More",
  Settings: "Settings",
};

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
    case "Leads":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={"h-5 w-5 " + cls} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9 6 9-6" />
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
    onboarding_completed?: boolean | null;
    progress_done?: number;
    progress_total?: number;
    progress_label?: string;
  }>>([]);

  // Home tab view state (layout + filters)
  const [layout, setLayout] = useState<'grid' | 'list'>(() => {
    try { return (localStorage.getItem('dash.home.layout') as 'grid' | 'list') || 'grid'; } catch { return 'grid'; }
  });
  const [filterText, setFilterText] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'building' | 'draft'>('all');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const statusBtnRef = useRef<HTMLButtonElement | null>(null);
  const statusMenuRef = useRef<HTMLDivElement | null>(null);
  // Leads (sorting + data)
  const [leadsSort, setLeadsSort] = useState<'newest' | 'oldest' | 'name' | 'status'>("newest");
  const [leadsSortMenuOpen, setLeadsSortMenuOpen] = useState(false);
  const leadsSortBtnRef = useRef<HTMLButtonElement | null>(null);
  const leadsSortMenuRef = useRef<HTMLDivElement | null>(null);
  // Profile menu (top bar)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileBtnRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Persist layout preference
  useEffect(() => {
    try { localStorage.setItem('dash.home.layout', layout); } catch {}
  }, [layout]);

  // Close custom dropdowns on outside click / Escape
  useEffect(() => {
    function onDocMouse(e: MouseEvent) {
      const t = e.target as Node | null;
      if (statusMenuOpen) {
        const inside = statusMenuRef.current?.contains(t as Node) || statusBtnRef.current?.contains(t as Node);
        if (!inside) setStatusMenuOpen(false);
      }
      if (leadsSortMenuOpen) {
        const inside2 = leadsSortMenuRef.current?.contains(t as Node) || leadsSortBtnRef.current?.contains(t as Node);
        if (!inside2) setLeadsSortMenuOpen(false);
      }
      if (profileMenuOpen) {
        const inside3 = profileMenuRef.current?.contains(t as Node) || profileBtnRef.current?.contains(t as Node);
        if (!inside3) setProfileMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (statusMenuOpen) setStatusMenuOpen(false);
        if (leadsSortMenuOpen) setLeadsSortMenuOpen(false);
        if (profileMenuOpen) setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [statusMenuOpen, leadsSortMenuOpen, profileMenuOpen]);

  // Create new site modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSitePlan, setNewSitePlan] = useState<PlanId>("small");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // AMA popover state (header search)
  const [amaOpen, setAmaOpen] = useState(false);
  const [amaPrompt, setAmaPrompt] = useState<string>("");
  const amaContainerRef = useRef<HTMLDivElement | null>(null);
  const [amaMessages, setAmaMessages] = useState<Array<{ id: number; role: 'user' | 'assistant'; text: string }>>([]);

  function handleAmaSubmit(text: string) {
    const t = text.trim();
    if (!t) return;
    setAmaPrompt(t);
    setAmaOpen(true);
    setAmaMessages((prev) => {
      const next = [...prev, { id: Date.now(), role: 'user' as const, text: t }];
      // Minimal placeholder assistant reply to simulate chatbot flow
      next.push({ id: Date.now() + 1, role: 'assistant' as const, text: "Thanks! We'll use this here for now while wiring up the full assistant." });
      return next;
    });
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const el = amaContainerRef.current;
      if (!el) return;
      if (amaOpen && !el.contains(e.target as Node)) {
        setAmaOpen(false);
      }
    }
    if (amaOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [amaOpen]);

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

  // User-owned/purchased domains
  const [myDomainsLoading, setMyDomainsLoading] = useState(false);
  const [myDomainsError, setMyDomainsError] = useState<string | null>(null);
  const [myDomains, setMyDomains] = useState<Array<{ id: string; domain: string; status: string | null; price: number | null; period: number | null; currency: string | null; created_at: string }>>([]);

  const [leadsLoading, setLeadsLoading] = useState<boolean>(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [leads, setLeads] = useState<Array<{ id: string; name: string | null; email: string | null; phone: string | null; source: string | null; status: string | null; created_at: string }>>([]);

  const loadLeads = async () => {
    setLeadsError(null);
    setLeadsLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error('Not authenticated');
      let query = supabase
        .from('leads')
        .select('id, name, email, phone, source, status, created_at')
        .eq('user_id', uid);
      if (leadsSort === 'newest') query = query.order('created_at', { ascending: false });
      else if (leadsSort === 'oldest') query = query.order('created_at', { ascending: true });
      else if (leadsSort === 'name') query = query.order('name', { ascending: true, nullsFirst: true });
      else if (leadsSort === 'status') query = query.order('status', { ascending: true, nullsFirst: true }).order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      setLeads((data as any[]) || []);
    } catch (e: any) {
      setLeadsError(e?.message || 'Failed to load leads');
      setLeads([]);
    } finally {
      setLeadsLoading(false);
    }
  };

  const loadMyDomains = async () => {
    setMyDomainsError(null);
    setMyDomainsLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('domain_purchases')
        .select('id, domain, status, price, period, currency, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMyDomains((data as any[])?.map((r) => ({
        id: r.id as string,
        domain: r.domain as string,
        status: (r.status as string) ?? null,
        price: typeof r.price === 'number' ? r.price : (r.price ? Number(r.price) : null),
        period: typeof r.period === 'number' ? r.period : (r.period ? Number(r.period) : null),
        currency: (r.currency as string) ?? 'USD',
        created_at: r.created_at as string,
      })) || []);
    } catch (e: any) {
      setMyDomainsError(e?.message || 'Failed to load your domains');
    } finally {
      setMyDomainsLoading(false);
    }
  };

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

  // Open modal to choose plan and pay before onboarding
  const handleCreateNewSite = () => {
    setCreateError(null);
    setShowCreateModal(true);
  };

  // Start Stripe Checkout for new site
  const handleStartNewSiteCheckout = async () => {
    setCreateError(null);
    setCreateLoading(true);
    try {
      // Ensure user is authenticated
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      const email = u?.user?.email || undefined;
      if (!uid) {
        window.location.href = "/login?next=/dashboard";
        return;
      }

      // 1) Create the draft website (server will tie it to user)
      const res = await fetch('/api/websites/create', { method: 'POST' });
      const j = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(j?.error || 'Failed to create website');
      const website_id = j?.website_id as string | undefined;
      if (!website_id) throw new Error('Missing website_id');

      // 2) Create Stripe Checkout Session
      const planMeta = PLAN_OPTIONS.find(p => p.id === newSitePlan)!;
      const amount_cents = Math.max(1, Math.floor(getPlanPriceDollars(newSitePlan) * 100));
      const checkout = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_cents,
          name: `${planMeta.name} — ${planMeta.price}`,
          currency: 'usd',
          quantity: 1,
          user_id: uid,
          email,
          website_id,
          plan: newSitePlan,
        })
      });
      const cj = await checkout.json().catch(() => null);
      if (!checkout.ok) throw new Error(cj?.error || `Checkout failed (${checkout.status})`);
      const url = cj?.url as string | undefined;
      if (!url) throw new Error('No Checkout session URL returned');
      window.location.href = url; // Stripe hosted UI
    } catch (e: any) {
      setCreateError(e?.message || 'Could not start checkout');
    } finally {
      setCreateLoading(false);
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
        .select('id, name, domain, vercel_prod_domain, status, created_at, onboarding(completed,data)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (mounted && sites) {
        setWebsites((sites as any[]).map((s: any) => {
          const ob = Array.isArray(s?.onboarding)
            ? ((s.onboarding[0]?.data as any) || {})
            : ((s?.onboarding?.data as any) || {});
          const obCompleted = Array.isArray(s?.onboarding)
            ? (s.onboarding[0]?.completed ?? null)
            : (s?.onboarding?.completed ?? null);
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
            onboarding_completed: (typeof obCompleted === 'boolean') ? obCompleted : null,
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
    // Load user's domains when switching to Domains tab
    if (active === 'Domains') {
      loadMyDomains();
    }
    // Load user's leads when switching to Leads tab
    if (active === 'Leads') {
      loadLeads();
    }
  }, [active]);

  // Reload leads when sort changes while on Leads tab
  useEffect(() => {
    if (active === 'Leads') {
      loadLeads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadsSort]);

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
        {/* Row 1: brand + project selector + right actions */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2 flex items-center gap-2">
          {/* Top bar: Logo left */}
          <a href="/dashboard" className="flex items-center gap-2 text-neutral-900">
            <div className="h-7 w-7 rounded bg-success-accent/20 text-success-ink inline-flex items-center justify-center font-semibold">H</div>
            <span className="text-sm font-medium">Hinn</span>
          </a>
          {/* Top bar: Profile menu right */}
          <div className="ml-auto flex items-center">
            <div className="relative" ref={profileMenuRef}>
              <button
                ref={profileBtnRef}
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                aria-label="Open profile menu"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/></svg>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-md border border-neutral-200 bg-white shadow-xl">
                  <ul className="py-1 text-sm text-neutral-800" role="menu">
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); openMoreView('account'); setProfileMenuOpen(false); }} className="block px-3 py-2 hover:bg-neutral-50" role="menuitem">Profile settings</a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); openMoreView('billing'); setProfileMenuOpen(false); }} className="block px-3 py-2 hover:bg-neutral-50" role="menuitem">Billing</a>
                    </li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); openMoreView('support'); setProfileMenuOpen(false); }} className="block px-3 py-2 hover:bg-neutral-50" role="menuitem">Support</a>
                    </li>
                    <li><hr className="my-1 border-neutral-200" /></li>
                    <li>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="block px-3 py-2 text-red-600 hover:bg-red-50" role="menuitem">Logout</a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Navigation row (tabs + AMA closely aligned) */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-2 flex items-center justify-center">
          <div className="flex items-center gap-2">
          <nav aria-label="Sections" className="overflow-x-auto whitespace-nowrap">
            <ul className="flex items-center gap-2" role="tablist">
              {TABS.map((tab) => {
                const selected = active === tab;
                return (
                  <li key={tab}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActive(tab);
                        setShowMore(false);
                        setMoreView('menu');
                      }}
                      className={classNames(
                        "relative inline-flex items-center rounded-md px-2.5 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
                        selected
                          ? "text-neutral-900 font-medium bg-neutral-100 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.06)]"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                      )}
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`panel-${tab.toLowerCase()}`}
                      id={`tabtop-${tab.toLowerCase()}`}
                    >
                      {TAB_LABELS[tab]}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* Ask Me Anything (compact) placed next to tabs */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.querySelector('input') as HTMLInputElement | null);
              const q = (input?.value || '').trim();
              if (!q) return;
              handleAmaSubmit(q);
              if (input) input.value = '';
            }}
            role="search"
            aria-label="Ask Me Anything"
            className="hidden md:block"
          >
            <div className="relative" ref={amaContainerRef}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask me anything…"
                  className="h-10 w-[18rem] min-w-[14rem] rounded-md border border-neutral-300 bg-white px-3 py-0 text-sm text-neutral-900 shadow-sm focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-accent-primary px-3 py-0 text-sm text-white hover:opacity-90"
                  aria-label="Ask"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
                  Ask
                </button>
              </div>
              {amaOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-[18rem] z-40 rounded-2xl border border-neutral-200 bg-white shadow-xl ring-1 ring-black/5"
                  role="dialog"
                  aria-label="Ask Me Anything"
                >
                  <span className="absolute -top-1 right-6 block h-2 w-2 rotate-45 bg-white border-t border-l border-neutral-200" aria-hidden="true" />
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[13px] font-medium text-neutral-900">Ask Me Anything</div>
                      <button type="button" onClick={() => setAmaOpen(false)} aria-label="Close" className="p-1 text-neutral-500 hover:text-neutral-800">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M6 6l12 12M18 6l-12 12"/></svg>
                      </button>
                    </div>
                    <div className="mt-2 max-h-48 overflow-auto pr-1 space-y-2">
                      {amaMessages.map(m => (
                        <div key={m.id} className={m.role === 'user' ? 'text-neutral-900' : 'text-neutral-800'}>
                          <div className={m.role === 'user' ? 'text-[11px] text-neutral-500 mb-0.5' : 'text-[11px] text-neutral-500 mb-0.5'}>
                            {m.role === 'user' ? 'You' : 'Assistant'}
                          </div>
                          <div className={m.role === 'user' ? 'rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-sm' : 'rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm'}>
                            {m.text}
                          </div>
                        </div>
                      ))}
                      {amaMessages.length === 0 && (
                        <div className="text-xs text-neutral-600">Type a question to begin…</div>
                      )}
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = (e.currentTarget.querySelector('input') as HTMLInputElement | null);
                        const q = (input?.value || '').trim();
                        if (!q) return;
                        handleAmaSubmit(q);
                        if (input) input.value = '';
                      }}
                      className="mt-3"
                      aria-label="Follow up"
                    >
                      <input type="text" placeholder="Ask a follow-up…" className="h-9 w-full rounded-md border border-neutral-300 bg-white px-3 py-0 text-sm text-neutral-900 focus-visible:ring-2 focus-visible:ring-success-accent" />
                    </form>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      </header>

      {/* Top Tabs removed: integrated into header nav above */}

      {/* App content area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 pb-24 sm:pb-10">
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar removed; use full-width main to center content container */}
          <main className="col-span-12 sm:col-span-12 lg:col-span-12">
            <div
              className="min-h-[40vh] mx-auto w-full max-w-5xl rounded-2xl border border-neutral-200 bg-white px-4 sm:px-6 py-4 sm:py-6 shadow-sm"
              role="tabpanel"
              id={`panel-${active.toLowerCase()}`}
              aria-labelledby={`tab-${active.toLowerCase()}`}
              aria-label={active}
            >
              {/* Mobile (native-like) Home */}
              {active === "Home" && (
                <div className="p-4 sm:p-6">
                  {/* Global onboarding gate */}
                  {onboardingChecked && needsOnboarding && (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-amber-900">Complete your onboarding</div>
                          <p className="mt-1 text-sm text-amber-800">We need a few details about your business to build your first site. You’ll be able to manage everything after this step.</p>
                        </div>
                        <a
                          href="/onboarding"
                          className="shrink-0 inline-flex items-center gap-2 rounded-md bg-success-accent px-3 py-2 text-sm text-white hover:opacity-90"
                        >
                          Start onboarding
                        </a>
                      </div>
                    </div>
                  )}
                  {/* Toolbar: search, status filter, layout toggle, New Site */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-2">
                      <div className="flex-1">
                        <label className="sr-only" htmlFor="site-search">Search</label>
                        <input
                          id="site-search"
                          type="text"
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                          placeholder="Search sites..."
                          className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-0 text-sm text-neutral-900 shadow-sm focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        />
                      </div>
                      <div className="relative" ref={statusMenuRef}>
                        <label className="sr-only" htmlFor="site-status">Status</label>
                        <button
                          ref={statusBtnRef}
                          type="button"
                          onClick={() => setStatusMenuOpen((v) => !v)}
                          className={classNames(
                            "inline-flex h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-0 text-sm text-neutral-900 shadow-sm",
                            statusMenuOpen && "ring-2 ring-success-accent"
                          )}
                          aria-haspopup="listbox"
                          aria-expanded={statusMenuOpen}
                        >
                          {filterStatus === 'all' ? 'All' : filterStatus === 'ready' ? 'Ready' : filterStatus === 'building' ? 'Building' : 'Draft'}
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 ml-1"><path d="M6 9l6 6 6-6"/></svg>
                        </button>
                        {statusMenuOpen && (
                          <ul
                            role="listbox"
                            className="absolute z-20 mt-1 min-w-[10rem] w-max max-h-60 overflow-auto rounded-md border border-neutral-200 bg-white shadow-xl focus:outline-none"
                          >
                            {(['all','ready','building','draft'] as const).map((opt) => (
                              <li
                                key={opt}
                                role="option"
                                aria-selected={filterStatus === opt}
                                onMouseDown={(e) => { e.preventDefault(); setFilterStatus(opt); setStatusMenuOpen(false); }}
                                className={classNames(
                                  "px-3 py-2 text-sm cursor-pointer select-none",
                                  filterStatus === opt ? "bg-neutral-100 text-neutral-900" : "text-neutral-800 hover:bg-neutral-50"
                                )}
                              >
                                {opt === 'all' ? 'All' : opt === 'ready' ? 'Ready' : opt === 'building' ? 'Building' : 'Draft'}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-10 items-center rounded-md border border-neutral-300 bg-white p-1">
                        <button
                          type="button"
                          onClick={() => setLayout('grid')}
                          className={classNames('h-full px-3 py-0 rounded', layout === 'grid' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50')}
                          aria-pressed={layout === 'grid'}
                          aria-label="Grid layout"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLayout('list')}
                          className={classNames('h-full px-3 py-0 rounded', layout === 'list' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50')}
                          aria-pressed={layout === 'list'}
                          aria-label="List layout"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateNewSite}
                        disabled={onboardingChecked && needsOnboarding}
                        className={classNames(
                          "inline-flex h-10 items-center gap-2 rounded-md px-3 py-0 text-sm text-white",
                          onboardingChecked && needsOnboarding ? "bg-neutral-300 cursor-not-allowed" : "bg-success-accent hover:opacity-90"
                        )}
                        aria-disabled={onboardingChecked && needsOnboarding}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 5v14M5 12h14"/></svg>
                        New Site
                      </button>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="mt-4">
                    {(() => {
                      // If onboarding has not been started, encourage completion first
                      if (onboardingChecked && needsOnboarding) {
                        return (
                          <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
                            Please complete onboarding to view and manage your sites.
                          </div>
                        );
                      }
                      const list = (websites || []).map((w) => {
                        const isReady = !!w.vercel_prod_domain;
                        const needsOb = !isReady && w.onboarding_completed === false;
                        const isBuilding = !isReady && !needsOb && (w.progress_done || 0) > 1;
                        const statusKey: 'ready' | 'building' | 'draft' | 'onboarding' =
                          isReady ? 'ready' : (needsOb ? 'onboarding' : (isBuilding ? 'building' : 'draft'));
                        return { ...w, _statusKey: statusKey } as typeof w & { _statusKey: 'ready'|'building'|'draft'|'onboarding' };
                      }).filter((w) => {
                        const txt = filterText.trim().toLowerCase();
                        const matchesText = !txt || (w.name || '').toLowerCase().includes(txt) || (w.domain || '').toLowerCase().includes(txt);
                        const matchesStatus = filterStatus === 'all' || w._statusKey === filterStatus;
                        return matchesText && matchesStatus;
                      });

                      if (list.length === 0) {
                        return <div className="text-sm text-neutral-600">No sites match your filters.</div>;
                      }

                      if (layout === 'grid') {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {list.map((w) => (
                              <div key={w.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft hover:shadow-card transition-shadow">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-neutral-900 truncate">{w.name || 'Untitled site'}</div>
                                    <div className="mt-0.5 text-xs text-neutral-600 truncate">{w.domain || w.vercel_prod_domain || '—'}</div>
                                  </div>
                                  <span className={classNames('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border',
                                    w._statusKey === 'ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : w._statusKey === 'building' ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : w._statusKey === 'onboarding' ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                                  )}>
                                    {w._statusKey === 'ready' ? 'Ready' : w._statusKey === 'building' ? 'Building' : w._statusKey === 'onboarding' ? 'Onboarding' : 'Draft'}
                                  </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                  <div className="text-xs text-neutral-600">{(w as any)._statusKey === 'onboarding' ? 'Complete onboarding to begin build' : (w.progress_label || 'Preparing build')}</div>
                                  <div className="text-xs text-neutral-600">{(w.progress_done || 0)}/{(w.progress_total || 3)}</div>
                                </div>
                                <div className="mt-2 h-1.5 w-full rounded bg-neutral-100 overflow-hidden">
                                  <div className={classNames('h-1.5', w._statusKey === 'ready' ? 'bg-emerald-500' : 'bg-neutral-400')} style={{ width: `${Math.min(100, Math.floor(((w.progress_done || 0) / (w.progress_total || 3)) * 100))}%` }} />
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                  {w.vercel_prod_domain ? (
                                    <a href={`https://${w.vercel_prod_domain}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-[12px] text-neutral-900 hover:bg-neutral-50">Open</a>
                                  ) : (
                                    <a href={`/onboarding?website_id=${w.id}`} className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-[12px] text-neutral-900 hover:bg-neutral-50">{(w as any)._statusKey === 'onboarding' ? 'Complete setup' : 'Continue'}</a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      // list layout
                      return (
                        <div className="overflow-hidden rounded-md border border-neutral-200">
                          <table className="w-full text-sm">
                            <thead className="bg-neutral-50 text-neutral-700">
                              <tr>
                                <th className="text-left px-3 py-2 font-medium">Name</th>
                                <th className="text-left px-3 py-2 font-medium">Domain</th>
                                <th className="text-left px-3 py-2 font-medium">Status</th>
                                <th className="text-left px-3 py-2 font-medium">Progress</th>
                                <th className="px-3 py-2"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                              {list.map((w) => (
                                <tr key={w.id}>
                                  <td className="px-3 py-2 text-neutral-900 font-medium">{w.name || 'Untitled site'}</td>
                                  <td className="px-3 py-2 text-neutral-700">{w.domain || w.vercel_prod_domain || '—'}</td>
                                  <td className="px-3 py-2">
                                    <span className={classNames('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border',
                                      (w as any)._statusKey === 'ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : (w as any)._statusKey === 'building' ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : (w as any)._statusKey === 'onboarding' ? 'bg-amber-50 text-amber-700 border-amber-200'
                                      : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                                    )}>
                                      {(w as any)._statusKey === 'ready' ? 'Ready' : (w as any)._statusKey === 'building' ? 'Building' : (w as any)._statusKey === 'onboarding' ? 'Onboarding' : 'Draft'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-neutral-700">{(w.progress_done || 0)}/{(w.progress_total || 3)} — {w.progress_label || 'Preparing build'}</td>
                                  <td className="px-3 py-2 text-right">
                                    <div className="inline-flex items-center gap-2">
                                      {w.vercel_prod_domain ? (
                                        <a href={`https://${w.vercel_prod_domain}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-[12px] text-neutral-900 hover:bg-neutral-50">Open</a>
                                      ) : (
                                        <a href={`/onboarding?website_id=${w.id}`} className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-[12px] text-neutral-900 hover:bg-neutral-50">{(w as any)._statusKey === 'onboarding' ? 'Complete setup' : 'Continue'}</a>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Leads tab content */
              // Simple leads list for the current user with sorting (no filters yet)
              }
              {active === "Leads" && (
                <div className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-neutral-900">Leads</div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-neutral-700">Sort</label>
                          <div className="relative" ref={leadsSortMenuRef}>
                            <button
                              ref={leadsSortBtnRef}
                              type="button"
                              onClick={() => setLeadsSortMenuOpen((v) => !v)}
                              className={classNames(
                                "inline-flex h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-0 text-[12px] text-neutral-900 shadow-sm",
                                leadsSortMenuOpen && "ring-2 ring-success-accent"
                              )}
                              aria-haspopup="listbox"
                              aria-expanded={leadsSortMenuOpen}
                            >
                              {leadsSort === 'newest' ? 'Newest' : leadsSort === 'oldest' ? 'Oldest' : leadsSort === 'name' ? 'Name' : 'Status'}
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 ml-1"><path d="M6 9l6 6 6-6"/></svg>
                            </button>
                            {leadsSortMenuOpen && (
                              <ul role="listbox" className="absolute z-20 mt-1 min-w-[10rem] w-max max-h-60 overflow-auto rounded-md border border-neutral-200 bg-white shadow-xl">
                                {(['newest','oldest','name','status'] as const).map((opt) => (
                                  <li
                                    key={opt}
                                    role="option"
                                    aria-selected={leadsSort === opt}
                                    onMouseDown={(e) => { e.preventDefault(); setLeadsSort(opt); setLeadsSortMenuOpen(false); }}
                                    className={classNames(
                                      "px-3 py-2 text-sm cursor-pointer select-none",
                                      leadsSort === opt ? "bg-neutral-100 text-neutral-900" : "text-neutral-800 hover:bg-neutral-50"
                                    )}
                                  >
                                    {opt === 'newest' ? 'Newest' : opt === 'oldest' ? 'Oldest' : opt === 'name' ? 'Name' : 'Status'}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <button type="button" onClick={loadLeads} className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-0 text-[12px] text-neutral-900 hover:bg-neutral-50">Refresh</button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
                      <div className="text-sm font-semibold text-neutral-900">Results</div>
                      <div className="mt-3">
                        {leadsLoading ? (
                          <div className="text-sm text-neutral-600">Loading…</div>
                        ) : leadsError ? (
                          <div className="text-sm text-red-600">{leadsError}</div>
                        ) : leads.length === 0 ? (
                          <div className="text-sm text-neutral-600">No leads match your current filters.</div>
                        ) : (
                          <div className="overflow-hidden rounded-md border border-neutral-200">
                            <table className="w-full text-sm">
                              <thead className="bg-neutral-50 text-neutral-700">
                                <tr>
                                  <th className="text-left px-3 py-2 font-medium">Name</th>
                                  <th className="text-left px-3 py-2 font-medium">Email</th>
                                  <th className="text-left px-3 py-2 font-medium">Phone</th>
                                  <th className="text-left px-3 py-2 font-medium">Source</th>
                                  <th className="text-left px-3 py-2 font-medium">Status</th>
                                  <th className="text-left px-3 py-2 font-medium">Created</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200">
                                {leads.map((l) => (
                                  <tr key={l.id}>
                                    <td className="px-3 py-2 text-neutral-900">{l.name || '—'}</td>
                                    <td className="px-3 py-2 text-neutral-800">{l.email || '—'}</td>
                                    <td className="px-3 py-2 text-neutral-800">{l.phone || '—'}</td>
                                    <td className="px-3 py-2 text-neutral-800">{l.source || '—'}</td>
                                    <td className="px-3 py-2">
                                      {l.status ? (
                                        <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700">{l.status}</span>
                                      ) : '—'}
                                    </td>
                                    <td className="px-3 py-2 text-neutral-700">{new Date(l.created_at).toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Website feature highlights */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
                      <div className="text-sm font-semibold text-neutral-900">Website capabilities</div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-accent/15 text-success-ink">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/></svg>
                            </span>
                            <div className="text-sm font-medium text-neutral-900">AI Capabilities</div>
                          </div>
                          <p className="mt-2 text-[13px] leading-5 text-neutral-700">Generate copy, sections, and suggestions with built-in AI. Iterate quickly with follow‑ups.</p>
                        </div>
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-accent/15 text-success-ink">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M4 5h16v14H4z"/><path d="M4 9h16"/></svg>
                            </span>
                            <div className="text-sm font-medium text-neutral-900">Custom designs</div>
                          </div>
                          <p className="mt-2 text-[13px] leading-5 text-neutral-700">Tailor layout, colors, and components to your brand. Rapidly preview and publish.</p>
                        </div>
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success-accent/15 text-success-ink">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M3 12h18"/><path d="M12 3v18"/></svg>
                            </span>
                            <div className="text-sm font-medium text-neutral-900">Optimized for SEO</div>
                          </div>
                          <p className="mt-2 text-[13px] leading-5 text-neutral-700">Fast pages with semantic markup, meta tags, and best‑practice structure out of the box.</p>
                        </div>
                      </div>
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
                  <div className="space-y-6">
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
                      <div className="text-sm font-semibold text-neutral-900">Search and purchase a domain</div>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-neutral-800">Keyword / Brand</label>
                          <input type="text" value={suggestQuery} onChange={(e) => setSuggestQuery(e.target.value)} placeholder="acme, mybrand, etc" className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-0 text-sm text-neutral-900 shadow-sm focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white" />
                        </div>
                        <div className="flex items-end">
                          <button type="button" onClick={handleFetchSuggestions} disabled={suggLoading} className={classNames('w-full inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 py-0 text-sm text-white', suggLoading ? 'bg-neutral-300 cursor-not-allowed' : 'bg-success-accent hover:opacity-90')}>
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
                                <tr
                                  key={s.name}
                                  className="hover:bg-neutral-50 cursor-pointer"
                                  onClick={() => handleSelectSuggestion(s.name)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectSuggestion(s.name); } }}
                                >
                                  <td className="px-3 py-2 text-neutral-900 font-medium">
                                    {s.name}
                                  </td>
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
                                  <td className="px-3 py-2 text-right hidden sm:table-cell">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleSelectSuggestion(s.name); }}
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

                    {/* Your domains list */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-neutral-900">Your domains</div>
                        <button type="button" onClick={loadMyDomains} className="inline-flex h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-0 text-[12px] text-neutral-900 hover:bg-neutral-50">
                          Refresh
                        </button>
                      </div>
                      <div className="mt-3">
                        {myDomainsLoading ? (
                          <div className="text-sm text-neutral-600">Loading…</div>
                        ) : myDomainsError ? (
                          <div className="text-sm text-red-600">{myDomainsError}</div>
                        ) : myDomains.length === 0 ? (
                          <div className="text-sm text-neutral-600">No domains yet. After purchasing, they will appear here.</div>
                        ) : (
                          <div className="overflow-hidden rounded-md border border-neutral-200">
                            <table className="w-full text-sm">
                              <thead className="bg-neutral-50 text-neutral-700">
                                <tr>
                                  <th className="text-left px-3 py-2 font-medium">Domain</th>
                                  <th className="text-left px-3 py-2 font-medium">Status</th>
                                  <th className="text-left px-3 py-2 font-medium">Price</th>
                                  <th className="text-left px-3 py-2 font-medium">Purchased</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200">
                                {myDomains.map((d) => (
                                  <tr key={d.id}>
                                    <td className="px-3 py-2 text-neutral-900 font-medium">{d.domain}</td>
                                    <td className="px-3 py-2">
                                      {d.status ? (
                                        <span className={classNames(
                                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border',
                                          d.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : d.status === 'failed' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                                        )}>{d.status}</span>
                                      ) : (
                                        <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700">—</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-neutral-800">
                                      {typeof d.price === 'number' ? `${d.currency || 'USD'} $${d.price}${d.period ? ` / ${d.period} yr` : ''}` : '—'}
                                    </td>
                                    <td className="px-3 py-2 text-neutral-700">{new Date(d.created_at).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Home content */}
              {active === "Home" && null}

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

      {/* Create New Site modal (root-level so it works from any tab) */}
      {showCreateModal && (
        <div role="dialog" aria-modal className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => !createLoading && setShowCreateModal(false)} />
          <div className="relative w-full max-w-md mx-3 rounded-2xl border border-neutral-200 bg-white shadow-2xl p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-neutral-900">Choose a plan</h3>
              <button
                type="button"
                onClick={() => !createLoading && setShowCreateModal(false)}
                className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M6 6l12 12M18 6l-12 12"/></svg>
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {PLAN_OPTIONS.map(p => (
                <label key={p.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer ${newSitePlan===p.id? 'border-success bg-success-bg' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{p.name}</div>
                    <div className="text-xs text-neutral-600">{p.price}</div>
                  </div>
                  <input
                    type="radio"
                    name="plan"
                    value={p.id}
                    checked={newSitePlan===p.id}
                    onChange={() => setNewSitePlan(p.id)}
                    className="h-4 w-4"
                  />
                </label>
              ))}
            </div>
            {createError && <div className="mt-3 text-sm text-red-600">{createError}</div>}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" className="px-4 py-2 rounded-md border border-neutral-300 bg-white text-sm" disabled={createLoading} onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded-md bg-success-accent text-white text-sm disabled:opacity-60" onClick={handleStartNewSiteCheckout} disabled={createLoading}>
                {createLoading ? 'Starting…' : 'Continue to payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar (hides on scroll down, shows on scroll up) */}
      <nav
        className="hidden"
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
      <div className="hidden" aria-label="More menu (mobile)">
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
