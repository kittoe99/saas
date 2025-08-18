"use client";

import React, { useState, useEffect } from "react";

// Lightweight utility like in get-started
function classNames(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

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

// Categories per site type
const CATEGORY_OPTIONS: Partial<Record<SiteType, string[]>> = {
  Ecommerce: ["Apparel", "Electronics", "Home & Garden", "Beauty", "Food & Beverage", "Other"],
  SaaS: ["Dev Tools", "Marketing", "Finance", "Productivity", "Healthcare", "Education", "Other"],
  Agency: ["Web", "SEO", "Advertising", "Branding", "Creative", "Consulting", "Other"],
  "Small business": ["Restaurants", "Transportation", "Home Services", "Retail", "Health & Wellness", "Professional Services", "Other"],
  Portfolio: ["Design", "Development", "Photography", "Video", "Art", "Writing", "Other"],
  Blog: ["Tech", "Lifestyle", "Finance", "Travel", "Food", "Education", "Other"],
  Nonprofit: ["Education", "Health", "Environment", "Community", "Arts", "Religion", "Other"],
  Community: ["Local", "Professional", "Hobby", "Education", "Tech", "Other"],
  "Personal brand": ["Coaching", "Speaking", "Content Creator", "Consulting", "Other"],
  "Hobby site": ["Gaming", "DIY", "Outdoors", "Arts & Crafts", "Collectibles", "Other"],
};

// Common countries list for suggestions filter
const COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "us", name: "United States" },
  { code: "ca", name: "Canada" },
  { code: "gb", name: "United Kingdom" },
  { code: "au", name: "Australia" },
  { code: "in", name: "India" },
  { code: "ie", name: "Ireland" },
  { code: "nz", name: "New Zealand" },
  { code: "za", name: "South Africa" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "es", name: "Spain" },
  { code: "it", name: "Italy" },
  { code: "nl", name: "Netherlands" },
  { code: "se", name: "Sweden" },
  { code: "no", name: "Norway" },
  { code: "dk", name: "Denmark" },
  { code: "fi", name: "Finland" },
  { code: "br", name: "Brazil" },
  { code: "mx", name: "Mexico" },
  { code: "ar", name: "Argentina" },
  { code: "cl", name: "Chile" },
  { code: "jp", name: "Japan" },
  { code: "kr", name: "South Korea" },
  { code: "sg", name: "Singapore" },
  { code: "my", name: "Malaysia" },
  { code: "ph", name: "Philippines" },
  { code: "id", name: "Indonesia" },
  { code: "ae", name: "United Arab Emirates" },
  { code: "sa", name: "Saudi Arabia" },
  { code: "ng", name: "Nigeria" },
  { code: "ke", name: "Kenya" },
];

function categoriesFor(siteType: SiteType | null): string[] {
  return siteType ? (CATEGORY_OPTIONS[siteType] || ["Other"]) : [];
}

// Suggested services per site type and category
const BASE_SERVICES: Partial<Record<SiteType, string[]>> = {
  Ecommerce: ["Product listings", "Checkout", "Shipping", "Returns", "Discounts", "Analytics"],
  SaaS: ["User auth", "Billing", "Dashboard", "Integrations", "Docs", "Support"],
  Agency: ["Consultation", "Project inquiry", "Portfolio", "Booking", "Testimonials", "Contact"],
  "Small business": ["About", "Services", "Pricing", "Contact", "Booking", "FAQ"],
  Portfolio: ["Case studies", "Gallery", "About", "Contact", "Blog"],
  Blog: ["Categories", "Newsletter", "Search", "Comments", "About"],
  Nonprofit: ["Mission", "Programs", "Donate", "Volunteer", "Events", "Contact"],
  Community: ["Forums", "Events", "Members", "Rules", "Contact"],
  "Personal brand": ["About", "Speaking", "Coaching", "Newsletter", "Contact"],
  "Hobby site": ["Articles", "Gallery", "How-tos", "Contact"],
};

const CATEGORY_SERVICES: Record<string, string[]> = {
  Restaurants: ["Catering services", "Online ordering", "Table reservations", "Private events", "Delivery"],
  Transportation: ["Moving services", "Logistics", "Vehicle transport", "Freight", "Courier"],
  "Home Services": ["Moving services", "Junk removal services", "Cleaning services", "Plumbing services", "Electrical services", "HVAC services", "Landscaping services"],
  Retail: ["Personal shopping", "Repairs", "Warranty handling", "Delivery"],
  "Health & Wellness": ["Massage therapy", "Chiropractic care", "Physical therapy", "Nutrition coaching", "Telehealth"],
  "Professional Services": ["Consulting services", "Book consultation", "Audits", "Training", "Support"],
  Design: ["Brand design", "Web design", "Packaging design", "Illustration"],
  Development: ["Web development", "App development", "API development", "Maintenance"],
  Photography: ["Portrait sessions", "Event photography", "Product photography", "Editing services"],
  Tech: ["Product reviews", "Tutorials", "How-to guides", "Consulting"],
  Education: ["Tutoring", "Workshops", "Courses", "Admissions consulting"],
  Apparel: ["Custom tailoring", "Alterations", "Personal styling"],
  Electronics: ["Phone repair services", "Computer repair services", "Screen replacement", "Battery replacement", "Device diagnostics"],
};

function servicesFor(siteType: SiteType | null, category: string): string[] {
  const cat = CATEGORY_SERVICES[category] || [];
  if (cat.length) return cat;
  const base = siteType ? (BASE_SERVICES[siteType] || []) : [];
  return base.length ? base : ["Custom service"];
}

// Config for type-specific questions (Option A)
type TypeQuestion =
  | { kind: "text"; key: string; label: string; placeholder?: string; required?: boolean }
  | { kind: "number"; key: string; label: string; min?: number; max?: number; required?: boolean }
  | { kind: "select"; key: string; label: string; options: string[]; required?: boolean }
  | { kind: "chips"; key: string; label: string; hint?: string; required?: boolean };

