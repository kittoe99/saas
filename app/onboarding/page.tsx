"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/app/components/Loader";

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

// Suggested pages per site type and category
const BASE_PAGES: Partial<Record<SiteType, string[]>> = {
  Ecommerce: ["Home", "Shop", "Product", "Cart", "Checkout", "Returns", "Contact", "FAQ"],
  SaaS: ["Home", "Features", "Pricing", "Docs", "Changelog", "Blog", "Contact"],
  Agency: ["Home", "Services", "Work", "About", "Testimonials", "Contact", "Careers"],
  "Small business": ["Home", "Services", "Pricing", "About", "Booking", "FAQ", "Contact"],
  Portfolio: ["Home", "Work", "Case studies", "About", "Blog", "Contact"],
  Blog: ["Home", "Categories", "About", "Newsletter", "Contact"],
  Nonprofit: ["Home", "Mission", "Programs", "Donate", "Volunteer", "Events", "Contact"],
  Community: ["Home", "Forums", "Events", "Members", "Rules", "Contact"],
  "Personal brand": ["Home", "About", "Speaking", "Coaching", "Newsletter", "Contact"],
  "Hobby site": ["Home", "Articles", "Guides", "Gallery", "About", "Contact"],
};

const CATEGORY_PAGES: Record<string, string[]> = {
  Restaurants: ["Home", "Menu", "Reservations", "Order online", "Catering", "About", "Contact"],
  Transportation: ["Home", "Services", "Fleet", "Get a quote", "FAQ", "Contact"],
  "Home Services": ["Home", "Services", "Pricing", "Booking", "Service areas", "Testimonials", "Contact"],
  Retail: ["Home", "Shop", "Locations", "Repairs", "Returns", "Contact"],
  "Health & Wellness": ["Home", "Treatments", "Practitioners", "Book appointment", "Insurance", "Contact"],
  "Professional Services": ["Home", "Services", "Case studies", "Pricing", "Blog", "Contact"],
  Design: ["Home", "Work", "Services", "About", "Contact"],
  Development: ["Home", "Services", "Projects", "Blog", "Contact"],
  Photography: ["Home", "Portfolio", "Packages", "Booking", "Contact"],
  Tech: ["Home", "Reviews", "Guides", "Blog", "Contact"],
  Education: ["Home", "Programs", "Admissions", "Events", "Contact"],
  Apparel: ["Home", "Shop", "Lookbook", "Sizing", "Returns", "Contact"],
  Electronics: ["Home", "Repairs", "Pricing", "Book service", "FAQ", "Contact"],
};

