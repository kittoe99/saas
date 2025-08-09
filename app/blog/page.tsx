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
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-10 sm:py-14">
          <div className="max-w-3xl">
            <span className="inline-block text-xs tracking-wide uppercase text-neutral-500">Blog</span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
              Insights, updates, and resources from hinn.io
            </h1>
            <p className="mt-3 text-sm sm:text-base text-neutral-600">
              Learn about our Website‑as‑a‑Service approach, explore features like AI chat and automation,
              and see how we keep your site fast, secure, and always improving.
            </p>
            <div className="mt-4 flex gap-3 text-sm">
              <Link href="/contact" className="px-3 py-2 rounded-md bg-[#1a73e8] text-white">Start a project</Link>
              <Link href="/showcase" className="px-3 py-2 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-50">See showcase</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 py-10">
        <div className="grid md:grid-cols-5 gap-6 items-start">
          <div className="md:col-span-3 rounded-xl border border-neutral-200 p-5 bg-white">
            <div className="text-xs uppercase tracking-wide text-[#1a73e8]">Featured</div>
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
          <div className="md:col-span-2 rounded-xl border border-neutral-200 p-5 bg-white">
            <div className="text-xs uppercase tracking-wide text-neutral-500">What we offer</div>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm">
              <div className="rounded-lg border border-neutral-200 p-3">
                <dt className="font-medium">Website</dt>
                <dd className="mt-1 text-neutral-700">Design, content, and technical setup handled end‑to‑end.</dd>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <dt className="font-medium">Sales & Automation</dt>
                <dd className="mt-1 text-neutral-700">Lead capture, forms, email sequences, and workflows.</dd>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <dt className="font-medium">Payments</dt>
                <dd className="mt-1 text-neutral-700">Subscriptions and one‑time purchases with secure checkout.</dd>
              </div>
              <div className="rounded-lg border border-neutral-200 p-3">
                <dt className="font-medium">AI</dt>
                <dd className="mt-1 text-neutral-700">Chat, content generation, and analytics insights.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="max-w-6xl mx-auto px-3 sm:px-4 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((p) => (
            <article key={p.id} className="rounded-xl border border-neutral-200 bg-white p-4 hover:shadow-sm transition-shadow">
              <div className="text-xs text-neutral-500">{p.category} • {p.date}</div>
              <h3 className="mt-2 text-base sm:text-lg font-semibold text-neutral-900">{p.title}</h3>
              <p className="mt-2 text-sm text-neutral-700">{p.excerpt}</p>
              <div className="mt-3">
                <Link href={`/blog/${p.slug}`} className="text-sm text-[#1a73e8] hover:underline">Read more</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-10">
          <div className="rounded-xl border border-neutral-200 bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-neutral-900">Have a project in mind?</h4>
              <p className="mt-1 text-sm text-neutral-700">Tell us about it and we’ll get back with a plan.</p>
            </div>
            <a href="/contact" className="px-3 py-2 rounded-md bg-[#1a73e8] text-white text-sm">Contact us</a>
          </div>
        </div>
      </section>
    </main>
  );
}
