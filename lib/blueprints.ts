export type Blueprint = {
  industry: string
  pages: string[]
  sections: Record<string, string[]>
  extra?: string
}

const BASE_PAGES = ["home", "about", "contact", "privacy", "terms", "404"]

const BLUEPRINTS: Record<string, Blueprint> = {
  saas: {
    industry: "SaaS",
    pages: [
      ...BASE_PAGES,
      "pricing",
      "features",
      "solutions",
      "customers",
      "blog",
      "docs",
      "changelog",
      "security",
      "careers"
    ],
    sections: {
      home: [
        "hero",
        "social-proof",
        "key-benefits",
        "feature-groups",
        "integrations",
        "use-cases",
        "pricing-preview",
        "cta"
      ],
      pricing: ["plans", "faq", "cta"],
      features: ["feature-list", "deep-dives", "cta"],
      solutions: ["by-role", "by-industry", "case-studies"],
      customers: ["logos", "testimonials", "case-studies"],
      blog: ["articles"],
      docs: ["getting-started", "guides", "api-reference"],
      security: ["compliance", "certifications", "faq"],
    },
    extra: "Include SLA/SOC2 badges where appropriate; add Compare page and ROI calculator if hinted."
  },
  ecommerce: {
    industry: "eCommerce",
    pages: [
      ...BASE_PAGES,
      "shop",
      "product",
      "collections",
      "journal",
      "cart",
      "checkout",
      "faq",
      "shipping-returns"
    ],
    sections: {
      home: ["featured-collections", "bestsellers", "reviews", "trust-badges", "cta"],
      product: ["gallery", "details", "reviews", "cross-sell", "size-guide"],
      shop: ["filters", "grid", "pagination"],
    },
  },
  local_services: {
    industry: "Local Service",
    pages: [
      ...BASE_PAGES,
      "services",
      "service",
      "areas-served",
      "reviews",
      "gallery",
      "blog"
    ],
    sections: {
      home: ["hero", "credentials", "services-grid", "financing", "reviews", "cta"],
      services: ["service-cards", "cta"],
      service: ["overview", "faq", "cta"],
    },
  },
  agency: {
    industry: "Agency",
    pages: [
      ...BASE_PAGES,
      "services",
      "work",
      "case-studies",
      "process",
      "team",
      "blog"
    ],
    sections: {
      home: ["hero", "selected-work", "awards-press", "process", "client-logos", "cta"],
      work: ["grid", "filters"],
      caseStudies: ["story", "metrics", "gallery"],
    },
  },
  healthcare: {
    industry: "Healthcare",
    pages: [...BASE_PAGES, "services", "providers", "locations", "insurance", "blog"],
    sections: {
      home: ["hero", "services-overview", "insurance-accepted", "locations", "testimonials", "cta"],
      services: ["service-cards", "faq", "cta"],
      providers: ["directory", "filters"],
    },
    extra: "Avoid PHI; include HIPAA-safe language; add accessibility cues and emergency disclaimers where appropriate.",
  },
  legal: {
    industry: "Legal",
    pages: [...BASE_PAGES, "practice-areas", "attorneys", "case-results", "blog"],
    sections: {
      home: ["hero", "practice-areas", "credentials", "testimonials", "cta"],
      practiceAreas: ["area-cards", "faq", "cta"],
    },
  },
  real_estate: {
    industry: "Real Estate",
    pages: [...BASE_PAGES, "listings", "agents", "neighborhoods", "blog"],
    sections: {
      home: ["hero", "featured-listings", "neighborhoods", "testimonials", "cta"],
      listings: ["filters", "grid", "map"],
    },
  },
  restaurant: {
    industry: "Restaurant",
    pages: [...BASE_PAGES, "menu", "locations", "reservations", "gallery"],
    sections: {
      home: ["hero", "signature-dishes", "hours-locations", "reviews", "cta"],
      menu: ["categories", "dietary-tags"],
    },
  },
  education: {
    industry: "Education",
    pages: [...BASE_PAGES, "programs", "admissions", "faculty", "events", "blog"],
    sections: {
      home: ["hero", "program-highlights", "outcomes", "testimonials", "cta"],
      programs: ["catalog", "filters"],
    },
  },
  nonprofit: {
    industry: "Nonprofit",
    pages: [...BASE_PAGES, "mission", "programs", "donate", "impact", "blog"],
    sections: {
      home: ["hero", "impact-stats", "programs-overview", "partners", "cta-donate"],
      donate: ["tiers", "faq"],
    },
  },
  portfolio: {
    industry: "Portfolio",
    pages: [...BASE_PAGES, "work", "about", "contact", "blog"],
    sections: {
      home: ["hero", "selected-work", "services", "clients", "cta"],
      work: ["grid", "case-previews"],
    },
  },
  personal_brand: {
    industry: "Personal Brand",
    pages: [...BASE_PAGES, "about", "services", "media", "newsletter"],
    sections: {
      home: ["hero", "bio-snippet", "press", "cta"],
    },
  },
}

