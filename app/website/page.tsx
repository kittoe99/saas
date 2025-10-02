"use client";
import React, { useState } from "react";
import Link from "next/link";

const ALL_FEATURES = [
  { title: 'AI-Powered Strategy', desc: 'We use AI to analyze your competitors and market to inform a data-driven site structure and content strategy that attracts your ideal customers.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />) },
  { title: '100% Custom Design', desc: 'Your brand is unique. Your website should be too. No cookie-cutter templates. Just stunning, original design that makes you stand out.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />) },
  { title: 'Expert Copywriting', desc: 'Compelling, SEO-friendly content that tells your story and persuades visitors to act, crafted by our team (with an AI assist for efficiency).', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 16h10M5 8h10" />) },
  { title: 'Mobile-First Development', desc: 'A flawless experience on every device—phone, tablet, and desktop. It’s not an extra; it’s our standard.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10M5 8h14M4 12h16M6 16h12" />) },
  { title: 'Blazing-Fast Hosting', desc: 'Your site lives on our secure, high-speed hosting platform. No slow loading times, no downtime worries.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 11h14M7 15h10M9 19h6" />) },
  { title: 'Ongoing Maintenance', desc: 'We handle all technical updates, security patches, and backups so your site is always safe and running smoothly.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />) },
  { title: 'Basic SEO Setup', desc: 'We optimize your site to rank higher on Google from day one, including on-page elements and technical SEO.', icon: (<><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" /></>) },
  { title: 'Monthly Updates', desc: 'Need to change text, add a blog post, or update a photo? We include a set number of changes every month.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />) },
  { title: 'Dedicated Support', desc: 'Have a question? Get help from a real person who knows your site inside and out.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />) },
];

const FAQS = [
  {
    q: "How quickly can you launch my website?",
    a: "Most small business sites launch in 2–4 weeks depending on scope and assets. We’ll align on a timeline at kickoff.",
  },
  {
    q: "What’s included in monthly updates?",
    a: "Content edits, image swaps, adding new sections/pages within plan limits, and iterative improvements to design and UX.",
  },
  {
    q: "Can I use my existing domain and email?",
    a: "Yes. We connect and manage your DNS and SSL. Your email stays where it is; we’ll help make sure it keeps working.",
  },
  {
    q: "Do you migrate content from my old site?",
    a: "We can migrate key pages and assets as part of setup. Larger migrations can be scoped as an add‑on.",
  },
  {
    q: "Who owns the content and domain?",
    a: "You do. Your brand assets, copy, media, and domain remain yours. We manage hosting and updates for you.",
  },
  {
    q: "Do you support ecommerce?",
    a: "Yes. Our Ecommerce / Large Businesses plan is designed for stores and growing operations. We’ll recommend the right stack.",
  },
  {
    q: "Is there a long‑term contract or setup fee?",
    a: "No long‑term contract and no setup fee. It’s a monthly subscription you can cancel anytime.",
  },
];

export default function WebsitePage() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? ALL_FEATURES : ALL_FEATURES.slice(0, 3);
  return (
    <div className="py-12 md:py-16">
      {/* Hero */}
      <section>
        <div className="max-w-3xl mx-auto text-center px-3 sm:px-4">
          <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-primary">Custom High End Websites</h1>
          <p className="mt-3 text-sm md:text-base text-secondary max-w-2xl mx-auto">
            Professional, pay-by-month websites with stunning design, secure hosting, and ongoing updates included. Get back to what you do best—running your business.
          </p>
          <p className="mt-2 text-sm md:text-base text-secondary max-w-3xl mx-auto">
            We handle it all. One flat monthly fee covers everything you need for a powerful, professional online presence.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link href="/get-started" className="px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors hover:brightness-95">Get started</Link>
            <a href="#features" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">See features</a>
            <Link href="/showcase" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">Showcase</Link>
          </div>
        </div>
      </section>

      {/* Key bullets */}
      <section className="mt-8 md:mt-12">
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <ul className="grid gap-3 text-sm text-secondary">
            {[
              'No Hefty Upfront Cost: Get a premium website without a five-figure investment.',
              'No Technical Nightmares: We handle all the hosting, security, and updates.',
              'No Getting Left Behind: Your site evolves with the latest tech and trends.',
              'Everything You Need, All in One Plan',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-subtle text-accent-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span className="text-neutral-800">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="mt-10 md:mt-14">
        <div id="features-grid" className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {visible.map((item) => (
            <div key={item.title} className="rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] transition-all">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-subtle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-accent-primary" aria-hidden>
                  {item.icon}
                </svg>
              </div>
              <h3 className="mt-3 text-base font-semibold tracking-tight text-primary">{item.title}</h3>
              <p className="mt-1 text-sm text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
            aria-expanded={showAll}
            aria-controls="features-grid"
          >
            {showAll ? 'Show fewer' : 'Show all features'}
          </button>
        </div>
      </section>

      {/* AI growth partner */}
      <section className="mt-10 md:mt-14 rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]">
        <h2 className="text-base font-semibold tracking-tight text-primary">Not Just a Website. A Growth Partner Powered by AI.</h2>
        <p className="mt-3 text-sm text-secondary">We leverage cutting-edge artificial intelligence to build smarter, faster, and more effective websites.</p>
        <ul className="mt-4 grid md:grid-cols-2 gap-3 text-sm text-secondary">
          {[
            'Content Intelligence: AI helps us craft headlines and page copy that are proven to convert.',
            'Competitor Analysis: We use AI to scan your industry and identify opportunities to outperform your competition.',
            'SEO Insight Generation: Get data-driven keyword and topic suggestions to attract more organic traffic.',
            'User Behavior Prediction: Our designs are informed by AI-driven UX principles for maximum engagement.',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-subtle text-accent-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </span>
              <span className="text-neutral-800">{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 mt-12 md:mt-16">
        <header className="mb-6 md:mb-8 text-center">
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary">Simple monthly pricing</h2>
          <p className="mt-2 text-sm md:text-base text-secondary max-w-2xl mx-auto">One flat monthly fee covers design, hosting, updates, and support.</p>
        </header>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { name: 'Small Businesses', price: '$59/mo', features: ['4 pages', 'Managed hosting & SSL', 'Monthly updates'] },
            { name: 'Ecommerce / Large Businesses', price: '$99/mo', features: ['Up to 10 pages', 'Priority updates', 'On-page SEO'] },
            { name: 'Large Businesses/Startups', price: '$169/mo', features: ['Unlimited pages', 'Custom components', 'Priority support'] },
          ].map((tier) => (
            <div key={tier.name} className="rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]">
              <div className="flex items-baseline justify-between">
                <div className="text-base font-semibold text-primary">{tier.name}</div>
                <div className="text-primary font-semibold">{tier.price}</div>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-secondary">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-accent-primary mt-0.5" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link href="/get-started" className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm transition-colors hover:brightness-95">
                  Get Started
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 mt-12 md:mt-16">
        <header className="mb-6 md:mb-8 text-center">
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary">Frequently asked questions</h2>
          <p className="mt-2 text-sm md:text-base text-secondary max-w-2xl mx-auto">If you have other questions, reach out—we’re happy to help.</p>
        </header>
        <div className="max-w-3xl mx-auto grid gap-3">
          {FAQS.slice(0, 6).map((item) => (
            <details key={item.q} className="rounded-xl border border-neutral-200 bg-white p-4">
              <summary className="cursor-pointer select-none text-sm font-medium text-primary">{item.q}</summary>
              <p className="mt-2 text-sm text-secondary">{item.a}</p>
            </details>
          ))}
          <div className="text-center text-sm text-neutral-700">
            Still need help? <Link href="/contact" className="text-accent-primary hover:underline">Contact us</Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mt-12 md:mt-16">
        <div className="max-w-3xl mx-auto text-center rounded-3xl border border-soft bg-white p-6 shadow-soft">
          <h2 className="text-base font-semibold tracking-tight text-primary">Ready to get started?</h2>
          <p className="mt-2 text-sm md:text-base text-secondary">Talk to us about your goals—we’ll recommend the right plan and next steps.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/get-started" className="px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors hover:brightness-95">Start now</Link>
            <Link href="/contact" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">Contact us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
