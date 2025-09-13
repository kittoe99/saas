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
