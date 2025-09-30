import React from "react";
import Link from "next/link";

export default function WebsitePage() {
  return (
    <div className="py-12 md:py-16">
      {/* Hero (aligned to Agents: plain header, no card container) */}
      <section>
        <div className="max-w-3xl mx-auto text-center px-3 sm:px-4">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-subtle">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-accent-primary" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
              </svg>
            </span>
            <span>Websites</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-secondary max-w-2xl mx-auto">
            Pay‑by‑month websites with design, hosting, and updates included—so you can focus on your business.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/get-started" className="px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors hover:brightness-95">Get started</Link>
            <a href="#highlights" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">See details</a>
          </div>
        </div>
      </section>

      {/* Highlights (aligned to Agents) */}
      <section id="highlights" className="scroll-mt-24 mt-8 md:mt-12">
        <header className="mb-6 md:mb-8 text-center">
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary">What you get</h2>
          <p className="mt-2 text-sm md:text-base text-secondary max-w-2xl mx-auto">Design, hosting, and ongoing updates—done for you.</p>
        </header>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {[
            { title: "Design & build", desc: "Custom layout matched to your brand.", icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />) },
            { title: "Managed hosting", desc: "Fast global CDN, SSL, backups.", icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 16h10M5 8h10" />) },
            { title: "Monthly updates", desc: "Keep content fresh with our help.", icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />) },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] transition-all">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-subtle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-accent-primary" aria-hidden>
                  {item.icon}
                </svg>
              </div>
              <h3 className="mt-3 text-base font-semibold tracking-tight text-primary">{item.title}</h3>
              <p className="mt-1 text-sm text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works (aligned to Agents) */}
      <section className="mt-10 md:mt-14 rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]">
        <h2 className="text-base font-semibold tracking-tight text-primary">How it works</h2>
        <ol className="mt-4 grid md:grid-cols-3 gap-4 text-sm text-secondary">
          <li className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="font-medium text-primary">1. Share your goals</div>
            <p className="mt-1">We capture requirements and any brand assets you have.</p>
          </li>
          <li className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="font-medium text-primary">2. Design & build</div>
            <p className="mt-1">We design, build, and set up hosting and analytics.</p>
          </li>
          <li className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="font-medium text-primary">3. Update monthly</div>
            <p className="mt-1">Send updates anytime—content and improvements ship monthly.</p>
          </li>
        </ol>
      </section>

      {/* Pricing (aligned to Agents) */}
      <section id="pricing" className="scroll-mt-24 mt-12 md:mt-16">
        <header className="mb-6 md:mb-8 text-center">
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary">Simple monthly pricing</h2>
          <p className="mt-2 text-sm md:text-base text-secondary max-w-2xl mx-auto">Transparent plans with everything you need to run your site.</p>
        </header>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { name: "Starter", price: "$99/mo", features: ["4 pages", "Managed hosting & SSL", "Monthly updates"] },
            { name: "Growth", price: "$199/mo", features: ["Up to 10 pages", "Priority updates", "On-page SEO"] },
            { name: "Scale", price: "$299/mo", features: ["Unlimited pages", "Custom components", "Priority support"] },
          ].map((tier) => (
            <div key={tier.name} className="rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]">
              <div className="flex items-baseline justify-between">
                <div className="text-base font-semibold text-primary">{tier.name}</div>
                <div className="text-primary font-semibold">{tier.price}</div>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-secondary">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-accent-primary mt-0.5" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link href="/get-started" className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm transition-colors hover:brightness-95">
                  Choose {tier.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ teaser (aligned to Agents) */}
      <section id="faq" className="scroll-mt-24 mt-12 md:mt-16">
        <div className="grid gap-3">
          <details className="rounded-xl border border-neutral-200 bg-white p-4">
            <summary className="cursor-pointer select-none text-sm font-medium text-primary">Can you use my existing domain?</summary>
            <p className="mt-2 text-sm text-secondary">Yes. We manage DNS and SSL so your site is secure on your domain.</p>
          </details>
          <details className="rounded-xl border border-neutral-200 bg-white p-4">
            <summary className="cursor-pointer select-none text-sm font-medium text-primary">How do monthly updates work?</summary>
            <p className="mt-2 text-sm text-secondary">Send requests anytime—most changes go live within a few days.</p>
          </details>
        </div>
      </section>
    </div>
  );
}