const TYPE_QUESTIONS: Partial<Record<SiteType, TypeQuestion[]>> = {
  Ecommerce: [
    { kind: "chips", key: "productCategories", label: "Product categories", hint: "Comma-separated" },
    { kind: "number", key: "skuCount", label: "Approx. SKU count", min: 0 },
    { kind: "select", key: "platform", label: "Platform preference", options: ["Shopify", "WooCommerce", "Wix", "Other"] },
    { kind: "chips", key: "paymentProviders", label: "Payment providers", hint: "Stripe, PayPal, etc." },
    { kind: "chips", key: "shippingRegions", label: "Fulfillment/shipping regions" },
  ],
  SaaS: [
    { kind: "text", key: "icp", label: "Target users / ICP", required: true },
    { kind: "chips", key: "keyFeatures", label: "Key features" },
    { kind: "chips", key: "pricingTiers", label: "Pricing tiers (names)" },
    { kind: "chips", key: "integrations", label: "Integrations" },
  ],
  Agency: [
    { kind: "select", key: "bookingMethod", label: "Booking method", options: ["phone", "form", "schedule"] },
  ],
  "Small business": [
    { kind: "chips", key: "businessHours", label: "Business hours", hint: "e.g. Mon-Fri 9-5" },
  ],
  Portfolio: [
    { kind: "chips", key: "workTypes", label: "Work types", hint: "e.g. Design, Development" },
    { kind: "number", key: "caseStudyCount", label: "# of case studies to feature", min: 0 },
    { kind: "chips", key: "mediaLinks", label: "Media links", hint: "Drive/Figma/Behance" },
  ],
  Blog: [
    { kind: "chips", key: "topics", label: "Topics" },
    { kind: "select", key: "frequency", label: "Posting frequency", options: ["Weekly", "Biweekly", "Monthly", "Quarterly"] },
    { kind: "chips", key: "authors", label: "Authors (names)" },
    { kind: "text", key: "newsletterProvider", label: "Newsletter provider" },
  ],
  Nonprofit: [
    { kind: "text", key: "mission", label: "Mission summary", required: true },
    { kind: "chips", key: "programs", label: "Programs / services" },
    { kind: "chips", key: "donationMethods", label: "Donation methods", hint: "Stripe, PayPal, Other" },
  ],
  Community: [
    { kind: "text", key: "purpose", label: "Community purpose", required: true },
    { kind: "chips", key: "channels", label: "Channels", hint: "Discord, Slack, Forum" },
    { kind: "chips", key: "events", label: "Events cadence" },
  ],
  "Personal brand": [
    { kind: "chips", key: "speakingTopics", label: "Speaking topics" },
    { kind: "chips", key: "offers", label: "Offers", hint: "Courses, Coaching" },
    { kind: "text", key: "newsletterProvider", label: "Newsletter provider" },
  ],
  "Hobby site": [
    { kind: "text", key: "niche", label: "Topic / niche" },
    { kind: "select", key: "mediaType", label: "Primary media type", options: ["Articles", "Gallery", "Video"] },
    { kind: "chips", key: "communityFeatures", label: "Community features", hint: "Comments, Discord" },
  ],
};

function typeQuestionsFor(siteType: SiteType | null): TypeQuestion[] {
  return siteType ? (TYPE_QUESTIONS[siteType] || []) : [];
}

function isTypeSpecificValid(siteType: SiteType | null, data: Record<string, any>): boolean {
  const qs = typeQuestionsFor(siteType);
  for (const q of qs) {
    if (!q.required) continue;
    const v = data?.[q.key];
    if (q.kind === "number") {
      if (typeof v !== "number") return false;
    } else {
      if (!v || (typeof v === "string" && v.trim().length === 0)) return false;
    }
  }
  return true;
}

// Preset brand color palette for selection (pick up to 2)
const PRESET_COLORS: string[] = [
  "#1a73e8", // Blue
  "#ef4444", // Red
  "#10b981", // Green
  "#f59e0b", // Amber
  "#3b82f6", // Light Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#0ea5e9", // Sky
  "#22c55e", // Emerald
  "#111827", // Near-black
];

