import ShowcaseSlider from "./components/ShowcaseSlider";
import AmaBar from "./components/AmaBar";

export default function Home() {
  return (
    <div className="py-12 md:py-16">
      {/* Hero (updated to match static design) */}
      <section className="bg-transparent mb-12 md:mb-16">
        <div className="max-w-3xl mx-auto text-center px-3 sm:px-4">
          <div className="inline-flex items-center gap-2 rounded-full ring-1 ring-neutral-200 bg-white/70 px-3 py-1 text-xs text-neutral-600 shadow-xs backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-accent" /> No setup fees • Cancel anytime
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-primary">
            Pay‑by‑month websites
            <span className="block text-accent-primary">design, hosting, updates</span>
          </h1>
          <p className="mt-4 text-secondary text-base md:text-lg max-w-xl">Launch a professional site without large upfront costs. One simple monthly plan covers design, hosting, updates, and support—so you can focus on your business.</p>
          <div className="mt-6 flex flex-row flex-wrap gap-3 justify-center items-center">
            <a href="/get-started" className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold bg-black text-white border border-black text-sm md:text-base transition-colors hover:bg-neutral-900 focus:outline-none whitespace-nowrap">
              Get started
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a href="#features" className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold bg-white text-black border border-black text-sm md:text-base gap-2 transition-colors hover:bg-neutral-50 focus:outline-none whitespace-nowrap">
              See what’s included
            </a>
          </div>
        </div>
      </section>

      {/* Ask Me Anything */}
      <AmaBar />

      <section id="products" className="mt-12 md:mt-20">
        <div className="max-w-5xl mx-auto px-2.5 md:px-4">
          <header className="mb-6 md:mb-8 text-center">
            <div className="text-xs uppercase tracking-wider text-tertiary">Products</div>
            <h2 className="mt-1 text-2xl md:text-4xl font-semibold tracking-tight text-primary">What we build</h2>
          </header>
          <div className="space-y-6 md:space-y-8">
            {/* Websites */}
            <a href="/website" className="group block rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] transition-all">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="md:min-w-[14rem]">
                  <h3 className="text-2xl md:text-3xl font-serif tracking-tight text-primary">Websites</h3>
                </div>
                <div className="flex-1 md:pl-4">
                  <p className="text-sm md:text-base text-secondary">Modern, fast, and SEO‑ready sites designed, hosted, and maintained for you—no upfront fees.</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-tertiary">
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">Design system</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">CMS & updates</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">Analytics</span>
                  </div>
                </div>
                <div className="md:pl-4">
                  <span className="inline-flex items-center rounded-full bg-[color:var(--accent-subtle)] text-accent-primary px-3 py-1 text-xs font-medium shadow-xs">Explore →</span>
                </div>
              </div>
            </a>

            {/* AI Agents */}
            <a href="/agents" className="group block rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] transition-all">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="md:min-w-[14rem]">
                  <h3 className="text-2xl md:text-3xl font-serif tracking-tight text-primary">AI Agents</h3>
                </div>
                <div className="flex-1 md:pl-4">
                  <p className="text-sm md:text-base text-secondary">Automate support, lead‑qualifying, and ops with reliable agents integrated into your stack.</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-tertiary">
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">RAG & tools</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">Workflows</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">Observability</span>
                  </div>
                </div>
                <div className="md:pl-4">
                  <span className="inline-flex items-center rounded-full bg-[color:var(--accent-subtle)] text-accent-primary px-3 py-1 text-xs font-medium shadow-xs">See details →</span>
                </div>
              </div>
            </a>

            {/* Marketing & Branding */}
            <a href="/marketing" className="group block rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] transition-all">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="md:min-w-[14rem]">
                  <h3 className="text-2xl md:text-3xl font-serif tracking-tight text-primary">Marketing & Branding</h3>
                </div>
                <div className="flex-1 md:pl-4">
                  <p className="text-sm md:text-base text-secondary">Positioning, visual identity, and campaigns that match your goals and amplify your reach.</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-tertiary">
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">Brand identity</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">Content</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1">Campaigns</span>
                  </div>
                </div>
                <div className="md:pl-4">
                  <span className="inline-flex items-center rounded-full bg-[color:var(--accent-subtle)] text-accent-primary px-3 py-1 text-xs font-medium shadow-xs">See details →</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section id="showcase" className="mt-12 md:mt-20">
        <div className="max-w-5xl mx-auto px-2.5 md:px-4">
          <header className="mb-6 md:mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary">Showcase</h2>
            <p className="mt-2 text-sm text-secondary">Recent work and case studies</p>
          </header>
          <ShowcaseSlider ariaLabel="Showcase slider">
            <div className="flex gap-3 md:gap-4 w-max px-1">
              <a href="#" className="group snap-start w-56 sm:w-64 flex-none rounded-lg border border-soft bg-white shadow-soft hover:border-[color:var(--accent-soft)] hover:shadow-hover transition-all overflow-hidden">
                <div className="relative">
                  <img loading="lazy" src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop" alt="Aurora Fitness" className="h-28 w-full object-cover" />
                  <span className="absolute top-2 left-2 rounded-full bg-white/90 text-[11px] px-2 py-0.5 ring-1 ring-neutral-200">Website</span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-primary group-hover:underline">Aurora Fitness</h3>
                  <p className="mt-1 text-xs text-secondary line-clamp-2">Sleek site with schedules, trainer bios, and conversion pages.</p>
                  <span className="mt-2 inline-flex items-center text-xs font-medium text-accent-primary">view project →</span>
                </div>
              </a>

              <a href="#" className="group snap-start w-56 sm:w-64 flex-none rounded-lg border border-soft bg-white shadow-soft hover:border-[color:var(--accent-soft)] hover:shadow-hover transition-all overflow-hidden">
                <div className="relative">
                  <img loading="lazy" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop" alt="Summit Outdoors" className="h-28 w-full object-cover" />
                  <span className="absolute top-2 left-2 rounded-full bg-white/90 text-[11px] px-2 py-0.5 ring-1 ring-neutral-200">CMS</span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-primary group-hover:underline">Summit Outdoors</h3>
                  <p className="mt-1 text-xs text-secondary line-clamp-2">Catalog layout with product stories and lightweight ecommerce.</p>
                  <span className="mt-2 inline-flex items-center text-xs font-medium text-accent-primary">view project →</span>
                </div>
              </a>

              <a href="#" className="group snap-start w-56 sm:w-64 flex-none rounded-lg border border-soft bg-white shadow-soft hover:border-[color:var(--accent-soft)] hover:shadow-hover transition-all overflow-hidden">
                <div className="relative">
                  <img loading="lazy" src="https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop" alt="Bluegrain Coffee Co." className="h-28 w-full object-cover" />
                  <span className="absolute top-2 left-2 rounded-full bg-white/90 text-[11px] px-2 py-0.5 ring-1 ring-neutral-200">Brand</span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-primary group-hover:underline">Bluegrain Coffee Co.</h3>
                  <p className="mt-1 text-xs text-secondary line-clamp-2">Editorial design, storytelling pages, newsletter growth.</p>
                  <span className="mt-2 inline-flex items-center text-xs font-medium text-accent-primary">view project →</span>
                </div>
              </a>

              <a href="#" className="group snap-start w-56 sm:w-64 flex-none rounded-lg border border-soft bg-white shadow-soft hover:border-[color:var(--accent-soft)] hover:shadow-hover transition-all overflow-hidden">
                <div className="relative">
                  <img loading="lazy" src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop" alt="Northstar Consulting" className="h-28 w-full object-cover" />
                  <span className="absolute top-2 left-2 rounded-full bg-white/90 text-[11px] px-2 py-0.5 ring-1 ring-neutral-200">Case study</span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-primary group-hover:underline">Northstar Consulting</h3>
                  <p className="mt-1 text-xs text-secondary line-clamp-2">Professional presence with case study templates.</p>
                  <span className="mt-2 inline-flex items-center text-xs font-medium text-accent-primary">view project →</span>
                </div>
              </a>

              <a href="#" className="group snap-start w-56 sm:w-64 flex-none rounded-lg border border-soft bg-white shadow-soft hover:border-[color:var(--accent-soft)] hover:shadow-hover transition-all overflow-hidden">
                <div className="relative">
                  <img loading="lazy" src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop" alt="Evergreen Nonprofit" className="h-28 w-full object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-primary group-hover:underline">Evergreen Nonprofit</h3>
                  <p className="mt-1 text-xs text-secondary line-clamp-2">Accessible site with donation flows and impact highlights.</p>
                  <span className="mt-2 inline-flex items-center text-xs font-medium text-accent-primary">view project →</span>
                </div>
              </a>
            </div>
          </ShowcaseSlider>
        </div>
      </section>

    </div>
  );
}
