// Central registry for reusable section/component code snippets.
// These snippets can be sent into v0 chat as continuation messages to build specific sections.

export type SectionKey =
  | "hero"
  | "hero_alt"
  // Future: add more keys like "features", "services_grid", "testimonials", "faq", etc.
  ;

export type SectionSnippet = {
  key: SectionKey;
  label: string;
  description?: string;
  code: string; // raw JSX/HTML/Tailwind snippet
};

// Hero section snippet (as provided)
const HERO_SNIPPET = `<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black leading-tight">
            AI-Powered Agriculture <span className="text-green-500">Solutions</span>
            <svg className="inline-block w-12 h-12 text-yellow-400 ml-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9L15.09 9.74L12 16L8.91 9.74L2 9L8.91 8.26L12 2Z"/>
            </svg>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
            Revolutionize your farming with intelligent crop recommendations, accurate price predictions, and instant disease detection powered by advanced AI technology.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all">
            Get Started Free →
          </Button>
          <Button size="lg" variant="outline" className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold rounded-2xl bg-transparent">
            Explore Features
          </Button>
        </div>
      </div>
      <div className="lg:flex justify-center order-first lg:order-last">
        <div className="relative">
          <img
            src="/modern-farmer-using-tablet-in-green-agricultural-f.jpg"
            alt="Modern farmer using technology in agricultural field"
            className="rounded-2xl shadow-2xl w-full"
          />
          <div className="absolute -top-4 -left-4 bg-white rounded-xl p-4 shadow-lg border">
            <div className="text-2xl font-black text-cyan-600">50K+</div>
            <div className="text-sm text-gray-600">Lives Changed</div>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg border">
            <div className="text-2xl font-black text-pink-500">$2M+</div>
            <div className="text-sm text-gray-600">Funds Raised</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;

// Second hero variant (as provided)
const HERO_ALT_SNIPPET = `<section className="relative overflow-hidden rounded-2xl border bg-background p-6 md:p-10">
  <div className="grid items-center gap-8 md:grid-cols-2">
    <div className="space-y-4">
      <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-medium dark:bg-rose-500/10 dark:text-rose-400">
        • Moving Help Marketplace
      </span>
      <h1 className="text-3xl md:text-5xl font-bold leading-tight">
        Book Moving Help From <span className="text-rose-600">$69/Hour</span>
        <span className="block h-1 w-32 bg-rose-500 mt-2 rounded-full"></span>
      </h1>
      <p className="text-muted-foreground">
        Get matched with verified independent moving helpers in your area.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600/90">
          View Pricing
        </button>
        <button className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
          How It Works
        </button>
      </div>
      <div className="mt-4 rounded-xl border bg-card p-3 flex items-center gap-3 text-sm">
        <span className="text-amber-500">★</span>
        <span className="font-medium">4.9</span>
        <span className="text-muted-foreground">1,200+ satisfied customers
</span>
      </div>
    </div>
    <div className="relative">
      <div className="mx-auto size-56 md:size-[20rem] rounded-xl border bg-gradient-to-b from-rose-100 to-transparent p-1 md:p-2">
        <img src="/professional-movers-helping-with-boxes-and-furnitu.jpg" alt="Moving help" className="size-full rounded-xl object-cover" />
      </div>
    </div>
  </div>
</section>`;

export const SECTIONS: Record<SectionKey, SectionSnippet> = {
  hero: {
    key: "hero",
    label: "Hero",
    description: "Bold hero with headline, subtext, CTA buttons, and image callouts.",
    code: HERO_SNIPPET,
  },
  hero_alt: {
    key: "hero_alt",
    label: "Hero (Alt)",
    description: "Hero variant with pricing highlight, rating, and illustration card.",
    code: HERO_ALT_SNIPPET,
  },
};

export function getSectionCode(key: SectionKey): string {
  const item = SECTIONS[key];
  if (!item) throw new Error(`Unknown section key: ${key}`);
  return item.code;
}

export function listSections(): SectionSnippet[] {
  return Object.values(SECTIONS);
}
