"use client";
import React, { useState } from "react";
import Link from "next/link";
import ShowcaseSlider from "../components/ShowcaseSlider";

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
      {/* Hero (split layout) */}
      <section>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div className="text-center md:text-left">
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-primary">Custom High End Websites</h1>
            <p className="mt-3 text-sm md:text-base text-secondary">
              Professional, pay-by-month websites with stunning design, secure hosting, and ongoing updates included. Get back to what you do best—running your business.
            </p>
            <p className="mt-2 text-sm md:text-base text-secondary">
              We handle it all. One flat monthly fee covers everything you need for a powerful, professional online presence.
            </p>
            <div className="mt-5 flex items-center gap-3 justify-center md:justify-start">
              <Link href="/get-started" className="px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors hover:brightness-95">Get started</Link>
              <a href="#features" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">See features</a>
            </div>
          </div>
          <div className="relative h-48 md:h-64 rounded-3xl border border-soft shadow-soft overflow-hidden bg-white">
            <img
              src="/website-hero.svg"
              alt="Abstract website illustration"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* Key bullets as badges */}
      <section className="mt-8 md:mt-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              'No Hefty Upfront Cost',
              'Managed Hosting & SSL',
              'Always Up-to-date',
              'All-in-one Monthly Plan',
            ].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-800 ring-1 ring-neutral-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-accent-primary" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{t}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features (aligned two-column media list) */}
      <section id="features" className="mt-10 md:mt-14">
        <div id="features-list" className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5 md:gap-6">
          {visible.map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-soft bg-white p-4 shadow-soft">
              <div className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-accent-subtle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-accent-primary" aria-hidden>
                  {item.icon}
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold tracking-tight text-primary">{item.title}</h3>
                <p className="mt-1 text-sm text-secondary">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
            aria-expanded={showAll}
            aria-controls="features-list"
          >
            {showAll ? 'Show fewer' : 'Show all features'}
          </button>
        </div>
      </section>

      {/* Deep Understanding (main heading band) */}
      <section className="mt-12 md:mt-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-8 md:py-10">
          <header className="mb-6 md:mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-primary">Not Just a Website. A Growth Partner Powered by AI.</h2>
          </header>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Content Intelligence', desc: 'AI helps us craft headlines and page copy that are proven to convert.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />) },
              { title: 'Competitor Analysis', desc: 'We use AI to scan your industry and identify opportunities to outperform your competition.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />) },
              { title: 'SEO Insight Generation', desc: 'Get data-driven keyword and topic suggestions to attract more organic traffic.', icon: (<><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" /></>) },
              { title: 'User Behavior Prediction', desc: 'Our designs are informed by AI-driven UX principles for maximum engagement.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />) },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white ring-1 ring-neutral-200">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-accent-primary" aria-hidden>
                    {f.icon}
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-primary">{f.title}</div>
                  <p className="mt-1 text-sm text-secondary">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {/* Showcase (same design as homepage) */}
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

      {/* FAQ (polished two-column accordion) */}
      <section id="faq" className="scroll-mt-24 mt-12 md:mt-16">
        <header className="mb-6 md:mb-8 text-center">
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary">Frequently asked questions</h2>
          <p className="mt-2 text-sm md:text-base text-secondary max-w-2xl mx-auto">If you have other questions, reach out—we’re happy to help.</p>
        </header>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
          {FAQS.slice(0, 6).map((item, i) => (
            <details key={item.q} open={i === 0} className="group rounded-2xl border border-soft bg-white p-4 shadow-soft">
              <summary className="flex items-start justify-between cursor-pointer select-none">
                <div className="flex items-start gap-3 pr-4">
                  <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent-subtle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-accent-primary" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 9h.01M8 13a6 6 0 108 0" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-primary">{item.q}</span>
                </div>
                <span className="ml-3 mt-1 text-neutral-400 transition-transform group-open:rotate-180" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
                </span>
              </summary>
              <p className="mt-2 text-sm text-secondary">{item.a}</p>
            </details>
          ))}
          <div className="md:col-span-2 text-center text-sm text-neutral-700">
            Still need help? <Link href="/contact" className="text-accent-primary hover:underline">Contact us</Link>
          </div>
        </div>
      </section>

      {/* Final CTA (light band) */}
      <section className="mt-12 md:mt-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 text-center">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-primary">Ready to get started?</h2>
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
