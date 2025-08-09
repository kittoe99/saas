"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const sectionIds = ["create", "design", "features", "testimonial", "faq"] as const;
  type SectionId = typeof sectionIds[number];
  const [activeId, setActiveId] = useState<SectionId>("create");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most visible entry
        let topEntry: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (!topEntry || e.intersectionRatio > topEntry.intersectionRatio) {
            topEntry = e;
          }
        }
        if (topEntry && topEntry.isIntersecting) {
          const id = topEntry.target.getAttribute("id") as SectionId | null;
          if (id && sectionIds.includes(id)) setActiveId(id);
        }
      },
      {
        // Activate when a section enters the middle band of the viewport
        root: null,
        rootMargin: "-25% 0px -65% 0px",
        threshold: [0.15, 0.4, 0.8],
      }
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <div className="py-10 md:py-16">
      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-10 items-start p-6 md:p-10 rounded-2xl border border-neutral-200 bg-neutral-50">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Pay‑by‑month, all‑inclusive website design</h1>
          <p className="mt-4 text-neutral-600 text-base md:text-lg">Launch a professional site without large upfront costs. One simple monthly plan covers design, hosting, updates, and support—so you can focus on your business.</p>
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-3">
            <a href="#get-started" className="block w-full text-center px-4 py-2.5 rounded-md bg-[#1a73e8] text-white">Start monthly plan</a>
            <a href="#contact" className="flex w-full items-center justify-center px-4 py-2.5 rounded-md border border-[#1a73e8] text-[#1a73e8] bg-white gap-2">
              <span>See what’s included</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="mt-2 text-xs text-neutral-500">No long‑term contracts. Cancel anytime.</div>
          <ul className="mt-6 text-sm text-neutral-700 grid sm:grid-cols-2 gap-y-2 gap-x-6">
            <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#1a73e8]" /><span>Design + build included</span></li>
            <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#1a73e8]" /><span>Managed hosting & SSL</span></li>
            <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#1a73e8]" /><span>Content updates every month</span></li>
            <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#1a73e8]" /><span>Priority support</span></li>
          </ul>
        </div>
        {/* Hero image */}
        <div className="relative h-[300px] sm:h-[360px] border border-neutral-200 rounded-xl overflow-hidden bg-white">
          <Image
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop"
            alt="Website design preview"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>
      {/* Centered tabs that scroll to sections (sticky + active highlighting) */}
      <div className="sticky top-16 md:top-20 z-30 mt-14">
        <div className="flex justify-center">
          <div
            className="inline-flex max-w-full overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 rounded-full border border-neutral-200 bg-white px-2 py-2 text-sm sm:text-base md:text-lg text-neutral-800 shadow-sm whitespace-nowrap snap-x snap-mandatory"
            role="tablist"
            aria-label="Section tabs"
          >
              {sectionIds.map((id) => {
                const label = id.charAt(0).toUpperCase() + id.slice(1);
                const isActive = activeId === id;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={
                      (isActive
                        ? "border border-[#1a73e8] text-[#1a73e8] bg-white font-medium"
                        : "text-neutral-800 hover:text-[#1a73e8] hover:bg-neutral-50") +
                      " px-3 sm:px-4 py-1.5 rounded-full focus:outline-none snap-start"
                    }
                    aria-current={isActive ? "true" : undefined}
                    role="tab"
                    onClick={() => setActiveId(id)}
                  >
                    {label}
                  </a>
                );
              })}
          </div>
        </div>
      </div>

      {/* Create */}
      <section id="create" className="scroll-mt-24 mt-16 md:mt-24">
        <header className="mb-8 md:mb-10">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Create</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">Launch a professional site without code</h2>
          <p className="mt-2 text-neutral-600 max-w-2xl">We handle structure, visuals, and monthly content updates so you can focus on your business. Everything is responsive and easy to evolve.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
          <div className="relative h-52 sm:h-64 md:h-[360px] border border-neutral-200 rounded-xl overflow-hidden bg-white">
            <Image src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop" alt="Drag-and-drop site building" fill className="object-cover" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">Highly engaging sites without programming skills</h3>
            <p className="mt-3 text-neutral-600">Easily create and edit your site with simple content updates each month. Everything looks great and scales perfectly on any device, plus it’s simple to move or resize elements.</p>
            <ul className="mt-4 text-sm text-neutral-700 space-y-2">
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#1a73e8]" /><span>Monthly content updates included</span></li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#1a73e8]" /><span>Responsive layouts for all devices</span></li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-[#1a73e8]" /><span>No code required</span></li>
            </ul>
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-3 xl:items-center">
              <div className="w-full"><a href="#get-started" className="block w-full text-center px-4 py-2.5 rounded-md bg-[#1a73e8] text-white">Start monthly plan</a></div>
              <div className="w-full"><a href="#work" className="flex w-full items-center justify-center px-4 py-2.5 rounded-md border border-[#1a73e8] text-[#1a73e8] bg-white gap-2"><span>View recent work</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></a></div>
            </div>
          </div>
        </div>
      </section>

      {/* Design */}
      <section id="design" className="scroll-mt-24 mt-20 md:mt-28">
        <header className="mb-6 md:mb-8 text-center">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Design</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">Thoughtful, consistent design system</h2>
          <p className="mt-2 text-neutral-600 max-w-2xl mx-auto">Clean layouts, reusable components, and clear hierarchy ensure a polished experience across every page.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="p-5 rounded-xl border border-neutral-200 bg-white">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <Image src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop" alt="Clean, modern layouts preview" fill className="object-cover" />
            </div>
            <div className="text-sm font-medium text-neutral-500">Design</div>
            <h3 className="mt-2 text-lg font-semibold">Clean, modern layouts</h3>
            <p className="mt-2 text-sm text-neutral-600">Professional design tailored to your brand with clear hierarchy and polished details.</p>
          </div>
          <div className="p-5 rounded-xl border border-neutral-200 bg-white">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <Image src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1600&auto=format&fit=crop" alt="Monthly content improvements preview" fill className="object-cover" />
            </div>
            <div className="text-sm font-medium text-neutral-500">Content</div>
            <h3 className="mt-2 text-lg font-semibold">Monthly improvements</h3>
            <p className="mt-2 text-sm text-neutral-600">We handle ongoing tweaks and updates so the site stays fresh and accurate.</p>
          </div>
          <div className="p-5 rounded-xl border border-neutral-200 bg-white">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <Image src="https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1600&auto=format&fit=crop" alt="Reusable components preview" fill className="object-cover" />
            </div>
            <div className="text-sm font-medium text-neutral-500">Components</div>
            <h3 className="mt-2 text-lg font-semibold">Reusable sections</h3>
            <p className="mt-2 text-sm text-neutral-600">Thoughtful building blocks that make pages consistent and easy to extend.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 mt-20 md:mt-28">
        <header className="mb-6 md:mb-8 text-center">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Features</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">Everything you need to grow</h2>
          <p className="mt-2 text-neutral-600 max-w-2xl mx-auto">From your website to sales automation and payments—built in, simple to use, and ready to scale.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
          <div id="features-website" className="p-5 rounded-xl border border-neutral-200 bg-white">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <Image src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop" alt="Website feature preview" fill className="object-cover" />
            </div>
            <div className="text-sm font-medium text-neutral-500">Website</div>
            <h3 className="mt-2 text-lg font-semibold">Design, hosting, and updates</h3>
            <p className="mt-2 text-sm text-neutral-600">Launch fast with professional design and monthly updates included.</p>
          </div>
          <div id="features-sales" className="p-5 rounded-xl border border-neutral-200 bg-white">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <Image src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1600&auto=format&fit=crop" alt="Sales & automation preview" fill className="object-cover" />
            </div>
            <div className="text-sm font-medium text-neutral-500">Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
            <h3 className="mt-2 text-lg font-semibold">Funnels, forms, workflows</h3>
            <p className="mt-2 text-sm text-neutral-600">Capture leads and automate follow‑ups without extra tools.</p>
          </div>
          <div id="features-ai" className="p-5 rounded-xl border border-neutral-200 bg-white">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <Image src="https://images.unsplash.com/photo-1555949963-aa79dcee981d?q=80&w=1600&auto=format&fit=crop" alt="AI features preview" fill className="object-cover" />
            </div>
            <div className="text-sm font-medium text-neutral-500">Artificial Intelligence <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
            <h3 className="mt-2 text-lg font-semibold">Content, insights, assistance</h3>
            <p className="mt-2 text-sm text-neutral-600">Speed up content, find insights, and get helpful suggestions.</p>
          </div>
          <div id="features-payments" className="p-5 rounded-xl border border-neutral-200 bg-white">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <Image src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop" alt="Payments preview" fill className="object-cover" />
            </div>
            <div className="text-sm font-medium text-neutral-500">Payments <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
            <h3 className="mt-2 text-lg font-semibold">Subscriptions & one‑time</h3>
            <p className="mt-2 text-sm text-neutral-600">Sell plans or services with simple, integrated checkout.</p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section id="testimonial" className="scroll-mt-24 mt-20 md:mt-28">
        <header className="mb-6 md:mb-8 text-center">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Testimonial</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">What our clients say</h2>
        </header>
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-12 w-12 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
              <Image src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop" alt="Client avatar" fill className="object-cover" />
            </div>
            <div>
              <p className="text-neutral-700">“They delivered a beautiful site and keep it updated every month. It’s hands‑off for us and always looks great.”</p>
              <div className="mt-3 text-sm text-neutral-500">— Happy Client, Founder</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 mt-20 md:mt-28">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">FAQ</h2>
        <dl className="mt-4 space-y-4">
          <div className="rounded-md border border-neutral-200 bg-white p-4"><dt className="font-medium">What’s included in the monthly plan?</dt><dd className="mt-1 text-sm text-neutral-600">Design, hosting, SSL, and monthly content updates with support.</dd></div>
          <div className="rounded-md border border-neutral-200 bg-white p-4"><dt className="font-medium">Can I cancel anytime?</dt><dd className="mt-1 text-sm text-neutral-600">Yes, there are no long‑term contracts—you can cancel whenever you like.</dd></div>
          <div className="rounded-md border border-neutral-200 bg-white p-4"><dt className="font-medium">Do you work with my existing brand?</dt><dd className="mt-1 text-sm text-neutral-600">We’ll align the site with your brand and adjust layouts to fit your content.</dd></div>
        </dl>
      </section>
    </div>
  );
}
