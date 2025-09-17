"use client";
import React from "react";
import Link from "next/link";

export default function WebsitePage() {
  return (
    <div className="py-8 sm:py-12">
      {/* Content-style Intro */}
      <section className="relative rounded-2xl border border-neutral-200 keep-border bg-white p-6 sm:p-8 shadow-soft shadow-hover">
        {/* Soft background accent (warm/calm) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(26,115,232,0.06),transparent_60%),radial-gradient(1000px_500px_at_90%_110%,rgba(26,115,232,0.05),transparent_60%)]" />
        <div className="max-w-3xl">
          <span className="inline-block text-xs tracking-wider uppercase text-neutral-500">Website</span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
            Design, hosting, and monthly updates—done for you
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-600">
            Launch a modern, fast website without large upfront costs. We handle design, content, DNS/SSL, and ongoing improvements so you can focus on your business.
          </p>
          <div className="mt-4 flex gap-3 text-sm">
            <Link href="/get-started" className="px-3 py-2 rounded-md bg-success-accent text-white transition-opacity hover:opacity-90">Start a project</Link>
            <a href="#features" className="px-3 py-2 rounded-md border border-neutral-300 text-success-ink bg-white hover:bg-neutral-50 shadow-sm">See features</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 mt-8 md:mt-12">
        <header className="mb-6 md:mb-8 text-center">
          <div className="text-xs uppercase tracking-wider text-tertiary">Features</div>
          <h2 className="mt-1 text-2xl md:text-4xl font-semibold tracking-tight text-primary">Everything included</h2>
          <p className="mt-2 text-secondary max-w-2xl mx-auto">Design, hosting, SEO, analytics, and ongoing content updates—done for you.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
          {[
            { title: "Design & build", desc: "Custom layout matched to your brand." },
            { title: "Managed hosting", desc: "Fast global CDN, SSL, backups." },
            { title: "Monthly updates", desc: "Keep content fresh with our help." },
            { title: "Analytics & SEO", desc: "Best practices baked in from day one." },
          ].map((f) => (
            <div key={f.title} className="group p-5 rounded-xl border border-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:border-accent-soft shadow-soft hover:shadow-hover">
              <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-600 shadow-xs">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-accent" />
                Website
              </div>
              <div className="text-sm font-medium text-tertiary">Website</div>
              <h3 className="mt-2 text-lg font-semibold text-primary">{f.title}</h3>
              <p className="mt-2 text-sm text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 mt-12 md:mt-16">
        <header className="mb-6 md:mb-8 text-center">
          <div className="text-xs uppercase tracking-wider text-tertiary">Pricing</div>
          <h2 className="mt-1 text-2xl md:text-4xl font-semibold tracking-tight text-primary">Simple monthly plan</h2>
          <p className="mt-2 text-secondary max-w-2xl mx-auto">Transparent pricing with everything you need to run your site.</p>
        </header>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-soft bg-white p-6 shadow-soft">
            <div className="text-sm font-medium text-tertiary">Starter</div>
            <div className="mt-2 text-3xl font-semibold text-primary">$99<span className="text-base font-normal text-secondary">/mo</span></div>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> 4 pages included</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> Managed hosting & SSL</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> Monthly content updates</li>
            </ul>
            <div className="mt-5"><Link href="/get-started" className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium transition-all duration-200 hover:bg-accent-hover">Choose Starter</Link></div>
          </div>
          <div className="rounded-xl border border-accent-soft bg-white p-6 shadow-soft ring-1 ring-accent-subtle">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-subtle text-accent-primary px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium">Popular</div>
            <div className="mt-2 text-3xl font-semibold text-primary">$199<span className="text-base font-normal text-secondary">/mo</span></div>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> Up to 10 pages</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> Priority updates</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> On-page SEO</li>
            </ul>
            <div className="mt-5"><Link href="/get-started" className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium transition-all duration-200 hover:bg-accent-hover">Choose Growth</Link></div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 mt-12 md:mt-16">
        <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-primary">FAQ</h2>
        <dl className="mt-4 space-y-4">
          <div className="rounded-xl border border-soft bg-white p-4 transition-colors duration-200 hover:bg-panel shadow-soft hover:shadow-hover"><dt className="font-medium text-primary">What do I need to get started?</dt><dd className="mt-1 text-sm text-secondary">Share your business details and any brand assets—our team takes it from there.</dd></div>
          <div className="rounded-xl border border-soft bg-white p-4 transition-colors duration-200 hover:bg-panel shadow-soft hover:shadow-hover"><dt className="font-medium text-primary">Can I use my own domain?</dt><dd className="mt-1 text-sm text-secondary">Yes. We set up and manage DNS and SSL so your site is secure on your domain.</dd></div>
          <div className="rounded-xl border border-soft bg-white p-4 transition-colors duration-200 hover:bg-panel shadow-soft hover:shadow-hover"><dt className="font-medium text-primary">How fast is the turnaround?</dt><dd className="mt-1 text-sm text-secondary">An initial version is typically ready within a few days, with refinements following.</dd></div>
        </dl>
      </section>

      {/* CTA */}
      <section className="mt-12 md:mt-16">
        <div className="rounded-xl border border-soft bg-white p-6 md:p-8 shadow-soft text-center">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-primary">Ready to launch your website?</h2>
          <p className="mt-2 text-sm md:text-base text-secondary">Start your monthly plan—no long‑term contracts.</p>
          <div className="mt-4">
            <Link href="/get-started" className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium transition-all duration-200 hover:bg-accent-hover">
              Get started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
