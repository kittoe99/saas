import Link from "next/link";

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      slug: "welcome-to-hinn-blog",
      category: "Updates",
      title: "Welcome to the hinn.io Blog",
      excerpt:
        "We build modern, fast, and always‑up‑to‑date websites with integrated tools for sales, automation, and analytics.",
      date: "Aug 2025",
    },
    {
      id: 2,
      slug: "website-as-a-service",
      category: "Services",
      title: "What you get with our Website-as-a-Service",
      excerpt:
        "Design, hosting, maintenance, and continuous improvements. No surprise bills—just an all‑inclusive plan.",
      date: "Aug 2025",
    },
    {
      id: 3,
      slug: "recent-builds-and-success-stories",
      category: "Showcase",
      title: "Recent builds and success stories",
      excerpt:
        "A look at sites we’ve launched across industries—from local services to online brands.",
      date: "Aug 2025",
    },
    {
      id: 4,
      slug: "ai-features-on-your-site",
      category: "AI",
      title: "AI features: assistants, content, and insights",
      excerpt:
        "From on‑site chat to content generation and analytics summaries, AI elevates your site experience.",
      date: "Aug 2025",
    },
    {
      id: 5,
      slug: "pricing-that-scales",
      category: "Pricing",
      title: "Simple pricing that scales with you",
      excerpt:
        "Transparent plans that include everything you need to launch and grow—hosting, updates, and support.",
      date: "Aug 2025",
    },
    {
      id: 6,
      slug: "product-roadmap",
      category: "Roadmap",
      title: "What’s coming next",
      excerpt:
        "Better analytics dashboards, deeper CRM integrations, and more AI‑powered automation.",
      date: "Aug 2025",
    },
  ];

  return (
    <div className="py-8 sm:py-12">
      {/* Hero */}
      <section className="relative rounded-2xl border border-neutral-200 keep-border bg-white p-6 sm:p-8 shadow-soft shadow-hover">
        {/* Soft background accent (warm) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(217,119,89,0.06),transparent_60%),radial-gradient(1000px_500px_at_90%_110%,rgba(217,119,89,0.05),transparent_60%)]" />
        <div className="max-w-3xl">
          <span className="inline-block text-xs tracking-wider uppercase text-neutral-500">News</span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Insights, updates, and resources from hinn.io
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600">
            Learn about our Website‑as‑a‑Service approach, explore features like AI chat and automation,
            and see how we keep your site fast, secure, and always improving.
          </p>
          <div className="mt-4 flex gap-3 text-sm">
            <Link href="/contact" className="px-3 py-2 rounded-md bg-success-accent text-white transition-opacity hover:opacity-90">Start a project</Link>
            <Link href="/showcase" className="px-3 py-2 rounded-md border border-neutral-300 text-success-ink bg-white hover:bg-neutral-50 shadow-sm">See showcase</Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mt-8">
        <div className="grid md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 rounded-xl border border-neutral-200 keep-border p-5 bg-white shadow-soft">
            <div className="text-xs uppercase tracking-wide text-success-ink">Featured</div>
            <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-neutral-900">
              Your website, always current—design, hosting, and updates included
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-700">
              We operate like your website team. We design and build once, then continuously improve—content updates,
              performance tuning, SEO enhancements, and new features as your business grows. No rebuild headaches.
            </p>
            <ul className="mt-4 text-sm text-neutral-700 list-disc pl-5 space-y-1">
              <li>Modern, responsive design with excellent performance</li>
              <li>Managed hosting, SSL, backups, and monitoring</li>
              <li>Ongoing updates and support included</li>
              <li>Optional add‑ons: sales funnels, payments, CRM, and AI</li>
            </ul>
          </div>
          <div className="md:col-span-2 rounded-xl border border-neutral-200 keep-border p-5 bg-panel shadow-soft">
            <div className="text-xs uppercase tracking-wide text-neutral-700">What we offer</div>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm">
              <div className="rounded-lg border border-neutral-200 keep-border bg-white p-3 shadow-soft">
                <dt className="font-medium">Website</dt>
                <dd className="mt-1 text-neutral-700">Design, content, and technical setup handled end‑to‑end.</dd>
              </div>
              <div className="rounded-lg border border-neutral-200 keep-border bg-white p-3 shadow-soft">
                <dt className="font-medium">Sales & Automation</dt>
                <dd className="mt-1 text-neutral-700">Lead capture, forms, email sequences, and workflows.</dd>
              </div>
              <div className="rounded-lg border border-neutral-200 keep-border bg-white p-3 shadow-soft">
                <dt className="font-medium">Payments</dt>
                <dd className="mt-1 text-neutral-700">Subscriptions and one‑time purchases with secure checkout.</dd>
              </div>
              <div className="rounded-lg border border-neutral-200 keep-border bg-white p-3 shadow-soft">
                <dt className="font-medium">AI</dt>
                <dd className="mt-1 text-neutral-700">Chat, content generation, and analytics insights.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="mt-8 pb-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => (
            <article key={p.id} className="group rounded-xl border border-neutral-200 keep-border bg-white p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <span className="inline-flex items-center rounded-full bg-success-pill px-2 py-0.5 text-success-pill uppercase tracking-wide">{p.category}</span>
                <span className="opacity-70">•</span>
                <span className="text-neutral-500">{p.date}</span>
              </div>
              <h3 className="mt-2 text-base sm:text-lg font-semibold text-neutral-900">
                <Link href={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-neutral-700">{p.excerpt}</p>
              <div className="mt-3">
                <Link href={`/blog/${p.slug}`} className="inline-flex items-center gap-1 text-sm text-success-ink hover:opacity-80">
                  Read more
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-8">
        <div className="rounded-xl border border-neutral-200 keep-border bg-panel p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft">
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-neutral-900">Have a project in mind?</h4>
            <p className="mt-1 text-sm text-neutral-700">Tell us about it and we’ll get back with a plan.</p>
          </div>
          <Link href="/contact" className="px-3 py-2 rounded-md bg-success-accent text-white text-sm transition-opacity hover:opacity-90">Contact us</Link>
        </div>
      </section>
    </div>
  );
}