export default function OnboardingPage() {
  const [siteType, setSiteType] = useState<SiteType | null>(null);
  const [category, setCategory] = useState<string>("");
  const [name, setName] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [hasCurrent, setHasCurrent] = useState<"yes" | "no" | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  // New onboarding fields for DFY website build
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [newService, setNewService] = useState("");
  const [serviceAreas, setServiceAreas] = useState(""); // comma-separated
  const [primaryColors, setPrimaryColors] = useState<string[]>([]); // up to 2 selections
  const [contactMethod, setContactMethod] = useState<"email" | "phone" | "form" | "schedule" | null>(null);
  const [socialX, setSocialX] = useState("");
  const [socialLinkedIn, setSocialLinkedIn] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [typeSpecific, setTypeSpecific] = useState<Record<string, any>>({});
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

  // Service areas (cities with radius)
  const [countryCode, setCountryCode] = useState<string>("");
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [cities, setCities] = useState<Array<{ name: string; displayName: string; lat: number; lon: number; radiusKm: number }>>([]);
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mi">("km");

  // Step orchestration
  const [step, setStep] = useState(1);
  const step1Done = !!siteType;
  const step2Done = step1Done && category.trim().length > 0;
  const step3Done = name.trim().length >= 2;
  const step4Done = !!siteType && !!name.trim() && (hasCurrent === "no" || (hasCurrent === "yes" && (siteAdded || skipped)));
  const step5Done = (businessPhone.trim().length >= 7 || /\S+@\S+\.\S+/.test(businessEmail)) && !!contactMethod;
  const step6Done = selectedServices.length > 0;
  const step7Done = cities.length > 0; // at least one service area
  const canGoStep2 = step1Done;
  const canGoStep3 = step2Done;
  const canGoStep4 = step3Done;
  const canGoStep5 = step4Done;
  const canGoStep6 = step5Done;
  const canGoStep7 = step6Done; // proceed to areas
  const canGoStep8 = step7Done && isTypeSpecificValid(siteType, typeSpecific);

  // Minimal nudge scrolling: only scroll enough so the element is slightly in view
  // Removed auto-scroll helper

  // Scroll to name when type chosen
  useEffect(() => {
    if (siteType) setTimeout(() => {
      // When a Continue button is present for this step, do not auto-scroll.
      // We only restore focus to the input so the user can start typing immediately.
      try { nameInputRef.current?.focus({ preventScroll: true } as any); } catch {}
    }, 120);
    // reset category when site type changes
    setCategory("");
  }, [siteType]);

  // If the input is intended to be focused, ensure it stays focused across re-renders
  useEffect(() => {
    if (!nameFocused) return;
    if (document.activeElement !== nameInputRef.current) {
      try { nameInputRef.current?.focus({ preventScroll: true } as any); } catch {}
    }
  }, [nameFocused, name]);
  // Do NOT auto-scroll on every keystroke; next step reveals only on explicit commit (Enter/Continue)
  // Scroll to URL or actions when 
  useEffect(() => {
    // no-op
  }, [hasCurrent]);
  useEffect(() => {
    // no-op
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

  // Debounced city suggestions using OpenStreetMap Nominatim
  useEffect(() => {
    const q = cityQuery.trim();
    if (!q) { setCitySuggestions([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q,
          format: "json",
          addressdetails: "1",
          limit: "6",
        });
        const cc = countryCode.trim().toLowerCase();
        if (cc) params.set("countrycodes", cc);
        const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
        const res = await fetch(url, { signal: ctrl.signal, headers: { "Accept-Language": "en" } });
        if (!res.ok) throw new Error("Address lookup failed");
        const data = await res.json();
        setCitySuggestions(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (e) {
        if (!(e as any)?.name?.includes("Abort")) setCitySuggestions([]);
      }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [cityQuery, countryCode]);

  // Helpers for unit conversion (store internally in km)
  const toDisplayDistance = (km: number) => distanceUnit === "km" ? km : Math.round(km * 0.621371);
  const fromDisplayDistance = (val: number) => distanceUnit === "km" ? val : Math.round(val / 0.621371);

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
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Onboarding</h1>
      <p className="mt-1 text-sm text-gray-600">Follow the steps below to tell us about your site.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <ProgressSidebar current={step} done={{ s1: step1Done, s2: step2Done, s3: step3Done, s4: step4Done, s5: step5Done, s6: step6Done, s7: step7Done }} />
        </aside>

        {/* Steps */}
        <div className="space-y-4">
          {/* Step 1 */}
          <details
            open={step === 1}
            className={classNames(
              "relative rounded-xl border",
              step > 1 ? "bg-green-50 border-green-200" : "bg-white border-neutral-200"
            )}
            onToggle={(e) => {
              const el = e.currentTarget as HTMLDetailsElement;
              if (el.open) setStep(1);
            }}
          >
            {step > 1 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-green-400" />}
            <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
              <div>
                <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                  {step > 1 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-[11px]">✓</span>}
                  <span>1. Type of site</span>
                </div>
                {step > 1 && <div className="text-xs text-neutral-600 mt-0.5 truncate">{siteType}</div>}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 1 ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-700")}>{step > 1 ? "Completed" : step === 1 ? "In progress" : "Locked"}</span>
                <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </summary>
            <div className="accordion border-t border-neutral-200">
              <div className="accordion-content p-4 sm:p-5 fade-slide">
                <label className="block text-sm font-medium">Type of site</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SITE_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSiteType(t)}
                      className={classNames(
                        "rounded-md border px-3 py-2 text-sm text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]",
                        siteType === t ? "border-[#1a73e8] ring-1 ring-[#1a73e8] bg-[#1a73e8]/5" : "border-gray-300 hover:bg-[#1a73e8]/5"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {siteType && <div className="mt-2 text-xs text-gray-600">Selected: {siteType}</div>}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className={classNames(
                      "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]",
                      !canGoStep2 ? "bg-[#93b7f1] cursor-not-allowed" : "bg-[#1a73e8] hover:opacity-95"
                    )}
                    disabled={!canGoStep2}
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </details>
          
          {/* Step 2: Category/Industry */}
          <details
            open={step === 2}
            className={classNames(
              "relative rounded-xl border",
              step > 2 ? "bg-green-50 border-green-200" : step >= 2 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
            )}
            onToggle={(e) => {
              const el = e.currentTarget as HTMLDetailsElement;
              if (el.open && canGoStep2) setStep(2);
              if (!canGoStep2) el.open = false;
            }}
          >
            {step > 2 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-green-400" />}
            <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
              <div>
                <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                  {step > 2 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-[11px]">✓</span>}
                  <span>2. Category / Industry</span>
                </div>
                {step > 2 && <div className="text-xs text-neutral-600 mt-0.5 truncate">{category}</div>}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 2 ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-700")}>{step > 2 ? "Completed" : step === 2 ? "In progress" : "Locked"}</span>
                <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </summary>
            <div className="accordion border-t border-neutral-200">
              <div className="accordion-content p-4 sm:p-5 fade-slide">
                <label className="block text-sm font-medium">Select a category / industry</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categoriesFor(siteType).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={classNames(
                        "rounded-md border px-3 py-2 text-sm text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]",
                        category === c ? "border-[#1a73e8] ring-1 ring-[#1a73e8] bg-[#1a73e8]/5" : "border-gray-300 hover:bg-[#1a73e8]/5"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {category && <div className="mt-2 text-xs text-gray-600">Selected: {category}</div>}
                <div className="mt-4 flex justify-between">
                  <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(1)}>Back</button>
                  <button
                    type="button"
                    className={classNames(
                      "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]",
                      !canGoStep3 ? "bg-[#93b7f1] cursor-not-allowed" : "bg-[#1a73e8] hover:opacity-95"
                    )}
                    disabled={!canGoStep3}
                    onClick={() => setStep(3)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Step 3 */}
          <details
            open={step === 3}
            className={classNames(
              "relative rounded-xl border",
              step > 3 ? "bg-green-50 border-green-200" : step >= 3 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
            )}
            onToggle={(e) => {
              const el = e.currentTarget as HTMLDetailsElement;
              if (el.open && canGoStep3) setStep(3);
              if (!canGoStep3) el.open = false;
            }}
          >
            {step > 3 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-green-400" />}
            <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
              <div>
                <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                  {step > 3 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-[11px]">✓</span>}
                  <span>3. Name</span>
                </div>
                {step > 3 && <div className="text-xs text-neutral-600 mt-0.5 truncate">{name}</div>}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 3 ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-700")}>{step > 3 ? "Completed" : step === 3 ? "In progress" : "Locked"}</span>
                <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </summary>
            <div className="accordion border-t border-neutral-200">
              <div className="accordion-content p-4 sm:p-5 fade-slide">
                <label className="block text-sm font-medium">Name of site / business / organization</label>
                <input
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setNameFocused(false)}
                  onFocus={() => setNameFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (composingRef.current) return;
                      if (name.trim().length >= 2) setStep(4);
                    }
                  }}
                  onCompositionStart={() => { composingRef.current = true; }}
                  onCompositionEnd={() => { composingRef.current = false; }}
                  autoComplete="off"
                  placeholder="e.g. Bello Moving"
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
                />
                <div className="mt-3 flex justify-between">
                  <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(2)}>Back</button>
                  <button
                    type="button"
                    className={classNames(
                      "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]",
                      !canGoStep4 ? "bg-[#93b7f1] cursor-not-allowed" : "bg-[#1a73e8] hover:opacity-95"
                    )}
                    disabled={!canGoStep4}
                    onClick={() => setStep(4)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Step 4 */}
          <details
            open={step === 4}
            className={classNames(
              "relative rounded-xl border",
              step > 4 ? "bg-green-50 border-green-200" : step >= 4 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
            )}
            onToggle={(e) => {
              const el = e.currentTarget as HTMLDetailsElement;
              if (el.open && canGoStep4) setStep(4);
              if (!canGoStep4) el.open = false;
            }}
          >
            {step > 4 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-green-400" />}
            <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
              <div>
                <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                  {step > 4 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-[11px]">✓</span>}
                  <span>4. Website details</span>
                </div>
                {step > 4 && <div className="text-xs text-neutral-600 mt-0.5 truncate">{hasCurrent === 'yes' ? currentUrl : 'No current website'}</div>}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 4 ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-700")}>{step > 4 ? "Completed" : step === 4 ? "In progress" : "Locked"}</span>
                <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </summary>
            <div className="accordion border-t border-neutral-200">
              <div className="accordion-content p-4 sm:p-5 fade-slide">
                <div className="mb-3 min-w-0">
                  <label className="block text-sm font-medium">Do you have a current website?</label>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHasCurrent("yes")}
                      className={classNames("rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]", hasCurrent === "yes" ? "border-[#1a73e8] ring-1 ring-[#1a73e8] bg-[#1a73e8]/5" : "border-gray-300 hover:bg-[#1a73e8]/5")}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasCurrent("no")}
                      className={classNames("rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]", hasCurrent === "no" ? "border-[#1a73e8] ring-1 ring-[#1a73e8] bg-[#1a73e8]/5" : "border-gray-300 hover:bg-[#1a73e8]/5")}
                    >
                      No
                    </button>
                  </div>
                </div>

                {hasCurrent === "yes" && (
                  <div>
                    <label className="block text-sm font-medium">Current website URL</label>
                    <input
                      ref={urlRef as any}
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

                    {notFound && !searching && (
                      <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                        <div className="font-medium">Site Not Found</div>
                        <p className="mt-1 text-red-900">We couldn’t find enough public information for this URL.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-md px-3 py-2 text-sm border border-[#1a73e8] text-[#1a73e8] bg-white transition-colors hover:border-[#1664c4] hover:text-[#1664c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
                            onClick={() => { setNotFound(false); setSummary(null); }}
                          >
                            Retry
                          </button>
                          <button
                            type="button"
                            className="rounded-md bg-[#1a73e8] px-3 py-2 text-sm text-white transition-colors hover:bg-[#1664c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
                            onClick={() => { setSkipped(true); }}
                          >
                            Skip for now
                          </button>
                        </div>
                      </div>
                    )}

                    {summary && !searching && (
                      <div className="mt-4 space-y-3 rounded-md border border-gray-200 p-4">
                        {typeof searchedCount === 'number' && (
                          <div className="mb-1 flex items-center justify-between">
                            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              <svg className="h-3.5 w-3.5 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                                <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
                              </svg>
                              <span> Searched {searchedCount} {searchedCount === 1 ? 'page' : 'pages'} </span>
                            </div>
                            {searchedPreview.length > 0 && (
                              <button type="button" className="text-xs text-[#1a73e8] hover:text-[#1664c4] underline-offset-2 hover:underline" onClick={() => setShowSources((v) => !v)}>
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
                                  <a className="hover:underline" href={r.url} target="_blank" rel="noreferrer">{r.title || r.url}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {summary.summary ? (
                          <div>
                            <div className="text-sm font-medium">Summary</div>
                            {/^\s*-\s+/.test(summary.summary) ? (
                              <ul className="mt-1 list-disc pl-5 text-sm text-gray-700 space-y-1">
                                {summary.summary.split(/\r?\n/).filter(Boolean).map((line: string, idx: number) => {
                                  const raw = line.replace(/^\s*-\s+/, "").trim();
                                  const mdMatch = raw.match(/^\*\*(.+?)\*\*:\s*(.*)$/);
                                  const plainMatch = raw.match(/^([A-Z][A-Za-z\s]+):\s*(.*)$/);
                                  let heading: string | null = null;
                                  let content: string = raw;
                                  if (mdMatch) { heading = mdMatch[1].trim(); content = mdMatch[2].trim(); }
                                  else if (plainMatch) { heading = plainMatch[1].trim(); content = plainMatch[2].trim(); }
                                  return (
                                    <li key={idx}>{heading ? (<><span className="font-semibold text-base">{heading}:</span> {content}</>) : raw}</li>
                                  );
                                })}
                              </ul>
                            ) : (
                              <Typewriter text={summary.summary} />
                            )}
                          </div>
                        ) : null}

                        {!summary.summary && (summary.about || summary.purpose) ? (
                          <div className="space-y-3">
                            {summary.about ? (<div><div className="text-sm font-medium">About</div><div className="mt-1 text-sm text-gray-700">{summary.about}</div></div>) : null}
                            {summary.purpose ? (<div><div className="text-sm font-medium">Purpose</div><div className="mt-1 text-sm text-gray-700">{summary.purpose}</div></div>) : null}
                          </div>
                        ) : null}

                        {summary.services && summary.services.length > 0 ? (
                          <div>
                            <div className="text-sm font-medium">Offerings</div>
                            <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
                              {summary.services.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                            </ul>
                          </div>
                        ) : null}

                        {summary.details && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {summary.details.tagline ? (<div><div className="text-xs font-medium text-gray-500">Tagline</div><div className="text-sm text-gray-700">{summary.details.tagline}</div></div>) : null}
                            {summary.details.industries && summary.details.industries.length > 0 ? (<div><div className="text-xs font-medium text-gray-500">Industries</div><div className="text-sm text-gray-700">{summary.details.industries.join(', ')}</div></div>) : null}
                            {summary.details.locations && summary.details.locations.length > 0 ? (<div><div className="text-xs font-medium text-gray-500">Locations</div><div className="text-sm text-gray-700">{summary.details.locations.join(', ')}</div></div>) : null}
                            {summary.details.contact && (summary.details.contact.email || summary.details.contact.phone) ? (<div><div className="text-xs font-medium text-gray-500">Contact</div><div className="text-sm text-gray-700">{[summary.details.contact.email, summary.details.contact.phone].filter(Boolean).join(' • ')}</div></div>) : null}
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

                    {showManual && (
                      <div className="mt-4 min-w-0">
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

                    {error && (<div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>)}
                  </div>
                )}

                <div className="mt-4 flex justify-between">
                  <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(3)}>Back</button>
                  <button
                    type="button"
                    className={classNames(
                      "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]",
                      !canGoStep5 ? "bg-[#93b7f1] cursor-not-allowed" : "bg-[#1a73e8] hover:opacity-95"
                    )}
                    disabled={!canGoStep5}
                    onClick={() => setStep(5)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Step 5: Business & Contact */}
          <details
            open={step === 5}
            className={classNames(
              "relative rounded-xl border",
              step > 5 ? "bg-green-50 border-green-200" : step >= 5 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
            )}
            onToggle={(e) => {
              const el = e.currentTarget as HTMLDetailsElement;
              if (el.open && canGoStep5) setStep(5);
              if (!canGoStep5) el.open = false;
            }}
          >
            {step > 5 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-green-400" />}
            <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
              <div>
                <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                  {step > 5 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-[11px]">✓</span>}
                  <span>5. Business & Contact</span>
                </div>
                {step > 5 && (
                  <div className="text-xs text-neutral-600 mt-0.5 truncate">
                    {[businessPhone || null, businessEmail || null].filter(Boolean).join(" • ") || "Contact preferences set"}
                  </div>
                )}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 5 ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-700")}>{step > 5 ? "Completed" : step === 5 ? "In progress" : "Locked"}</span>
                <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </summary>
            <div className="accordion border-t border-neutral-200">
              <div className="accordion-content p-4 sm:p-5 fade-slide">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">Business phone</label>
                    <input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="(555) 123-4567" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Business email</label>
                    <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="hello@yourbusiness.com" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium">Preferred contact method</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["email","phone","form","schedule"].map((m) => (
                      <button key={m} type="button" onClick={() => setContactMethod(m as any)} className={classNames("rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]", contactMethod === m ? "border-[#1a73e8] ring-1 ring-[#1a73e8] bg-[#1a73e8]/5" : "border-gray-300 hover:bg-[#1a73e8]/5")}>{m}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">Brand colors (select up to 2)</label>
                    <div className="mt-2">
                      <div className="grid grid-cols-8 gap-2">
                        {PRESET_COLORS.map((c) => {
                          const selected = primaryColors.includes(c);
                          const atLimit = !selected && primaryColors.length >= 2;
                          return (
                            <button
                              key={c}
                              type="button"
                              aria-pressed={selected}
                              title={c}
                              onClick={() => {
                                setPrimaryColors((prev) => {
                                  if (prev.includes(c)) return prev.filter((x) => x !== c);
                                  if (prev.length >= 2) return prev; // enforce max 2
                                  return [...prev, c];
                                });
                              }}
                              className={classNames(
                                "h-8 w-8 rounded-md border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]",
                                selected ? "ring-2 ring-[#1a73e8] border-[#1a73e8]" : "border-gray-300",
                                atLimit ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                              )}
                              style={{ backgroundColor: c }}
                              disabled={atLimit}
                            />
                          );
                        })}
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {primaryColors.length === 0 ? "No color selected" : `Selected: ${primaryColors.join(", ")}`}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Social links (optional)</label>
                    <div className="mt-1 grid gap-2">
                      <input value={socialX} onChange={(e) => setSocialX(e.target.value)} placeholder="X / Twitter URL" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]" />
                      <input value={socialLinkedIn} onChange={(e) => setSocialLinkedIn(e.target.value)} placeholder="LinkedIn URL" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]" />
                      <input value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="Instagram URL" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]" />
                      <input value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="Facebook URL" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(4)}>Back</button>
                  <button
                    type="button"
                    className={classNames("inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]", !canGoStep6 ? "bg-[#93b7f1] cursor-not-allowed" : "bg-[#1a73e8] hover:opacity-95")}
                    disabled={!canGoStep6}
                    onClick={() => setStep(6)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Step 6: Services */}
          <details
            open={step === 6}
            className={classNames("relative rounded-xl border", step > 6 ? "bg-green-50 border-green-200" : step >= 6 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70")}
            onToggle={(e) => {
              const el = e.currentTarget as HTMLDetailsElement;
              if (el.open && canGoStep6) setStep(6);
              if (!canGoStep6) el.open = false;
            }}
          >
            {step > 6 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-green-400" />}
            <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
              <div>
                <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                  {step > 6 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-[11px]">✓</span>}
                  <span>6. Services</span>
                </div>
                {step > 6 && (
                  <div className="mt-0.5 max-w-[90vw] sm:max-w-[520px]">
                    <div className="flex flex-wrap gap-1">
                      {selectedServices.length === 0 ? (
                        <span className="text-xs text-neutral-600">No services selected</span>
                      ) : (
                        <>
                          {selectedServices.slice(0, 3).map((s) => (
                            <span key={s} className="text-[10px] rounded-full bg-[#1a73e8]/10 text-[#1a73e8] px-2 py-0.5 border border-[#1a73e8]/20 break-words whitespace-normal">
                              {s}
                            </span>
                          ))}
                          {selectedServices.length > 3 && (
                            <span className="text-[10px] rounded-full bg-neutral-100 text-neutral-700 px-2 py-0.5 border border-neutral-200">
                              +{selectedServices.length - 3} more
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 6 ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-700")}>{step > 6 ? "Completed" : step === 6 ? "In progress" : "Locked"}</span>
                <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </summary>
            <div className="accordion border-t border-neutral-200">
              <div className="accordion-content p-4 sm:p-5 fade-slide">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">Services you provide</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {servicesFor(siteType, category).map((s) => {
                        const selected = selectedServices.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                            className={classNames(
                              "rounded-md border px-3 py-2 text-sm text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]",
                              selected ? "border-[#1a73e8] ring-1 ring-[#1a73e8] bg-[#1a73e8]/5" : "border-gray-300 hover:bg-[#1a73e8]/5"
                            )}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        placeholder="Add a custom service"
                        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const v = newService.trim();
                          if (!v) return;
                          setSelectedServices((prev) => (prev.includes(v) ? prev : [...prev, v]));
                          setNewService("");
                        }}
                        className="rounded-md bg-[#1a73e8] px-3 py-2 text-sm text-white transition-colors hover:bg-[#1664c4] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]"
                      >
                        Add
                      </button>
                    </div>
                    {selectedServices.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedServices.map((s) => (
                          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] px-2 py-1 text-xs border border-[#1a73e8]/30">
                            {s}
                            <button type="button" aria-label={`Remove ${s}`} className="ml-1 text-[#1a73e8] hover:text-[#1664c4]" onClick={() => setSelectedServices((prev) => prev.filter((x) => x !== s))}>
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div />
                </div>
                {/* Type-specific details (Option A) */}
                {siteType && typeQuestionsFor(siteType).length > 0 && (
                  <div className="mt-6 border-t border-neutral-200 pt-4">
                    <div className="text-sm font-medium mb-2">Type-specific details</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {typeQuestionsFor(siteType).map((q) => {
                        const v = typeSpecific[q.key];
                        const setVal = (val: any) => setTypeSpecific((prev) => ({ ...prev, [q.key]: val }));
                        // Special-case: render preset card selector for business hours
                        if (q.key === "businessHours") {
                          const PRESET_HOURS = [
                            "Mon-Fri 9-5",
                            "Mon-Sat 9-6",
                            "Weekends only",
                            "24/7",
                            "By appointment",
                          ];
                          return (
                            <div key={q.key}>
                              <label className="block text-sm font-medium">{q.label}{q.required ? <span className="text-red-600">*</span> : null}</label>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {PRESET_HOURS.map((opt) => {
                                  const selected = v === opt;
                                  return (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setVal(opt)}
                                      className={classNames(
                                        "rounded-md border px-3 py-2 text-sm text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]",
                                        selected ? "border-[#1a73e8] ring-1 ring-[#1a73e8] bg-[#1a73e8]/5" : "border-gray-300 hover:bg-[#1a73e8]/5"
                                      )}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="mt-3 flex gap-2">
                                <input
                                  value={typeof v === "string" && !PRESET_HOURS.includes(v) ? v : ""}
                                  onChange={(e) => setVal(e.target.value)}
                                  placeholder="Custom hours (optional)"
                                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
                                />
                              </div>
                              {/* Hint intentionally omitted here to satisfy TypeScript union constraints */}
                            </div>
                          );
                        }
                        if (q.kind === "text") {
                          return (
                            <div key={q.key}>
                              <label className="block text-sm font-medium">{q.label}{q.required ? <span className="text-red-600">*</span> : null}</label>
                              <input value={v || ""} onChange={(e) => setVal(e.target.value)} placeholder={q.placeholder || ""} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]" />
                            </div>
                          );
                        }
                        if (q.kind === "number") {
                          return (
                            <div key={q.key}>
                              <label className="block text-sm font-medium">{q.label}{q.required ? <span className="text-red-600">*</span> : null}</label>
                              <input type="number" value={typeof v === "number" ? v : (v ?? "")} onChange={(e) => {
                                const val = e.target.value;
                                setVal(val === "" ? "" : Number(val));
                              }} min={q.min ?? undefined} max={q.max ?? undefined} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]" />
                            </div>
                          );
                        }
                        if (q.kind === "select") {
                          return (
                            <div key={q.key}>
                              <label className="block text-sm font-medium">{q.label}{q.required ? <span className="text-red-600">*</span> : null}</label>
                              <select value={v || ""} onChange={(e) => setVal(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]">
                                <option value="">Select…</option>
                                {q.options.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          );
                        }
                        // chips -> comma-separated input
                        return (
                          <div key={q.key}>
                            <label className="block text-sm font-medium">{q.label}{q.required ? <span className="text-red-600">*</span> : null}</label>
                            <input value={v || ""} onChange={(e) => setVal(e.target.value)} placeholder={q.hint || "Comma-separated"} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]" />
                            {q.hint && <div className="mt-1 text-xs text-gray-500">{q.hint}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex justify-between">
                  <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(5)}>Back</button>
                  <button
                    type="button"
                    className={classNames("inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]", !canGoStep7 ? "bg-[#93b7f1] cursor-not-allowed" : "bg-[#1a73e8] hover:opacity-95")}
                    disabled={!canGoStep7}
                    onClick={() => setStep(7)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Step 7: Service areas */}
          <details
            open={step === 7}
            className={classNames(
              "relative rounded-xl border",
              step > 7 ? "bg-green-50 border-green-200" : step >= 7 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
            )}
            onToggle={(e) => {
              const el = e.currentTarget as HTMLDetailsElement;
              if (el.open && canGoStep7) setStep(7);
              if (!canGoStep7) el.open = false;
            }}
          >
            {step > 7 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-green-400" />}
            <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
              <div>
                <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                  {step > 7 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white text-[11px]">✓</span>}
                  <span>7. Service areas</span>
                </div>
                {step > 7 && (
                  <div className="mt-0.5 max-w-[90vw] sm:max-w-[520px]">
                    <div className="flex flex-wrap gap-1">
                      {cities.length === 0 ? (
                        <span className="text-xs text-neutral-600">No locations added</span>
                      ) : (
                        <>
                          {cities.slice(0, 3).map((c, idx) => (
                            <span key={`${c.name}-${idx}`} className="text-[10px] rounded-full bg-neutral-100 text-neutral-700 px-2 py-0.5 border border-neutral-200 break-words whitespace-normal">
                              {c.name} ({toDisplayDistance(c.radiusKm)}{distanceUnit})
                            </span>
                          ))}
                          {cities.length > 3 && (
                            <span className="text-[10px] rounded-full bg-neutral-100 text-neutral-700 px-2 py-0.5 border border-neutral-200">
                              +{cities.length - 3} more
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 7 ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-700")}>{step > 7 ? "Completed" : step === 7 ? "In progress" : "Locked"}</span>
                <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </summary>
            <div className="accordion border-t border-neutral-200">
              <div className="accordion-content p-4 sm:p-5 fade-slide">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">Country</label>
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
                    >
                      <option value="">Select country…</option>
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-gray-500">Selecting a country helps us suggest locations in your region.</div>
                    <div className="mt-3">
                      <span className="block text-sm font-medium mb-1">Units</span>
                      <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
                        <button type="button" className={`px-3 py-1.5 text-sm ${distanceUnit === 'km' ? 'bg-[#1a73e8] text-white' : 'bg-white text-neutral-700'}`} onClick={() => setDistanceUnit('km')}>km</button>
                        <button type="button" className={`px-3 py-1.5 text-sm border-l border-gray-300 ${distanceUnit === 'mi' ? 'bg-[#1a73e8] text-white' : 'bg-white text-neutral-700'}`} onClick={() => setDistanceUnit('mi')}>mi</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Add city/area</label>
                    <input
                      value={cityQuery}
                      onChange={(e) => setCityQuery(e.target.value)}
                      placeholder="Start typing a city or area"
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#1a73e8]/30 focus:border-[#1a73e8]"
                    />
                    <div className="mt-1 text-xs text-gray-500">Type address to add more locations</div>
                    {citySuggestions.length > 0 && (
                      <div className="mt-2 rounded-md border border-gray-200 bg-white shadow-sm">
                        <ul className="max-h-48 overflow-auto py-1">
                          {citySuggestions.map((sug, idx) => (
                            <li key={`${sug.lat}-${sug.lon}-${idx}`}>
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                onClick={() => {
                                  const name = sug.display_name.split(',')[0]?.trim() || sug.display_name;
                                  const newCity = { name, displayName: sug.display_name, lat: parseFloat(sug.lat), lon: parseFloat(sug.lon), radiusKm: 25 };
                                  setCities((prev) => {
                                    const exists = prev.some(c => Math.abs(c.lat - newCity.lat) < 0.0001 && Math.abs(c.lon - newCity.lon) < 0.0001);
                                    return exists ? prev : [...prev, newCity];
                                  });
                                  setCityQuery("");
                                  setCitySuggestions([]);
                                }}
                              >
                                {sug.display_name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {cities.length > 0 && (
                  <div className="mt-4 grid gap-3">
                    {cities.map((c, i) => (
                      <div key={`${c.lat}-${c.lon}-${i}`} className="rounded-md border border-gray-200 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{c.name}</div>
                            <div className="text-xs text-gray-600 truncate max-w-[70ch]">{c.displayName}</div>
                          </div>
                          <button
                            type="button"
                            className="text-xs text-red-600 hover:underline"
                            onClick={() => setCities(prev => prev.filter((_, idx) => idx !== i))}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <label className="block text-sm font-medium">Service radius</label>
                            <div className="flex items-center gap-2 text-xs text-neutral-700">
                              <span className="whitespace-nowrap">{toDisplayDistance(c.radiusKm)}{distanceUnit}</span>
                              <input
                                type="number"
                                inputMode="numeric"
                                min={distanceUnit === 'km' ? 1 : 1}
                                max={distanceUnit === 'km' ? 200 : 125}
                                step={distanceUnit === 'km' ? 1 : 1}
                                value={toDisplayDistance(c.radiusKm)}
                                onChange={(e) => {
                                  const raw = Number(e.target.value || 0);
                                  const clamped = Math.max(1, Math.min(raw, distanceUnit === 'km' ? 200 : 125));
                                  const km = fromDisplayDistance(clamped);
                                  setCities(prev => prev.map((cc, idx) => idx === i ? { ...cc, radiusKm: km } : cc));
                                }}
                                className="w-20 rounded border border-gray-300 px-2 py-1"
                              />
                            </div>
                          </div>
                          <input
                            type="range"
                            min={distanceUnit === 'km' ? 1 : 1}
                            max={distanceUnit === 'km' ? 200 : 125}
                            step={distanceUnit === 'km' ? 1 : 1}
                            value={toDisplayDistance(c.radiusKm)}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const km = fromDisplayDistance(val);
                              setCities(prev => prev.map((cc, idx) => idx === i ? { ...cc, radiusKm: km } : cc));
                            }}
                            className="mt-2 w-full"
                          />
                        </div>
                        {/* Map preview removed as requested; radius control retained */}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex justify-between">
                  <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(6)}>Back</button>
                  <button
                    type="button"
                    className={classNames("inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]", !canGoStep8 ? "bg-[#93b7f1] cursor-not-allowed" : "bg-[#1a73e8] hover:opacity-95")}
                    disabled={!canGoStep8}
                    onClick={() => setStep(8)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </details>

          {/* Step 8: Finish */}
          <details
            open={step === 8}
            className={classNames("relative rounded-xl border", step >= 8 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70")}
            onToggle={(e) => {
              const el = e.currentTarget as HTMLDetailsElement;
              if (el.open && canGoStep8) setStep(8);
              if (!canGoStep8) el.open = false;
            }}
          >
            <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
              <div>
                <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                  <span>8. Finish</span>
                </div>
                {canGoStep8 && <div className="text-xs text-neutral-600 mt-0.5 truncate">You can change these later.</div>}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className="text-xs rounded-full px-2 py-0.5 bg-neutral-100 text-neutral-700">{step === 8 ? "In progress" : step > 8 ? "Completed" : "Locked"}</span>
                <svg className="chevron h-4 w-4 text-neutral-500 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
              </div>
            </summary>
            <div className="accordion border-t border-neutral-200">
              <div className="accordion-content p-4 sm:p-5 fade-slide">
                <div ref={actionsRef} className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">Review & save your onboarding info.</div>
                  <button
                    className={classNames(
                      "rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a73e8]",
                      !canGoStep8 ? "bg-[#93b7f1] cursor-not-allowed" : "bg-[#1a73e8] hover:opacity-95"
                    )}
                    disabled={!canGoStep8}
                    onClick={() => {
                      const payload = {
                        siteType,
                        category,
                        name,
                        hasCurrent,
                        currentUrl: hasCurrent === "yes" ? currentUrl : "",
                        description: manualDesc,
                        autoSummary: summary,
                        siteAdded,
                        skipped,
                        businessPhone,
                        businessEmail,
                        contactMethod,
                        primaryColors,
                        social: { x: socialX, linkedIn: socialLinkedIn, instagram: socialInstagram, facebook: socialFacebook },
                        services: selectedServices,
                        serviceAreas: cities,
                        typeSpecific: { type: siteType, data: typeSpecific },
                      };
                      alert(`Saved!\n${JSON.stringify(payload, null, 2)}`);
                    }}
                  >
                    Save and continue
                  </button>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

// Minimal vertical progress sidebar to mirror get-started
function ProgressSidebar({ current, done }: { current: number; done: { s1: boolean; s2: boolean; s3: boolean; s4: boolean; s5: boolean; s6: boolean; s7: boolean } }) {
  const steps = [
    { id: 1, label: "Type", completed: done.s1 },
    { id: 2, label: "Category", completed: done.s2 },
    { id: 3, label: "Name", completed: done.s3 },
    { id: 4, label: "Website details", completed: done.s4 },
    { id: 5, label: "Business & Contact", completed: done.s5 },
    { id: 6, label: "Services", completed: done.s6 },
    { id: 7, label: "Service areas", completed: done.s7 },
    { id: 8, label: "Finish", completed: false },
  ];
  const total = steps.length;
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-neutral-200 rounded" aria-hidden />
      {/* Progress */}
      <div
        className="absolute left-2 w-[2px] bg-[#1a73e8] rounded transition-all"
        style={{ top: 0, height: `${((Math.max(1, current) - 1) / (Math.max(1, total - 1))) * 100}%` }}
        aria-hidden
      />
      <ol className="space-y-6">
        {steps.map((s) => {
          const active = s.id === current;
          const completed = s.completed || s.id < current;
          return (
            <li key={s.id} className="flex items-start gap-3">
              <span
                className={classNames(
                  "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
                  completed ? "bg-[#1a73e8] border-[#1a73e8] text-white" : active ? "border-[#1a73e8] text-[#1a73e8]" : "border-neutral-300 text-neutral-500"
                )}
                aria-hidden
              >
                {completed ? "✓" : s.id}
              </span>
              <div>
                <div className={classNames("text-sm", completed ? "text-neutral-700" : active ? "text-neutral-900 font-medium" : "text-neutral-600")}>{s.label}</div>
                <div className="text-xs text-neutral-500">Step {s.id} of {total}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