export function getBlueprint(industry: string): Blueprint {
  const key = (industry || "").toLowerCase().replace(/\s+/g, "_")
  return BLUEPRINTS[key] || {
    industry: industry || "Generic",
    pages: BASE_PAGES,
    sections: { home: ["hero", "benefits", "cta"] },
    extra: "Include any standard pages missing (Contact/Privacy/Terms)."
  }
}

// Robust resolver for mapping raw siteType/user input to a known blueprint key
export function resolveIndustry(input: string | null | undefined): string {
  const s = (input || '').toLowerCase().trim()
  if (!s) return 'SaaS'
  const contains = (k: string) => s.includes(k)
  if (contains('saas') || contains('software')) return 'SaaS'
  if (contains('ecom') || contains('shop') || contains('store')) return 'eCommerce'
  if (contains('agency') || contains('studio')) return 'Agency'
  if (contains('clean') || contains('plumb') || contains('hvac') || contains('repair') || contains('service')) return 'Local Service'
  if (contains('health') || contains('clinic') || contains('dental') || contains('medical')) return 'Healthcare'
  if (contains('law') || contains('legal') || contains('attorney')) return 'Legal'
  if (contains('real estate') || contains('realtor') || contains('property')) return 'Real Estate'
  if (contains('restaurant') || contains('cafe') || contains('food')) return 'Restaurant'
  if (contains('education') || contains('school') || contains('academy')) return 'Education'
  if (contains('nonprofit') || contains('charity') || contains('ngo')) return 'Nonprofit'
  if (contains('portfolio')) return 'Portfolio'
  if (contains('personal') || contains('creator') || contains('influencer')) return 'Personal Brand'
  return 'SaaS'
}

export function buildProjectInstructions(theme: any, blueprint: Blueprint) {
  const parts: string[] = []
  parts.push("Use the provided site theme tokens across all pages/components.")
  if (theme) {
    parts.push(`Theme Tokens: ${JSON.stringify(theme)}`)
  }
  parts.push(`Industry: ${blueprint.industry}`)
  parts.push(`Required Pages: ${blueprint.pages.join(", ")}`)
  parts.push("Sections per page (guideline):")
  parts.push(JSON.stringify(blueprint.sections))
  if (blueprint.extra) parts.push(blueprint.extra)
  parts.push("Ensure accessibility (WCAG AA), responsive layout, SEO meta & OpenGraph.")
  parts.push("Prefer elevation and color over heavy borders; use focus rings on interactive elements.")
  parts.push("If required inputs are missing, scaffold sensible placeholders and TODOs.")
  return parts.join("\n")
}

export function buildInitialChatPrompt(answers: any, blueprint: Blueprint, theme: any) {
  const name = answers?.brand?.name || answers?.businessName || "Site"
  const audience = answers?.audience || answers?.targetAudience || "target audience"
  const tone = answers?.tone || answers?.voice || "clear, modern"
  const pages = blueprint.pages
  return [
    `Build a modern site for ${name} targeting ${audience}.`,
    `Use the theme tokens and constraints. Tone: ${tone}.`,
    `Create pages: ${pages.join(", ")}. Add any missing, inferred pages needed for this industry.`,
    `For each index page that lists items, create a corresponding detail route with clean URL patterns.`,
    `Global: header with primary CTA, footer with utility links, cookie banner, SEO meta, OpenGraph, JSON-LD schema.`,
    `Forms: labels visible, focus ring per theme.`,
    theme ? `Theme summary: ${JSON.stringify(theme)}` : undefined,
  ].filter(Boolean).join("\n")
}
