"use client";
import React from "react";
import Link from "next/link";

export default function WebsitePage() {
  return (
    <div className="py-8 sm:py-12">
      {/* Hero (replaced with design from static index.html) */}
      <section className="rounded-3xl border border-soft bg-white p-6 sm:p-10 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] transition-all">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full ring-1 ring-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600 shadow-soft">
            No setup fees • Cancel anytime
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-primary">
            Pay‑by‑month websites
            <span className="block text-accent-primary">design, hosting, updates</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-secondary max-w-xl mx-auto">
            Launch a professional site without large upfront costs. One simple monthly plan covers design,
            hosting, updates, and support—so you can focus on your business.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/get-started" className="inline-flex items-center justify-center px-4 py-2.5 rounded-full font-semibold bg-accent-primary text-white shadow-[0_6px_20px_rgba(217,119,89,0.18)] transition-all hover:brightness-95 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(217,119,89,0.22)]">
              Get started
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="ml-2 h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </Link>
            <a href="#features" className="inline-flex items-center justify-center px-4 py-2.5 rounded-full font-semibold bg-white text-accent-primary border border-[color:var(--accent-soft)] hover:bg-[color:var(--accent-subtle)]">
              See features
            </a>
          </div>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-secondary max-w-2xl mx-auto">
            <li className="flex items-center gap-2"><svg className="h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span>Design + build included</span></li>
            <li className="flex items-center gap-2"><svg className="h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span>Managed hosting & SSL</span></li>
            <li className="flex items-center gap-2"><svg className="h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span>Monthly content updates</span></li>
          </ul>
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
            <div key={f.title} className="group p-5 rounded-3xl border border-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:border-accent-soft shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]">
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
          <div className="rounded-3xl border border-soft bg-white p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]">
            <div className="text-sm font-medium text-tertiary">Starter</div>
            <div className="mt-2 text-3xl font-semibold text-primary">$99<span className="text-base font-normal text-secondary">/mo</span></div>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> 4 pages included</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> Managed hosting & SSL</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> Monthly content updates</li>
            </ul>
            <div className="mt-5"><Link href="/get-started" className="inline-flex items-center justify-center px-4 py-2.5 rounded-full font-semibold bg-accent-primary text-white shadow-[0_6px_20px_rgba(217,119,89,0.18)] transition-all hover:brightness-95 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(217,119,89,0.22)]">Choose Starter</Link></div>
          </div>
          <div className="rounded-3xl border border-accent-soft bg-white p-6 shadow-soft ring-1 ring-accent-subtle">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-subtle text-accent-primary px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium">Popular</div>
            <div className="mt-2 text-3xl font-semibold text-primary">$199<span className="text-base font-normal text-secondary">/mo</span></div>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> Up to 10 pages</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> Priority updates</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-accent-primary"/> On-page SEO</li>
            </ul>
            <div className="mt-5"><Link href="/get-started" className="inline-flex items-center justify-center px-4 py-2.5 rounded-full font-semibold bg-accent-primary text-white shadow-[0_6px_20px_rgba(217,119,89,0.18)] transition-all hover:brightness-95 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(217,119,89,0.22)]">Choose Growth</Link></div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 mt-12 md:mt-16">
        <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-primary">FAQ</h2>
        <dl className="mt-4 space-y-4">
          <div className="rounded-3xl border border-soft bg-white p-4 transition-colors duration-200 hover:bg-panel shadow-soft"><dt className="font-medium text-primary">What do I need to get started?</dt><dd className="mt-1 text-sm text-secondary">Share your business details and any brand assets—our team takes it from there.</dd></div>
          <div className="rounded-3xl border border-soft bg-white p-4 transition-colors duration-200 hover:bg-panel shadow-soft"><dt className="font-medium text-primary">Can I use my own domain?</dt><dd className="mt-1 text-sm text-secondary">Yes. We set up and manage DNS and SSL so your site is secure on your domain.</dd></div>
          <div className="rounded-3xl border border-soft bg-white p-4 transition-colors duration-200 hover:bg-panel shadow-soft"><dt className="font-medium text-primary">How fast is the turnaround?</dt><dd className="mt-1 text-sm text-secondary">An initial version is typically ready within a few days, with refinements following.</dd></div>
        </dl>
      </section>

      {/* CTA */}
      <section className="mt-12 md:mt-16">
        <div className="rounded-3xl border border-soft bg-white p-6 md:p-8 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] text-center">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-primary">Ready to launch your website?</h2>
          <p className="mt-2 text-sm md:text-base text-secondary">Start your monthly plan—no long‑term contracts.</p>
          <div className="mt-4">
            <Link href="/get-started" className="inline-flex items-center justify-center px-4 py-2.5 rounded-full font-semibold bg-accent-primary text-white shadow-[0_6px_20px_rgba(217,119,89,0.18)] transition-all hover:brightness-95 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(217,119,89,0.22)]">
              Get started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