function pagesFor(siteType: SiteType | null, category: string): string[] {
  const cat = CATEGORY_PAGES[category] || [];
  if (cat.length) return cat;
  const base = siteType ? (BASE_PAGES[siteType] || []) : [];
  return base.length ? base : [
    "Home", "About", "Services", "Pricing", "Portfolio", "Blog", "Contact", "FAQ", "Testimonials"
  ];
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

// Short helper descriptions per site type
const TYPE_HINTS: Partial<Record<SiteType, string>> = {
  "Small business": "Typical deliverables: Services, Pricing, Contact, Booking, FAQs.",
  SaaS: "Typical deliverables: Landing, Features, Pricing, Docs, Auth, Billing.",
  Ecommerce: "Typical deliverables: Catalog, PDP, Cart, Checkout, Returns, Analytics.",
  Agency: "Typical deliverables: Portfolio, Services, Inquiry Form, Booking, Testimonials.",
  Portfolio: "Typical deliverables: Work, About, Contact, Case studies.",
  Blog: "Typical deliverables: Categories, Search, Newsletter, About.",
  Nonprofit: "Typical deliverables: Mission, Programs, Donate, Volunteer, Events.",
  Community: "Typical deliverables: Forums/Channels, Events, Members, Rules.",
  "Personal brand": "Typical deliverables: About, Offers, Speaking, Newsletter, Contact.",
  "Hobby site": "Typical deliverables: Articles, Gallery, How‑tos, Community.",
};

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

// Minimal options
const PRIMARY_GOALS = ["Leads", "Sales", "Bookings", "Community", "Content"];

export default function OnboardingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [gateChecking, setGateChecking] = useState(true);
  const [showFromGetStarted, setShowFromGetStarted] = useState(false);
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
  // New fields across steps
  const [subcategory, setSubcategory] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState<string>("");
  const [tagline, setTagline] = useState("");
  const [preferredDomain, setPreferredDomain] = useState("");
  const [competitors, setCompetitors] = useState<string[]>(["", "", ""]);
  const [mustHavePages, setMustHavePages] = useState<string[]>([]);
  const [contentSources, setContentSources] = useState<string>("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [timeZone, setTimeZone] = useState<string>("");
  const [responseSla, setResponseSla] = useState<string>("");
  const [bookingTool, setBookingTool] = useState<string>("");
  const [businessHours, setBusinessHours] = useState<string>("");
  const [businessHoursMode, setBusinessHoursMode] = useState<"standard" | "24_7" | "appointment" | "custom">("standard");
  const [step6Phase, setStep6Phase] = useState<"services" | "hours">("services");
  const [voiceTone, setVoiceTone] = useState<string[]>([]);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [assetFiles, setAssetFiles] = useState<File[]>([]);
  const [serviceDetails, setServiceDetails] = useState<Record<string, { description?: string; price?: string; cta?: "Call" | "Form" | "Booking" | "None" }>>({});
  const [onSiteMode, setOnSiteMode] = useState<"onsite" | "online">("onsite");
  const [coverageType, setCoverageType] = useState<"single" | "multi" | "nationwide">("single");
  const [travelFeePolicy, setTravelFeePolicy] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [primaryLanguage, setPrimaryLanguage] = useState<string>("English");
  const [teamNotes, setTeamNotes] = useState("");
  const [noLogoYet, setNoLogoYet] = useState<boolean>(false);
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
  const [saving, setSaving] = useState(false);
  // New Step 7: Design & Content Vision
  const [impressions, setImpressions] = useState<string[]>([]);
  const [newImpression, setNewImpression] = useState("");
  const [envisionedPages, setEnvisionedPages] = useState<string[]>([]);
  const [newPageName, setNewPageName] = useState("");
  const [designStyles, setDesignStyles] = useState<string[]>([]);
  const [emotionalImpact, setEmotionalImpact] = useState<string[]>([]);
  // Back navigation confirm modal
  const [showBackConfirm, setShowBackConfirm] = useState(false);
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
  const [isCitySearching, setIsCitySearching] = useState(false);
  const [areasNotApplicable, setAreasNotApplicable] = useState<boolean>(false);
  // Step 5 analyzing UX
  const [step5Analyzing, setStep5Analyzing] = useState(false);
  const [step5Progress, setStep5Progress] = useState(0);
  const [step5Logs, setStep5Logs] = useState<string[]>([]);
  // Keep interval id to guarantee cleanup across re-renders and unmount
  const step5TimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  // Fallback timeout to guarantee completion in case intervals are throttled
  const step5TimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Step 4 analyzing UX (for searching)
  const [step4Progress, setStep4Progress] = useState(0);
  const [step4Logs, setStep4Logs] = useState<string[]>([]);
  const step4TimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const step4TimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step orchestration
  const [step, setStep] = useState(1);
  // Website context (onboarding is per-website)
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const step1Done = !!siteType;
  const step2Done = step1Done && category.trim().length > 0;
  const step3Done = name.trim().length >= 2;
  const step4Done = !!siteType && !!name.trim() && (hasCurrent === "no" || (hasCurrent === "yes" && (siteAdded || skipped)));
  const step5Done = (businessPhone.trim().length >= 7 || /\S+@\S+\.\S+/.test(businessEmail)) && !!contactMethod;
  const step6Done = selectedServices.length > 0;
  // New Step 7 completion: any meaningful vision input present
  const step7Done = (envisionedPages.length >= 3) || (designStyles.length >= 1) || (emotionalImpact.length >= 1);
  const step8Done = areasNotApplicable || cities.length > 0; // Service areas
  // Step 9 uploads are optional for all users
  const step9Done = true;
  const canGoStep2 = step1Done;
  const canGoStep3 = step2Done;
  const canGoStep4 = step3Done;
  const canGoStep5 = step4Done;
  const canGoStep6 = step5Done;
  const canGoStep7 = step6Done; // proceed to vision
  const canGoStep8 = step7Done; // proceed to areas
  const canGoStep9 = step8Done; // proceed to logo & assets
  // Allow finishing without Step 9 uploads; still enforce type-specific required fields if any
  const canFinish = isTypeSpecificValid(siteType, typeSpecific);

  // Read website_id from URL if provided
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const wid = sp.get("website_id");
      if (wid) setWebsiteId(wid);
    } catch {}
  }, []);

  // Prefill envisioned pages when entering Step 7 (do not overwrite user input)
  useEffect(() => {
    if (step === 7 && envisionedPages.length === 0) {
      const suggested = pagesFor(siteType, category).slice(0, 3);
      if (suggested.length) setEnvisionedPages(suggested);
    }
  }, [step, siteType, category]);

  // Gate: require auth and skip to success if onboarding already exists
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) {
          if (!cancelled) {
            try {
              const next = `${window.location.pathname}${window.location.search}`;
              router.replace(`/login?next=${encodeURIComponent(next)}`);
            } catch {
              router.replace("/login");
            }
          }
          return;
        }
        // If a website_id is provided, check onboarding for that website only
        if (websiteId) {
          try {
            const res = await fetch(`/api/onboarding?website_id=${websiteId}`, { cache: "no-store" });
            if (res.ok) {
              const j = await res.json().catch(() => null);
              if (!cancelled && j?.row) {
                router.replace(`/dashboard/onboarding/success?website_id=${websiteId}`);
                return;
              }
            }
          } catch {}
        }
      } finally {
        if (!cancelled) setGateChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router, websiteId]);

  // Detect if user arrived from get-started success to show a soft prompt
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("from") === "get-started") {
        setShowFromGetStarted(true);
      }
    } catch {}
  }, []);

  // Finish handler (navigate after successful completion)
  async function handleFinish() {
    if (!canFinish || saving) return;
    setError(null);
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        setError("Please sign in to finish onboarding.");
        setSaving(false);
        try {
          const next = `${window.location.pathname}${window.location.search}`;
          router.push(`/login?next=${encodeURIComponent(next)}`);
        } catch {
          router.push("/login");
        }
        return;
      }

      // Build minimal payload of collected onboarding data
      const payload = {
        siteType,
        category,
        name,
        hasCurrent,
        currentUrl,
        businessPhone,
        businessEmail,
        selectedServices,
        serviceDetails,
        mustHavePages,
        cities,
        areasNotApplicable,
        primaryColors,
        impressions,
        envisionedPages,
        designStyles,
        emotionalImpact,
        contactMethod,
        social: { x: socialX, linkedin: socialLinkedIn, instagram: socialInstagram, facebook: socialFacebook },
        typeSpecific,
        subcategory,
        primaryGoal,
        tagline,
        preferredDomain,
        competitors,
        contentSources,
        businessAddress,
        timeZone,
        responseSla,
        bookingTool,
        businessHours,
        businessHoursMode,
        step6Phase,
        voiceTone,
        highContrast,
        onSiteMode,
        coverageType,
        travelFeePolicy,
        languages,
        primaryLanguage,
        teamNotes,
        // Step 8 file fields are optional and not uploaded here; store flags only
        hasLogo: !!logoFile,
        noLogoYet,
        assetCount: assetFiles.length,
        createdAt: new Date().toISOString(),
      };

      // Deep prune helper to remove empty/null values so we don't store noise
      const prune = (value: any): any => {
        if (value == null) return undefined;
        if (typeof value === "string") {
          const v = value.trim();
          return v.length === 0 ? undefined : v;
        }
        if (Array.isArray(value)) {
          const pruned = value
            .map((v) => prune(v))
            .filter((v) => v !== undefined);
          return pruned.length === 0 ? undefined : pruned;
        }
        if (typeof value === "object") {
          const out: any = {};
          for (const [k, v] of Object.entries(value)) {
            const pv = prune(v);
            if (pv !== undefined) out[k] = pv;
          }
          return Object.keys(out).length === 0 ? undefined : out;
        }
        return value;
      };

      const cleaned = prune(payload) ?? {};

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, website_id: websiteId || undefined, data: cleaned }),
      });
      if (!res.ok) {
        let msg = "Failed to save onboarding";
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const j = await res.json();
            msg = j?.error || msg;
          } else {
            const t = await res.text();
            msg = t || msg;
          }
        } catch {}
        console.error("/api/onboarding error:", msg);
        throw new Error(msg);
      }
      // Parse response to capture the definitive website_id to link the Build page
      let wrote: any = null;
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) wrote = await res.json();
      } catch {}
      const effectiveWebsiteId = (wrote?.website_id as string | undefined) || websiteId || undefined;

      // Initialize site_build_progress so Dashboard can show 'Continue' immediately
      try {
        if (effectiveWebsiteId) {
          const initSteps = { hero: 'pending', services: 'pending', areas: 'pending', global: 'pending', deploy: 'pending' } as const;
          await fetch('/api/sitebuild/steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, website_id: effectiveWebsiteId, steps: initSteps })
          });
        }
      } catch {}

      // Redirect to the Dashboard Site Builder page to continue with Site Build → Preview → Deployment
      const qp = new URLSearchParams();
      if (effectiveWebsiteId) qp.set("website_id", effectiveWebsiteId);
      router.push(`/dashboard/site-builder?${qp.toString()}`);
    } catch (e: any) {
      setError(e?.message || "Something went wrong while finishing onboarding.");
    } finally {
      setSaving(false);
    }
  }

  // Steps metadata for sidebar
  const steps = [
    { id: 1, label: "Site type", completed: step1Done },
    { id: 2, label: "Category", completed: step2Done },
    { id: 3, label: "Name", completed: step3Done },
    { id: 4, label: "Existing site", completed: step4Done },
    { id: 5, label: "Business & contact", completed: step5Done },
    { id: 6, label: "Services & details", completed: step6Done },
    { id: 7, label: "Design & content vision", completed: step7Done },
    { id: 8, label: "Service areas", completed: step8Done },
    { id: 9, label: "Logo & assets", completed: step9Done },
  ];

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

  // Back to home handlers (native confirm to keep UX simple and robust)
  function requestBack() {
    const ok = typeof window !== "undefined" ? window.confirm("Leave onboarding? Your progress won't be saved unless you finish. Go back home?") : true;
    if (ok) router.push("/dashboard");
  }
  function confirmBack() { router.push("/dashboard"); }
  function cancelBack() { /* no-op for native confirm */ }

  // Basic text sanitizer for LLM output: normalize bullets, quotes, spaces, and strip markdown markers
  function sanitizeText(input: string): string {
    if (!input) return "";
    let t = input
      .replace(/\u00A0/g, " ") // nbsp -> space
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[•·]/g, "- ")
      .replace(/^[*]\s+/gm, "- ")
      .replace(/[\t\r]+/g, " ")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .replace(/\s+\[\d+\]\s*/g, " ") // inline citations
      .replace(/\s{2,}/g, " ");
    return t.trim();
  }

  // Drive Step 4 analyzing progress while searching
  useEffect(() => {
    // clear any existing timers
    if (!searching) {
      if (step4TimerRef.current) { clearInterval(step4TimerRef.current as any); step4TimerRef.current = null; }
      if (step4TimeoutRef.current) { clearTimeout(step4TimeoutRef.current as any); step4TimeoutRef.current = null; }
      setStep4Progress((p) => (p < 100 ? 100 : p));
      return;
    }
    // starting a new search
    setStep4Progress(0);
    setStep4Logs([]);
    const messages = [
      "Searching website",
      "Crawling pages",
      "Extracting content",
      "Ranking relevance",
      "Summarizing findings",
    ];
    const tick = 350;
    let i = 0;
    const perMsgPct = Math.floor(100 / (messages.length + 1));
    const id = setInterval(() => {
      i += 1;
      // progress eases to 100 but may be force-completed by timeout below
      const p = Math.min(100, Math.round((i * tick) / (tick * 14) * 100));
      setStep4Progress(p);
      setStep4Logs((prev) => {
        if (p >= (prev.length + 1) * perMsgPct && prev.length < messages.length) {
          return [...prev, messages[prev.length]];
        }
        return prev;
      });
      if (p >= 100) {
        clearInterval(id);
        step4TimerRef.current = null;
        if (step4TimeoutRef.current) { clearTimeout(step4TimeoutRef.current as any); step4TimeoutRef.current = null; }
      }
    }, tick);
    step4TimerRef.current = id as any;
    // Safety timeout in case of throttling
    step4TimeoutRef.current = setTimeout(() => {
      if (step4TimerRef.current) { clearInterval(step4TimerRef.current as any); step4TimerRef.current = null; }
      step4TimeoutRef.current = null;
      setStep4Progress(100);
    }, 8000);
    return () => {
      if (step4TimerRef.current) { clearInterval(step4TimerRef.current as any); step4TimerRef.current = null; }
      if (step4TimeoutRef.current) { clearTimeout(step4TimeoutRef.current as any); step4TimeoutRef.current = null; }
    };
  }, [searching]);

  // Manual city suggestions search (only on user action)
  async function runCitySearch() {
    const q = cityQuery.trim();
    if (!q) { setCitySuggestions([]); return; }
    const ctrl = new AbortController();
    try {
      setIsCitySearching(true);
      const params = new URLSearchParams({ q, format: "json", addressdetails: "1", limit: "6" });
      const cc = countryCode.trim().toLowerCase();
      if (cc) params.set("countrycodes", cc);
      const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
      const res = await fetch(url, { signal: ctrl.signal, headers: { "Accept-Language": "en" } });
      if (!res.ok) throw new Error("Address lookup failed");
      const data = await res.json();
      setCitySuggestions(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (e) {
      setCitySuggestions([]);
    } finally {
      setIsCitySearching(false);
      ctrl.abort();
    }
  }

  // Helpers for unit conversion (store internally in km)
  const toDisplayDistance = (km: number) => distanceUnit === "km" ? km : Math.round(km * 0.621371);
  const fromDisplayDistance = (val: number) => distanceUnit === "km" ? val : Math.round(val / 0.621371);

  // Simulated real-time analysis for Step 5 (Business & Contact)
  function startStep5Analysis() {
    if (step5Analyzing) return;
    console.debug("[Step5] start analysis");
    setStep5Analyzing(true);
    setStep5Progress(0);
    setStep5Logs([]);
    // clear any stale timer just in case
    if (step5TimerRef.current) {
      clearInterval(step5TimerRef.current as any);
      step5TimerRef.current = null;
    }
    if (step5TimeoutRef.current) {
      clearTimeout(step5TimeoutRef.current as any);
      step5TimeoutRef.current = null;
    }
    const messages = [
      "Validating contact details",
      "Checking preferred contact method",
      "Reviewing brand colors",
      "Collecting social links",
      "Preparing next step"
    ];
    let i = 0;
    const total = 100;
    const tick = 350; // ms per tick
    const perMsg = Math.floor(total / (messages.length + 1));
    const id = setInterval(() => {
      i += 1;
      const p = Math.min(100, Math.round((i * tick) / (tick * 12) * 100));
      setStep5Progress(p);
      setStep5Logs((prev) => {
        if (p >= (prev.length + 1) * perMsg && prev.length < messages.length) {
          const nextMsg = messages[prev.length];
          console.debug("[Step5] log:", nextMsg, "p=", p);
          return [...prev, nextMsg];
        }
        return prev;
      });
      if (p >= 100) {
        console.debug("[Step5] complete -> advance to step 6");
        clearInterval(id);
        step5TimerRef.current = null;
        if (step5TimeoutRef.current) {
          clearTimeout(step5TimeoutRef.current as any);
          step5TimeoutRef.current = null;
        }
        setStep5Analyzing(false);
        // small delay so UI reflects completion before advancing
        setTimeout(() => setStep(6), 100);
      }
    }, tick);
    step5TimerRef.current = id as any;

    // Safety: force-complete after ~6 seconds in case tab throttling stalls the interval
    step5TimeoutRef.current = setTimeout(() => {
      console.debug("[Step5] timeout fallback -> force completion");
      if (step5TimerRef.current) {
        clearInterval(step5TimerRef.current as any);
        step5TimerRef.current = null;
      }
      step5TimeoutRef.current = null;
      setStep5Progress(100);
      setStep5Analyzing(false);
      setStep(6);
    }, 6000);
  }

  // Ensure interval is cleared if user navigates away or component unmounts
  useEffect(() => {
    if (step !== 5 && step5TimerRef.current) {
      clearInterval(step5TimerRef.current as any);
      step5TimerRef.current = null;
      setStep5Analyzing(false);
      console.debug("[Step5] cleaned up timer due to step change");
    }
    if (step !== 5 && step5TimeoutRef.current) {
      clearTimeout(step5TimeoutRef.current as any);
      step5TimeoutRef.current = null;
    }
    return () => {
      if (step5TimerRef.current) {
        clearInterval(step5TimerRef.current as any);
        step5TimerRef.current = null;
        console.debug("[Step5] cleanup on unmount");
      }
      if (step5TimeoutRef.current) {
        clearTimeout(step5TimeoutRef.current as any);
        step5TimeoutRef.current = null;
      }
    };
  }, [step]);

  // Guard: if progress hits 100% while still on Step 5, ensure we advance
  useEffect(() => {
    if (step === 5 && step5Analyzing && step5Progress >= 100) {
      setStep(6);
    }
  }, [step5Progress, step, step5Analyzing]);

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
              if (Array.isArray(info?.results)) {
                const limited = info.results.slice(0, 4);
                setSearchedPreview(limited);
                // Prefer to show how many we're showing
                setSearchedCount(limited.length);
              } else if (typeof info?.count === 'number') {
                setSearchedCount(Math.min(4, info.count));
              }
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
            const partial = sanitizeText(
              buffered
                .replace(/\s*\[[0-9]+\]\s*$/g, "") // trim dangling citation at end of the stream
                .trim()
            );
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
      let narrative = sanitizeText(buffered.trim());
      const refIdx = narrative.toLowerCase().indexOf("\nreferences");
      if (refIdx > -1) narrative = narrative.slice(0, refIdx).trim();
      // If output contains bullets, preserve bullet structure
      const rawLines = narrative.split(/\r?\n/);
      const bulletRegex = /^[-•\*]\s+/;
      const bulletLines = rawLines
        .map((l) => l.trim())
        .filter((l) => bulletRegex.test(l))
        .map((l) => sanitizeText(l.replace(/^[-•\*]\s+/, "").replace(/\s*\[\d+\]\s*$/g, "").trim()))
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
        narrative = sanitizeText(narrative.replace(/\s*\[\d+\]/g, "")).replace(/\s+/g, " ").trim();
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
      <div className="mt-1 text-sm text-gray-700 min-w-0">
        <span className="whitespace-pre-wrap break-all sm:break-words">{display}</span>
        <span className="inline-block w-0.5 h-4 align-middle ml-0.5 bg-success-accent animate-pulse" />
      </div>
    );
  }

  // Styled renderer for summary text: pretty bullets with bold labels and citation stripping
  function RenderSummary({ text }: { text: string }) {
    if (!text) return null;
    const cleaned = text.replace(/\s*\[\d+\]\s*/g, " ");
    const lines = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const bulletLines = lines.filter((l) => /^[-•\*]\s+/.test(l));
    if (bulletLines.length > 0) {
      const items = bulletLines.map((l) => l.replace(/^[−•\*]\s+/, "").trim());
      return (
        <ul className="mt-2 space-y-2 min-w-0 max-w-prose pr-2">
          {items.map((t, i) => {
            const idx = t.indexOf(":");
            const hasLabel = idx > 0 && idx < 40;
            const label = hasLabel ? t.slice(0, idx) : "";
            const rest = hasLabel ? t.slice(idx + 1).trim() : t;
            return (
              <li key={i} className="flex items-start gap-1.5 min-w-0">
                <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-success-accent" />
                <div className="flex-1 min-w-0 text-sm text-neutral-800 break-all sm:break-words">
                  {hasLabel ? (
                    <>
                      <span className="font-semibold">{label}:</span> {rest}
                    </>
                  ) : (
                    <span>{rest}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      );
    }
    return <Typewriter text={cleaned} />;
  }

  // Full onboarding UI
  return (
    <div className="relative mx-auto max-w-6xl px-6 py-8 sm:py-10" aria-busy={gateChecking}>
      {gateChecking && (
        <Loader fullScreen message="Checking access..." />
      )}
      {showFromGetStarted && !gateChecking && (
        <div className="mb-4 rounded-md border border-success-bg/60 bg-success-bg/20 p-3 text-sm text-neutral-900 flex items-start justify-between gap-3" role="status" aria-live="polite">
          <div className="flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-5 w-5 text-success-ink">
              <path fillRule="evenodd" d="M2.25 12a9.75 9.75 0 1 1 19.5 0 9.75 9.75 0 0 1-19.5 0Zm9-4.5a.75.75 0 0 1 .75.75v3.75H15a.75.75 0 0 1 0 1.5h-3.75V18a.75.75 0 0 1-1.5 0v-3.75H6a.75.75 0 0 1 0-1.5h3.75V8.25a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-medium">Great, your account is set! Let’s start onboarding.</div>
              <div className="text-neutral-700">Begin with step 1 below. You can pause anytime and continue in the mobile app.</div>
            </div>
          </div>
          <button onClick={() => setShowFromGetStarted(false)} className="shrink-0 rounded-md border border-transparent px-2 py-1 text-neutral-700 hover:bg-neutral-100" aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Onboarding</h1>
          <p className="mt-1 text-sm text-gray-600">Follow the steps below to tell us about your site.</p>
        </div>
        <button
          type="button"
          onClick={requestBack}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent/50"
          aria-label="Back to home"
          title="Back to home"
        >
          ← Back to home
        </button>
      </div>

      <div className="mt-8 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block md:col-span-4 md:sticky md:top-6">
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-neutral-200 rounded" aria-hidden />
            <div
              className="absolute left-2 w-[2px] bg-success-accent rounded transition-all"
              style={{ top: 0, height: `${((Math.max(1, step) - 1) / (Math.max(1, steps.length - 1))) * 100}%` }}
              aria-hidden
            />
            <ol className="space-y-6">
              {steps.map((s) => {
                const active = s.id === step;
                const completed = s.completed || s.id < step;
                return (
                  <li key={s.id} className="flex items-start gap-3">
                    <span
                      className={classNames(
                        "mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px]",
                        completed ? "bg-success-accent border-success text-white" : active ? "border-success text-success-ink" : "border-neutral-300 text-neutral-500"
                      )}
                      aria-hidden
                    >
                      {completed ? "" : s.id}
                    </span>
                    <div>
                      <div className={classNames("text-sm", completed ? "text-neutral-700" : active ? "text-neutral-900 font-medium" : "text-neutral-600")}>{s.label}</div>
                      <div className="text-xs text-neutral-500">Step {s.id} of {steps.length}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* Main content */}
        <main className="col-span-12 md:col-span-8">
          <div className="space-y-4">
            {/* Step 1: Site type */}
            <details
              open={step === 1}
              className={classNames(
                "relative rounded-xl border shadow-soft shadow-hover",
                step > 1 ? "bg-success-bg border-success" : "bg-white border-neutral-200"
              )}
              onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; if (el.open) setStep(1); }}
            >
              {step > 1 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />}
              <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                    {step > 1 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>}
                    <span>1. Type of site</span>
                  </div>
                  {step > 1 && <div className="text-xs text-neutral-600 mt-0.5 truncate">{siteType}</div>}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 1 ? "bg-success-bg text-success-ink" : "bg-neutral-100 text-neutral-700")}>{step > 1 ? "Completed" : step === 1 ? "In progress" : "Locked"}</span>
                </div>
              </summary>
              <div className="border-t border-neutral-200">
                <div className="p-4 sm:p-5">
                  <label className="block text-sm font-medium">Type of site</label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SITE_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSiteType(t)}
                        className={classNames(
                          "rounded-md border px-3 py-2 text-sm text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent shadow-soft shadow-hover",
                          siteType === t ? "border-success ring-2 ring-success bg-success-accent/20 text-success-ink hover:bg-success-accent/25" : "border-gray-300 hover:bg-neutral-50"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  {siteType && (
                    <div className="mt-2 text-xs text-gray-600">
                      <div>Selected: {siteType}</div>
                      {TYPE_HINTS[siteType] && (
                        <div className="mt-1 text-[11px] text-gray-500">{TYPE_HINTS[siteType] as string}</div>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className={classNames(
                        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent",
                        !canGoStep2 ? "bg-neutral-300 cursor-not-allowed" : "bg-success-accent hover:opacity-90"
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

            {/* Step 2: Category */}
            <details
              open={step === 2}
              className={classNames(
                "relative rounded-xl border shadow-soft shadow-hover",
                step > 2 ? "bg-success-bg border-success" : step >= 2 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
              )}
              onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; if (el.open && canGoStep2) setStep(2); if (!canGoStep2) el.open = false; }}
            >
              {step > 2 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />}
              <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                    {step > 2 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>}
                    <span>2. Category / Industry</span>
                  </div>
                  {step > 2 && <div className="text-xs text-neutral-600 mt-0.5 truncate">{category}</div>}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 2 ? "bg-success-bg text-success-ink" : "bg-neutral-100 text-neutral-700")}>{step > 2 ? "Completed" : step === 2 ? "In progress" : "Locked"}</span>
                </div>
              </summary>
              <div className="border-t border-neutral-200">
                <div className="p-4 sm:p-5">
                  <label className="block text-sm font-medium">Select a category / industry</label>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {categoriesFor(siteType).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={classNames(
                          "w-full text-left rounded-lg border px-3 py-2 text-sm shadow-soft shadow-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent",
                          category === c ? "border-success bg-success-accent/15 text-success-ink ring-1 ring-success" : "border-neutral-200 bg-white text-neutral-800 hover:border-success hover:bg-success-accent/10"
                        )}
                        aria-pressed={category === c}
                        aria-selected={category === c}
                      >
                        <div className="flex items-center">
                          <span className="truncate">{c}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 max-w-sm">
                    <label className="block text-sm font-medium">Primary goal (optional)</label>
                    <select value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success">
                      <option value="">Select…</option>
                      {PRIMARY_GOALS.map((g) => (<option key={g} value={g}>{g}</option>))}
                    </select>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(1)}>Back</button>
                    <button
                      type="button"
                      className={classNames(
                        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent",
                        !canGoStep3 ? "bg-neutral-300 cursor-not-allowed" : "bg-success-accent hover:opacity-90"
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

            {/* Step 3: Name */}
            <details
              open={step === 3}
              className={classNames(
                "relative rounded-xl border shadow-soft shadow-hover",
                step > 3 ? "bg-success-bg border-success" : step >= 3 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
              )}
              onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; if (el.open && canGoStep3) setStep(3); if (!canGoStep3) el.open = false; }}
            >
              {step > 3 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />}
              <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                    {step > 3 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>}
                    <span>3. Your site name</span>
                  </div>
                  {step > 3 && <div className="text-xs text-neutral-600 mt-0.5 truncate">{name}</div>}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 3 ? "bg-success-bg text-success-ink" : "bg-neutral-100 text-neutral-700")}>{step > 3 ? "Completed" : step === 3 ? "In progress" : "Locked"}</span>
                </div>
              </summary>
              <div className="border-t border-neutral-200">
                <div className="p-4 sm:p-5">
                  <div className="max-w-md">
                    <label className="block text-sm font-medium">Business or site name</label>
                    <input
                      ref={nameInputRef as any}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      placeholder="e.g. Acme Moving Co."
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success"
                    />
                    <div className="mt-2 text-xs text-neutral-600">Min 2 characters.</div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(2)}>Back</button>
                    <button
                      type="button"
                      className={classNames(
                        "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent",
                        !canGoStep4 ? "bg-neutral-300 cursor-not-allowed" : "bg-success-accent hover:opacity-90"
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

            {/* Step 4: Existing site */}
            <details
              open={step === 4}
              className={classNames(
                "relative rounded-xl border shadow-soft shadow-hover",
                step > 4 ? "bg-success-bg border-success" : step >= 4 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
              )}
              onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; if (el.open && canGoStep4) setStep(4); if (!canGoStep4) el.open = false; }}
            >
              {step > 4 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />}
              <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                    {step > 4 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>}
                    <span>4. Website details</span>
                  </div>
                  {step > 4 && (
                    <div className="text-xs text-neutral-600 mt-0.5 truncate">
                      {hasCurrent === "yes" ? (currentUrl || "Existing site provided") : hasCurrent === "no" ? "No current site" : ""}
                    </div>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 4 ? "bg-success-bg text-success-ink" : "bg-neutral-100 text-neutral-700")}>{step > 4 ? "Completed" : step === 4 ? "In progress" : "Locked"}</span>
                </div>
              </summary>
              <div className="border-t border-neutral-200">
                <div className="p-4 sm:p-5">
                  <label className="block text-sm font-medium">Do you have a current website?</label>
                  <div className="mt-2 flex gap-2">
                    {(["yes","no"] as const).map((v) => (
                      <button key={v} type="button" onClick={() => setHasCurrent(v)} className={classNames("rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent shadow-soft shadow-hover", hasCurrent === v ? "border-success ring-2 ring-success bg-success-accent/20 text-success-ink hover:bg-success-accent/25" : "border-gray-300 hover:bg-neutral-50")}>{v.toUpperCase()}</button>
                    ))}
                  </div>

                  {hasCurrent === "yes" && (
                    <div className="mt-4 grid gap-3 max-w-xl">
                      <div>
                        <label className="block text-sm font-medium">Website URL or domain</label>
                        <input disabled={searching} value={currentUrl} onChange={(e) => setCurrentUrl(e.target.value)} placeholder="example.com or https://example.com" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success disabled:opacity-60" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" className={classNames("rounded-md px-3 py-1.5 text-sm text-white", currentUrl ? "bg-success-accent hover:opacity-90" : "bg-neutral-300 cursor-not-allowed")} disabled={!currentUrl || searching} onClick={() => summarizeUrl()}>
                          {searching ? "Analyzing…" : "Analyze site"}
                        </button>
                        <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => { setSkipped(true); setSiteAdded(false); setSummary(null); setError(null); }}>Skip</button>
                      </div>

                      {searching && (
                        <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-3 sm:p-4 shadow-soft">
                          <div className="text-sm font-medium text-neutral-800">Analyzing your website…</div>
                          <div className="mt-2 h-2 w-full rounded bg-neutral-100">
                            <div className="h-2 rounded bg-success-accent transition-all" style={{ width: `${step4Progress}%` }} />
                          </div>
                          <ul className="mt-3 max-h-40 overflow-y-auto pr-1 space-y-1 text-xs text-neutral-700">
                            {step4Logs.map((l, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-accent" />
                                {l}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
                      {notFound && <div className="mt-2 text-sm text-neutral-600">No info found. You can skip or add details manually.</div>}

                      {!searching && (searchedCount !== null || searchedPreview.length > 0) && (
                        <div className="mt-4 flex items-center justify-between">
                          <div className="inline-flex items-center gap-2 text-xs">
                            <span className="rounded-full bg-success-bg text-success-ink px-2 py-0.5">{searchedCount ?? searchedPreview.length} results shown</span>
                          </div>
                          <button type="button" className="text-xs text-neutral-700 hover:underline" onClick={() => setShowSources((v) => !v)}>
                            {showSources ? "Hide sources" : "Show sources"}
                          </button>
                        </div>
                      )}

                      {!searching && showSources && searchedPreview.length > 0 && (
                        <div className="mt-2 rounded-lg border border-neutral-200 bg-white shadow-soft">
                          <ul className="divide-y divide-neutral-100">
                            {searchedPreview.slice(0, 4).map((r) => (
                              <li key={r.index} className="p-3">
                                <div className="text-[13px] font-medium text-neutral-800 truncate">{sanitizeText(r.title || r.url)}</div>
                                <div className="text-[11px] text-neutral-500 truncate">{r.url}</div>
                                {r.snippet && <div className="mt-1 text-[12px] text-neutral-700 line-clamp-2">{sanitizeText(r.snippet)}</div>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {summary?.summary && !searching && (
                        <div className="mt-3 rounded-lg border border-neutral-200 bg-gray-50 p-3 sm:p-4 pr-2 shadow-soft">
                          <div className="text-sm font-medium text-neutral-800">Summary</div>
                          <RenderSummary text={summary.summary} />
                        </div>
                      )}
                    </div>
                  )}

                  {hasCurrent === "no" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium">Brief description (optional)</label>
                      <textarea value={manualDesc} onChange={(e) => setManualDesc(e.target.value)} placeholder="What will your new site be about?" className="mt-1 w-full max-w-xl rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success" rows={4} />
                    </div>
                  )}

                  <div className="mt-4 flex justify-between">
                    <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(3)}>Back</button>
                    <button
                      type="button"
                      className={classNames("inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent", !canGoStep5 ? "bg-neutral-300 cursor-not-allowed" : "bg-success-accent hover:opacity-90")}
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
                "relative rounded-xl border shadow-soft shadow-hover",
                step > 5 ? "bg-success-bg border-success" : step >= 5 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
              )}
              onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; if (el.open && canGoStep5) setStep(5); if (!canGoStep5) el.open = false; }}
            >
              {step > 5 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />}
              <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                    {step > 5 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>}
                    <span>5. Business & Contact</span>
                  </div>
                  {step > 5 && (
                    <div className="text-xs text-neutral-600 mt-0.5 truncate">{[businessPhone || null, businessEmail || null].filter(Boolean).join(" • ") || "Contact preferences set"}</div>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 5 ? "bg-success-bg text-success-ink" : "bg-neutral-100 text-neutral-700")}>{step > 5 ? "Completed" : step === 5 ? "In progress" : "Locked"}</span>
                </div>
              </summary>
              <div className="border-t border-neutral-200">
                <div className="p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium">Business phone</label>
                      <input disabled={step5Analyzing} value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="(555) 123-4567" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success disabled:opacity-60" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Business email</label>
                      <input disabled={step5Analyzing} type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="hello@yourbusiness.com" className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success disabled:opacity-60" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium">Preferred contact method</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["email","phone","form","schedule"].map((m) => (
                        <button disabled={step5Analyzing} key={m} type="button" onClick={() => setContactMethod(m as any)} className={classNames("rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent disabled:opacity-60 shadow-soft shadow-hover", contactMethod === m ? "border-success ring-1 ring-success bg-success-bg" : "border-gray-300 hover:bg-neutral-50")}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium">Brand colors (select up to 2)</label>
                      <div className="mt-2">
                        {primaryColors.length > 0 ? (
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {primaryColors.map((c, i) => (
                              <div
                                key={`sel-${c}`}
                                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white pl-1 pr-2 py-1 shadow-sm"
                              >
                                <span
                                  aria-hidden
                                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium text-white shadow"
                                  style={{ backgroundColor: c }}
                                >
                                  {i === 0 ? "1" : "2"}
                                </span>
                                <span className="text-xs text-neutral-700">{i === 0 ? "Primary" : "Secondary"} · {c}</span>
                                <button
                                  type="button"
                                  className="ml-1 rounded p-1 text-[11px] text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                                  aria-label={`Remove ${i === 0 ? "Primary" : "Secondary"} color ${c}`}
                                  onClick={() => setPrimaryColors(primaryColors.filter((x) => x !== c))}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mb-2 text-xs text-gray-600">No color selected</div>
                        )}
                        <div className="grid grid-cols-8 gap-2">
                          {PRESET_COLORS.map((c) => {
                            const selected = primaryColors.includes(c);
                            const atLimit = !selected && primaryColors.length >= 2;
                            const idx = selected ? primaryColors.indexOf(c) + 1 : null;
                            return (
                              <button
                                key={c}
                                type="button"
                                aria-pressed={selected}
                                aria-label={`Select color ${c}`}
                                title={c}
                                onClick={() => {
                                  setPrimaryColors((prev) => {
                                    if (prev.includes(c)) return prev.filter((x) => x !== c);
                                    if (prev.length >= 2) return prev; // enforce max 2
                                    return [...prev, c];
                                  });
                                }}
                                className={classNames(
                                  "relative h-10 w-10 rounded-lg border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent shadow-soft",
                                  selected ? "ring-2 ring-success border-success" : "border-neutral-300",
                                  atLimit ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.03]",
                                  step5Analyzing ? "opacity-60 cursor-not-allowed" : ""
                                )}
                                style={{ backgroundColor: c }}
                                disabled={atLimit || step5Analyzing}
                              >
                                {selected && (
                                  <>
                                    <span className="absolute inset-0 flex items-center justify-center">
                                      <svg
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="2.2"
                                        className="h-5 w-5 drop-shadow"
                                        aria-hidden="true"
                                      >
                                        <path d="M6 10.5l2.5 2.5L14 8" />
                                      </svg>
                                    </span>
                                    <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white text-[11px]">
                                      {idx}
                                    </span>
                                  </>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-2 text-[11px] text-neutral-500">Tip: Choose one primary and one secondary brand color.</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Social links (optional)</label>
                      <div className="mt-1 grid gap-2">
                        <input disabled={step5Analyzing} value={socialX} onChange={(e) => setSocialX(e.target.value)} placeholder="X / Twitter URL" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success disabled:opacity-60" />
                        <input disabled={step5Analyzing} value={socialLinkedIn} onChange={(e) => setSocialLinkedIn(e.target.value)} placeholder="LinkedIn URL" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success disabled:opacity-60" />
                        <input disabled={step5Analyzing} value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="Instagram URL" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success disabled:opacity-60" />
                        <input disabled={step5Analyzing} value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="Facebook URL" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success disabled:opacity-60" />
                      </div>
                    </div>
                  </div>
                  {step5Analyzing && (
                    <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-3 sm:p-4 shadow-soft">
                      <div className="text-sm font-medium text-neutral-800">Analyzing your preferences…</div>
                      <div className="mt-2 h-2 w-full rounded bg-neutral-100">
                        <div className="h-2 rounded bg-success-accent transition-all" style={{ width: `${step5Progress}%` }} />
                      </div>
                      <ul className="mt-3 max-h-40 overflow-y-auto pr-1 space-y-1 text-xs text-neutral-700">
                        {step5Logs.map((l, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-accent" />
                            {l}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(4)}>Back</button>
                    <button
                      type="button"
                      className={classNames("inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent", (!canGoStep6 || step5Analyzing) ? "bg-neutral-300 cursor-not-allowed" : "bg-success-accent hover:opacity-90")}
                      disabled={!canGoStep6 || step5Analyzing}
                      onClick={() => startStep5Analysis()}
                    >
                      {step5Analyzing ? "Analyzing…" : "Continue"}
                    </button>
                  </div>
                </div>
              </div>
            </details>

            {/* Step 6: Services & details */}
            <details
              open={step === 6}
              className={classNames(
                "relative rounded-xl border shadow-soft shadow-hover",
                step > 6 ? "bg-success-bg border-success" : step >= 6 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
              )}
              onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; if (el.open && canGoStep6) setStep(6); if (!canGoStep6) el.open = false; }}
            >
              {step > 6 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />}
              <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                    {step > 6 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>}
                    <span>6. Services & details</span>
                  </div>
                  {step > 6 && <div className="text-xs text-neutral-600 mt-0.5 truncate">{selectedServices.join(", ")}</div>}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 6 ? "bg-success-bg text-success-ink" : "bg-neutral-100 text-neutral-700")}>{step > 6 ? "Completed" : step === 6 ? "In progress" : "Locked"}</span>
                </div>
              </summary>
              <div className="border-t border-neutral-200">
                <div className="p-4 sm:p-5">
                  <label className="block text-sm font-medium">Select services you offer</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {servicesFor(siteType, category).map((svc) => {
                      const selected = selectedServices.includes(svc);
                      return (
                        <button key={svc} type="button" onClick={() => setSelectedServices((prev) => selected ? prev.filter((s) => s !== svc) : [...prev, svc])} className={classNames("rounded-full border px-3 py-1.5 text-sm", selected ? "bg-success-accent/20 border-success text-success-ink" : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50")}>{svc}</button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex gap-2 max-w-md">
                    <input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const v = newService.trim();
                          if (!v) return;
                          setSelectedServices((prev) => {
                            const has = prev.some((s) => s.toLowerCase() === v.toLowerCase());
                            return has ? prev : [...prev, v];
                          });
                          setNewService("");
                        }
                      }}
                      placeholder="Add custom service"
                      className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success"
                    />
                    <button
                      type="button"
                      className={classNames("rounded-md px-3 py-2 text-sm text-white", newService.trim() ? "bg-success-accent hover:opacity-90" : "bg-neutral-300 cursor-not-allowed")}
                      disabled={!newService.trim()}
                      onClick={() => {
                        const v = newService.trim();
                        if (!v) return;
                        setSelectedServices((prev) => {
                          const has = prev.some((s) => s.toLowerCase() === v.toLowerCase());
                          return has ? prev : [...prev, v];
                        });
                        setNewService("");
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {selectedServices.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedServices.map((svc, i) => (
                        <div key={`${svc}-${i}`} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white pl-2 pr-2 py-1 shadow-sm">
                          <span className="text-xs text-neutral-800">{svc}</span>
                          <button
                            type="button"
                            className="ml-1 rounded p-1 text-[11px] text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                            aria-label={`Remove ${svc}`}
                            onClick={() => setSelectedServices((prev) => prev.filter((s) => s !== svc))}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(5)}>Back</button>
                    <button type="button" className={classNames("inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white", !canGoStep7 ? "bg-neutral-300 cursor-not-allowed" : "bg-success-accent hover:opacity-90")} disabled={!canGoStep7} onClick={() => setStep(7)}>Continue</button>
                  </div>
                </div>
              </div>
            </details>

            {/* Step 7: Design & content vision */}
            <details
              open={step === 7}
              className={classNames(
                "relative rounded-xl border shadow-soft shadow-hover",
                step > 7 ? "bg-success-bg border-success" : step >= 7 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
              )}
              onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; if (el.open && canGoStep7) setStep(7); if (!canGoStep7) el.open = false; }}
            >
              {step > 7 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />}
              <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                    {step > 7 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>}
                    <span>7. Design & content vision</span>
                  </div>
                  {step > 7 && (
                    <div className="text-xs text-neutral-600 mt-0.5 truncate">
                      {(() => {
                        const parts: string[] = [];
                        if (envisionedPages.length) parts.push(envisionedPages.slice(0, 3).join(", "));
                        if (designStyles.length) parts.push(designStyles.slice(0, 3).join(", "));
                        if (emotionalImpact.length) parts.push(emotionalImpact.slice(0, 3).join(", "));
                        return parts.join(" • ") || "Vision captured";
                      })()}
                    </div>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 7 ? "bg-success-bg text-success-ink" : "bg-neutral-100 text-neutral-700")}>{step > 7 ? "Completed" : step === 7 ? "In progress" : "Locked"}</span>
                </div>
              </summary>
              <div className="border-t border-neutral-200">
                <div className="p-4 sm:p-5">

                  {/* Envisioned pages */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium">Pages you imagine (add 3+)</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pagesFor(siteType, category).map((p) => {
                        const selected = envisionedPages.includes(p);
                        return (
                          <button key={p} type="button" onClick={() => setEnvisionedPages((prev) => selected ? prev.filter((x) => x !== p) : [...prev, p])} className={classNames("rounded-full border px-3 py-1.5 text-sm", selected ? "bg-success-accent/20 border-success text-success-ink" : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50")}>{p}</button>
                        );
                      })}
                    </div>
                    <div className="mt-2 flex gap-2 max-w-md">
                      <input
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const v = newPageName.trim();
                            if (!v) return;
                            setEnvisionedPages((prev) => prev.some((x) => x.toLowerCase() === v.toLowerCase()) ? prev : [...prev, v]);
                            setNewPageName("");
                          }
                        }}
                        placeholder="Add custom page (press Enter)"
                        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success"
                      />
                      <button
                        type="button"
                        className={classNames("rounded-md px-3 py-2 text-sm text-white", newPageName.trim() ? "bg-success-accent hover:opacity-90" : "bg-neutral-300 cursor-not-allowed")}
                        disabled={!newPageName.trim()}
                        onClick={() => {
                          const v = newPageName.trim();
                          if (!v) return;
                          setEnvisionedPages((prev) => prev.some((x) => x.toLowerCase() === v.toLowerCase()) ? prev : [...prev, v]);
                          setNewPageName("");
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <hr className="my-6 border-neutral-200" />

                  {/* Design styles */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium">Preferred design styles</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        "Modern","Minimal","Elegant","Bold","Playful","Corporate","Editorial","Techy","Warm","Artistic"
                      ].map((s) => {
                        const selected = designStyles.includes(s);
                        return (
                          <button key={s} type="button" onClick={() => setDesignStyles((prev) => selected ? prev.filter((x) => x !== s) : [...prev, s])} className={classNames("rounded-full border px-3 py-1.5 text-sm", selected ? "bg-success-accent/20 border-success text-success-ink" : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50")}>{s}</button>
                        );
                      })}
                    </div>
                  </div>

                  <hr className="my-6 border-neutral-200" />

                  {/* Emotional impact */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium">Desired emotional impact</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        "Trustworthy","Exciting","Calm","Friendly","Premium","Inspiring","Approachable","Confident","Joyful","Serious"
                      ].map((e) => {
                        const selected = emotionalImpact.includes(e);
                        return (
                          <button key={e} type="button" onClick={() => setEmotionalImpact((prev) => selected ? prev.filter((x) => x !== e) : [...prev, e])} className={classNames("rounded-full border px-3 py-1.5 text-sm", selected ? "bg-success-accent/20 border-success text-success-ink" : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50")}>{e}</button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(6)}>Back</button>
                    <button type="button" className={classNames("inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white", !canGoStep8 ? "bg-neutral-300 cursor-not-allowed" : "bg-success-accent hover:opacity-90")} disabled={!canGoStep8} onClick={() => setStep(8)}>Continue</button>
                  </div>
                </div>
              </div>
            </details>

            {/* Step 8: Service areas */}
            <details
              open={step === 8}
              className={classNames(
                "relative rounded-xl border shadow-soft shadow-hover",
                step > 8 ? "bg-success-bg border-success" : step >= 8 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
              )}
              onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; if (el.open && canGoStep8) setStep(8); if (!canGoStep8) el.open = false; }}
            >
              {step > 8 && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1 rounded-l-xl bg-success-accent" />}
              <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                    {step > 8 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>}
                    <span>8. Service areas</span>
                  </div>
                  {step > 8 && (
                    <div className="text-xs text-neutral-600 mt-0.5 truncate">
                      {areasNotApplicable ? "N/A" : (
                        <>
                          {cities.length} area{cities.length === 1 ? "" : "s"} • {distanceUnit.toUpperCase()}
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className={classNames("text-xs rounded-full px-2 py-0.5", step > 8 ? "bg-success-bg text-success-ink" : "bg-neutral-100 text-neutral-700")}>{step > 8 ? "Completed" : step === 8 ? "In progress" : "Locked"}</span>
                </div>
              </summary>
              <div className="border-t border-neutral-200">
                <div className="p-4 sm:p-5">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={areasNotApplicable} onChange={(e) => setAreasNotApplicable(e.target.checked)} />
                    <span>My business is online-only or service areas are not applicable</span>
                  </label>

                  {!areasNotApplicable && (
                    <>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                        <div className="min-w-[180px]">
                          <label className="block text-sm font-medium">Country (optional)</label>
                          <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success">
                            <option value="">All countries</option>
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium">City or area</label>
                          <div className="mt-1 flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-success-accent"
                              placeholder="Start typing a city..."
                              value={cityQuery}
                              onChange={(e) => setCityQuery(e.target.value)}
                            />
                            <button type="button" className="rounded-md px-3 py-2 text-sm font-medium bg-success-accent text-white hover:opacity-90 w-full sm:w-auto" onClick={() => runCitySearch()} disabled={isCitySearching}>
                              {isCitySearching ? "Searching…" : "Search"}
                            </button>
                          </div>
                          {citySuggestions.length > 0 && (
                            <ul className="mt-2 max-h-40 overflow-y-auto rounded border border-neutral-200 bg-white text-sm shadow">
                              {citySuggestions.map((sug, i) => (
                                <li key={`${sug.display_name}-${i}`} className="flex items-center justify-between px-3 py-2 hover:bg-neutral-50">
                                  <span
                                    className="truncate pr-2 cursor-pointer text-neutral-800 hover:underline"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                      setCities([...cities, { name: sug.display_name, displayName: sug.display_name, lat: Number(sug.lat), lon: Number(sug.lon), radiusKm: 10 }]);
                                      setCitySuggestions([]);
                                      setCityQuery("");
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setCities([...cities, { name: sug.display_name, displayName: sug.display_name, lat: Number(sug.lat), lon: Number(sug.lon), radiusKm: 10 }]);
                                        setCitySuggestions([]);
                                        setCityQuery("");
                                      }
                                    }}
                                  >
                                    {sug.display_name}
                                  </span>
                                  <button
                                    type="button"
                                    className="text-xs text-success-ink hover:underline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCities([...cities, { name: sug.display_name, displayName: sug.display_name, lat: Number(sug.lat), lon: Number(sug.lon), radiusKm: 10 }]);
                                      setCitySuggestions([]);
                                      setCityQuery("");
                                    }}
                                  >
                                    Add
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium">Units</label>
                          <div className="mt-1 inline-flex rounded-md border border-neutral-300 p-0.5">
                            {(["km","mi"] as const).map((u) => (
                              <button
                                key={u}
                                type="button"
                                onClick={() => setDistanceUnit(u)}
                                className={classNames("px-2 py-1 text-sm rounded", distanceUnit === u ? "bg-success-accent text-white" : "text-neutral-700 hover:bg-neutral-100")}
                              >
                                {u.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {cities.length === 0 ? (
                        <div className="mt-4 rounded-lg border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-600 shadow-soft">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-success-bg text-success-ink">
                              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 4.97 6.06 12.39 6.32 12.68.37.41 1.01.41 1.38 0C12.94 21.39 19 13.97 19 9a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z"/></svg>
                            </span>
                            <div className="font-medium text-neutral-700">No service areas yet</div>
                          </div>
                          <div className="mt-1 text-xs">Search a city or address above and click Add to include it. Then adjust the radius.</div>
                        </div>
                      ) : (
                        <ul className="mt-4 space-y-3 text-sm overflow-x-hidden">
                          {cities.map((c, idx) => {
                            const geocoded = (c.lat !== 0 || c.lon !== 0);
                            return (
                              <li key={`${c.name}-${idx}`} className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3 shadow-soft shadow-hover transition-colors hover:bg-neutral-50 min-w-0 overflow-hidden">
                                <div className="flex items-start gap-3 flex-wrap">
                                  <div className="flex items-start gap-3 min-w-0 flex-1 order-1">
                                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-success-bg text-success-ink">
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M12 2a7 7 0 00-7 7c0 4.97 6.06 12.39 6.32 12.68.37.41 1.01.41 1.38 0C12.94 21.39 19 13.97 19 9a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z"/></svg>
                                    </span>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <div className="font-medium truncate">{c.displayName}</div>
                                        <span className={classNames("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border", geocoded ? "bg-success-bg text-success-ink border-success-border" : "bg-neutral-100 text-neutral-700 border-neutral-200")}>{geocoded ? "Geocoded" : "Not geocoded"}</span>
                                      </div>
                                      <div className="mt-0.5 text-[11px] text-neutral-500 truncate">
                                        {geocoded ? <>Lat {Number(c.lat).toFixed(4)}, Lon {Number(c.lon).toFixed(4)}</> : "Add via Search to enable radius"}
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="text-xs text-neutral-600 hover:text-neutral-800 hover:underline shrink-0 self-start order-2 sm:order-none sm:ml-auto"
                                    onClick={() => setCities(cities.filter((_, i) => i !== idx))}
                                    aria-label={`Remove ${c.displayName}`}
                                  >
                                    Remove
                                  </button>
                                </div>
                                {geocoded ? (
                                  <div className="mt-3 grid w-full min-w-0 grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 overflow-hidden">
                                    <label className="text-xs text-neutral-600 sm:col-span-2">Radius</label>
                                    <div className="flex items-center justify-between sm:hidden">
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          aria-label="Decrease radius"
                                          className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                                          onClick={() => {
                                            const cur = toDisplayDistance(c.radiusKm);
                                            const next = Math.max(1, cur - 1);
                                            setCities(cities.map((ci, i) => i === idx ? { ...ci, radiusKm: fromDisplayDistance(next) } : ci));
                                          }}
                                        >
                                          −
                                        </button>
                                        <span className="inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-xs text-neutral-700 whitespace-nowrap">
                                          {toDisplayDistance(c.radiusKm)} {distanceUnit}
                                        </span>
                                        <button
                                          type="button"
                                          aria-label="Increase radius"
                                          className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                                          onClick={() => {
                                            const cur = toDisplayDistance(c.radiusKm);
                                            const next = Math.min(100, cur + 1);
                                            setCities(cities.map((ci, i) => i === idx ? { ...ci, radiusKm: fromDisplayDistance(next) } : ci));
                                          }}
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                    <div className="min-w-0 w-full max-w-full sm:col-span-8 sm:self-center">
                                      <input
                                        type="range"
                                        min={1}
                                        max={100}
                                        value={toDisplayDistance(c.radiusKm)}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setCities(cities.map((ci, i) => i === idx ? { ...ci, radiusKm: fromDisplayDistance(val) } : ci));
                                        }}
                                        className="block w-full min-w-0 max-w-full"
                                      />
                                    </div>
                                    <div className="hidden sm:flex items-center justify-end gap-2 sm:col-span-2">
                                      <button
                                        type="button"
                                        aria-label="Decrease radius"
                                        className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                                        onClick={() => {
                                          const cur = toDisplayDistance(c.radiusKm);
                                          const next = Math.max(1, cur - 1);
                                          setCities(cities.map((ci, i) => i === idx ? { ...ci, radiusKm: fromDisplayDistance(next) } : ci));
                                        }}
                                      >
                                        −
                                      </button>
                                      <span className="inline-flex shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-xs text-neutral-700 whitespace-nowrap">
                                        {toDisplayDistance(c.radiusKm)} {distanceUnit}
                                      </span>
                                      <button
                                        type="button"
                                        aria-label="Increase radius"
                                        className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                                        onClick={() => {
                                          const cur = toDisplayDistance(c.radiusKm);
                                          const next = Math.min(100, cur + 1);
                                          setCities(cities.map((ci, i) => i === idx ? { ...ci, radiusKm: fromDisplayDistance(next) } : ci));
                                        }}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(7)}>Back</button>
                    <button type="button" className={classNames("inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white", !canGoStep9 ? "bg-neutral-300 cursor-not-allowed" : "bg-success-accent hover:opacity-90")} disabled={!canGoStep9} onClick={() => setStep(9)}>Continue</button>
                  </div>
                </div>
              </div>
            </details>

            {/* Step 9: Logo & assets */}
            <details
              open={step === 9}
              className={classNames(
                "relative rounded-xl border shadow-soft shadow-hover",
                step >= 9 ? "bg-white border-neutral-200" : "bg-white border-neutral-100 opacity-70"
              )}
              onToggle={(e) => { const el = e.currentTarget as HTMLDetailsElement; if (el.open && canGoStep9) setStep(9); if (!canGoStep9) el.open = false; }}
            >
              <summary className="flex items-center justify-between gap-3 cursor-pointer select-none px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-800 flex items-center gap-2">
                    {step > 9 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-accent text-white text-[11px]">✓</span>}
                    <span>9. Logo & assets</span>
                  </div>
                  {step > 9 && (
                    <div className="text-xs text-neutral-600 mt-0.5 truncate">{logoFile ? "Logo set" : "No logo"} • {assetFiles.length} asset{assetFiles.length === 1 ? "" : "s"}</div>
                  )}
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-xs rounded-full px-2 py-0.5 bg-neutral-100 text-neutral-700">Optional</span>
                </div>
              </summary>
              <div className="border-t border-neutral-200">
                <div className="p-4 sm:p-5">
                  {/* Logo uploader */}
                  <div>
                    <label className="block text-sm font-medium">Logo</label>
                    <label className="mt-2 inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={noLogoYet}
                        onChange={(e) => {
                          setNoLogoYet(e.target.checked);
                          if (e.target.checked) setLogoFile(null);
                        }}
                      />
                      <span>I don't have a logo yet</span>
                    </label>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        id="logo-file"
                        type="file"
                        accept="image/*"
                        disabled={noLogoYet}
                        onChange={(e) => {
                          const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                          setLogoFile(f);
                        }}
                        className="sr-only"
                      />
                      <label
                        htmlFor="logo-file"
                        aria-disabled={noLogoYet}
                        className={classNames(
                          "group inline-flex items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-2 shadow-soft cursor-pointer",
                          noLogoYet ? "opacity-50 pointer-events-none" : "hover:border-success"
                        )}
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 group-hover:bg-success-bg group-hover:text-success-ink">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                          </svg>
                        </span>
                        <div>
                          <div className="text-sm text-neutral-800">Click to upload</div>
                          <div className="text-[11px] text-neutral-500">PNG or SVG, up to 2MB</div>
                        </div>
                      </label>
                      {!noLogoYet && logoFile && (
                        <div className="flex items-center gap-2">
                          <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="h-12 w-12 rounded border border-neutral-200 object-contain bg-white" />
                          <button type="button" className="text-xs text-neutral-600 hover:underline" onClick={() => setLogoFile(null)}>Remove</button>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-500">Transparent background preferred.</div>
                  </div>

                  {/* Favicon uploader (optional) */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium">Favicon (optional)</label>
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        id="favicon-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                          setFaviconFile(f);
                        }}
                        className="sr-only"
                      />
                      <label
                        htmlFor="favicon-file"
                        className="group inline-flex items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-2 shadow-soft hover:border-success cursor-pointer"
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 group-hover:bg-success-bg group-hover:text-success-ink">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                          </svg>
                        </span>
                        <div>
                          <div className="text-sm text-neutral-800">Click to upload</div>
                          <div className="text-[11px] text-neutral-500">Square, 48×48px+</div>
                        </div>
                      </label>
                      {faviconFile && (
                        <div className="flex items-center gap-2">
                          <img src={URL.createObjectURL(faviconFile)} alt="Favicon preview" className="h-8 w-8 rounded border border-neutral-200 object-contain bg-white" />
                          <button type="button" className="text-xs text-neutral-600 hover:underline" onClick={() => setFaviconFile(null)}>Remove</button>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-neutral-500">Use a simple mark for best results.</div>
                  </div>

                  {/* Assets uploader */}
                  <div className="mt-5">
                    <label className="block text-sm font-medium">Additional assets</label>
                    <div className="mt-2">
                      <input
                        id="asset-files"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const picked = Array.from(e.target.files || []);
                          setAssetFiles((prev) => {
                            const merged = [...prev, ...picked];
                            const map = new Map<string, File>();
                            for (const f of merged) map.set(`${f.name}:${f.size}`, f);
                            return Array.from(map.values());
                          });
                          (e.target as HTMLInputElement).value = "";
                        }}
                        className="sr-only"
                      />
                      <label
                        htmlFor="asset-files"
                        className="group flex w-full items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-3 shadow-soft hover:border-success cursor-pointer max-w-xl"
                      >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 text-neutral-600 group-hover:bg-success-bg group-hover:text-success-ink">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5l6-6 4 4 5-5 3 3" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 20h18" />
                          </svg>
                        </span>
                        <div className="text-left">
                          <div className="text-sm text-neutral-800">Click to upload images</div>
                          <div className="text-[11px] text-neutral-500">JPG, PNG, up to 10 files</div>
                        </div>
                      </label>
                    </div>
                    {assetFiles.length > 0 ? (
                      <ul className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {assetFiles.map((f, i) => (
                          <li key={`${f.name}-${i}`} className="group relative rounded border border-neutral-200 bg-white p-2 shadow-soft">
                            <img src={URL.createObjectURL(f)} alt={f.name} className="h-20 w-full object-cover rounded" />
                            <div className="mt-1 truncate text-[11px] text-neutral-600" title={f.name}>{f.name}</div>
                            <button
                              type="button"
                              className="absolute top-1 right-1 hidden group-hover:inline-flex items-center justify-center rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white"
                              onClick={() => setAssetFiles(assetFiles.filter((_, idx) => idx !== i))}
                              aria-label={`Remove ${f.name}`}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-2 rounded-lg border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-600 shadow-soft">No assets uploaded yet.</div>
                    )}
                    <div className="mt-1 text-[11px] text-neutral-500">Upload photos, graphics, or brand assets. You can add more later.</div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button type="button" className="text-sm text-neutral-600 hover:underline" onClick={() => setStep(8)}>Back</button>
                    <div className="flex items-center gap-3">
                      {error && <span className="text-sm text-red-600">{error}</span>}
                      <button
                        type="button"
                        onClick={handleFinish}
                        disabled={!canFinish || saving}
                        className={classNames("inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white", (!canFinish || saving) ? "bg-neutral-300 cursor-not-allowed" : "bg-success-accent hover:opacity-90")}
                      >
                        {saving ? "Finishing…" : "Finish"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </details>

          </div>
        </main>
      </div>
    </div>
  );
}
