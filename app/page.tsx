export default function Home() {
  return (
    <div className="py-10 md:py-16">
      {/* Hero (updated to match static design) */}
      <section className="bg-transparent">
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
            <a href="/get-started" className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold bg-black text-white border border-black text-sm md:text-base transition-colors hover:bg-neutral-900 focus:outline-none">
              Get started
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a href="#features" className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold bg-white text-black border border-black text-sm md:text-base gap-2 transition-colors hover:bg-neutral-50 focus:outline-none">
              See what’s included
            </a>
          </div>
          <div className="mt-3 text-xs text-tertiary">All essentials covered. Simple pricing, no surprises.</div>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-secondary max-w-2xl mx-auto">
            <li className="flex items-center gap-2">
              {/* Pencil icon */}
              <svg className="h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487l3.651 3.651m-9.9 9.9l-4.613 1.23 1.23-4.613 9.9-9.9 3.382 3.382-9.899 9.901z" />
              </svg>
              <span>Design + build included</span>
            </li>
            <li className="flex items-center gap-2">
              {/* Lock icon */}
              <svg className="h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="5" y="10" width="14" height="9" rx="2" ry="2"></rect>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V7a4 4 0 118 0v3"></path>
              </svg>
              <span>Managed hosting & SSL</span>
            </li>
            <li className="flex items-center gap-2">
              {/* Refresh icon */}
              <svg className="h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 0115.364-6.364M21 12a9 9 0 01-15.364 6.364" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 8V4H4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 16v4h4" />
              </svg>
              <span>Monthly content updates</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Showcase (match static index.html) */}
      <section id="showcase" className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-2.5 md:px-4">
          <header className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary">Showcase</h2>
            <p className="mt-2 text-sm text-secondary">A few recent projects.</p>
          </header>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <a href="#" className="group relative block overflow-hidden rounded-xl ring-1 ring-neutral-200 bg-white transition-all duration-300 hover:ring-[color:var(--accent-soft)]">
              <div className="h-24 sm:h-28 bg-neutral-200">
                <img loading="lazy" src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop" alt="Aurora Fitness" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/40 to-transparent text-white">
                <div className="text-xs font-medium">Aurora Fitness</div>
              </div>
            </a>
            <a href="#" className="group relative block overflow-hidden rounded-xl ring-1 ring-neutral-200 bg-white transition-all duration-300 hover:ring-[color:var(--accent-soft)]">
              <div className="h-24 sm:h-28 bg-neutral-200">
                <img loading="lazy" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop" alt="Summit Outdoors" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/40 to-transparent text-white">
                <div className="text-xs font-medium">Summit Outdoors</div>
              </div>
            </a>
            <a href="#" className="group relative block overflow-hidden rounded-xl ring-1 ring-neutral-200 bg-white transition-all duration-300 hover:ring-[color:var(--accent-soft)]">
              <div className="h-24 sm:h-28 bg-neutral-200">
                <img loading="lazy" src="https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop" alt="Bluegrain Coffee Co." className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/40 to-transparent text-white">
                <div className="text-xs font-medium">Bluegrain Coffee Co.</div>
              </div>
            </a>
            <a href="#" className="group relative block overflow-hidden rounded-xl ring-1 ring-neutral-200 bg-white transition-all duration-300 hover:ring-[color:var(--accent-soft)]">
              <div className="h-24 sm:h-28 bg-neutral-200">
                <img loading="lazy" src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop" alt="Northstar Consulting" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/40 to-transparent text-white">
                <div className="text-xs font-medium">Northstar Consulting</div>
              </div>
            </a>
            <a href="#" className="group relative block overflow-hidden rounded-xl ring-1 ring-neutral-200 bg-white transition-all duration-300 hover:ring-[color:var(--accent-soft)]">
              <div className="h-24 sm:h-28 bg-neutral-200">
                <img loading="lazy" src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop" alt="Crescent Studio" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/40 to-transparent text-white">
                <div className="text-xs font-medium">Crescent Studio</div>
              </div>
            </a>
            <a href="#" className="group relative block overflow-hidden rounded-xl ring-1 ring-neutral-200 bg-white transition-all duration-300 hover:ring-[color:var(--accent-soft)]">
              <div className="h-24 sm:h-28 bg-neutral-200">
                <img loading="lazy" src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop" alt="Evergreen Nonprofit" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/40 to-transparent text-white">
                <div className="text-xs font-medium">Evergreen Nonprofit</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      

    </div>
  );
}
