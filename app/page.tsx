"use client";
import VectorArt from "./components/VectorArt";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

// Words to animate in the hero headline
const PHRASES = [
  "website design",
  "managed hosting",
  "monthly updates",
  "priority support",
] as const;

const SECTION_IDS = ["create", "design", "features", "testimonial", "faq"] as const;

// Showcase teaser (optimized images)
const SHOWCASE_TEASER = [
  {
    title: "Aurora Fitness",
    category: "Wellness",
    src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Summit Outdoors",
    category: "Outdoors",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Bluegrain Coffee Co.",
    category: "Hospitality",
    src: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Northstar Consulting",
    category: "Professional Services",
    src: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Crescent Studio",
    category: "Creative",
    src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Evergreen Nonprofit",
    category: "Nonprofit",
    src: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop",
  },
] as const;

export default function Home() {
  type SectionId = typeof SECTION_IDS[number];
  const [activeId, setActiveId] = useState<SectionId>("create");
  const [typedText, setTypedText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReduced, setIsReduced] = useState(false);
  const longestPhrase = useMemo(() =>
    [...PHRASES].sort((a, b) => b.length - a.length)[0]
  , []);

  useEffect(() => {
    // Respect reduced motion preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handle = () => setIsReduced(mq.matches);
    handle();
    mq.addEventListener?.("change", handle);
    return () => mq.removeEventListener?.("change", handle);
  }, []);

  useEffect(() => {
    if (isReduced) {
      // Static text if user prefers reduced motion
      setTypedText(PHRASES[0]);
      return;
    }

    const current = PHRASES[phraseIndex % PHRASES.length];
    const typingSpeed = isDeleting ? 40 : 90; // ms per char
    const pauseAtFull = 1200; // hold time when a word completes
    const pauseAtEmpty = 400; // slight delay before next word

    let timer: number;

    if (!isDeleting && typedText === current) {
      // Pause at full word, then start deleting
      timer = window.setTimeout(() => setIsDeleting(true), pauseAtFull);
    } else if (isDeleting && typedText === "") {
      // Pause at empty, then move to next word
      timer = window.setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((i) => (i + 1) % PHRASES.length);
      }, pauseAtEmpty);
    } else {
      timer = window.setTimeout(() => {
        const next = isDeleting
          ? current.slice(0, typedText.length - 1)
          : current.slice(0, typedText.length + 1);
        setTypedText(next);
      }, typingSpeed);
    }

    return () => window.clearTimeout(timer);
  }, [typedText, isDeleting, phraseIndex, isReduced]);

  useEffect(() => {
    // Real-time scroll spy: pick the section closest to a viewport center band
    const elements = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    let ticking = false;

    const computeActive = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // Choose a center band around ~35% of the viewport (aligns with sticky tabs position)
      const centerY = vh * 0.35;
      let bestId: SectionId | null = null;
      let bestDist = Number.POSITIVE_INFINITY;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        // Distance from section top to our center line
        const dist = Math.abs(rect.top - centerY);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = (el.getAttribute("id") as SectionId) ?? null;
        }
      }

      if (bestId && bestId !== activeId) {
        setActiveId(bestId);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          computeActive();
          ticking = false;
        });
      }
    };

    // Initialize and bind
    computeActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll as EventListener);
      window.removeEventListener("resize", onScroll as EventListener);
    };
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="py-10 md:py-16">
      {/* Hero */}
      <section className="relative grid md:grid-cols-2 gap-10 items-start p-6 md:p-10 rounded-2xl border border-soft bg-panel shadow-soft shadow-hover">
        {/* Soft background accent */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(26,115,232,0.06),transparent_60%),radial-gradient(1000px_500px_at_90%_110%,rgba(26,115,232,0.05),transparent_60%)]" />

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-xs text-neutral-600 shadow-xs backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-accent" /> No setup fees • Cancel anytime
          </div>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Pay‑by‑month, all‑inclusive
            {/* Reserve height with invisible placeholder to prevent layout shift */}
            <span className="block relative">
              <span className="opacity-0 select-none" aria-hidden="true">{longestPhrase}</span>
              <span className="absolute inset-0 text-success-ink whitespace-nowrap">
                {typedText}
                <span className="type-caret align-[-0.1em]" aria-hidden="true" />
              </span>
            </span>
          </h1>
          <p className="mt-4 text-neutral-700 text-lg md:text-xl max-w-xl">Launch a professional site without large upfront costs. One simple monthly plan covers design, hosting, updates, and support—so you can focus on your business.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="/get-started" className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-success-accent text-white text-sm md:text-base font-medium transition-all duration-200 hover:opacity-90 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent">
              Get started
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a href="#features" className="inline-flex items-center justify-center px-5 py-3 rounded-md border border-success text-success-ink bg-white text-sm md:text-base gap-2 transition-all duration-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent shadow-soft shadow-hover">
              See what’s included
            </a>
          </div>
          <div className="mt-3 text-xs text-neutral-500">All essentials covered. Simple pricing, no surprises.</div>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-neutral-700 max-w-2xl">
            <li className="flex items-center gap-2"><svg className="h-4 w-4 text-success-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span>Design + build included</span></li>
            <li className="flex items-center gap-2"><svg className="h-4 w-4 text-success-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span>Managed hosting & SSL</span></li>
            <li className="flex items-center gap-2"><svg className="h-4 w-4 text-success-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span>Monthly content updates</span></li>
          </ul>
        </div>
        {/* Hero visual */}
        <div className="group relative h-[300px] sm:h-[380px] border border-neutral-200 rounded-xl overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-50 via-[var(--panel)] to-neutral-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-300 shadow-soft shadow-hover">
          <div aria-hidden className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-success-accent/10 blur-2xl" />
          <VectorArt
            variant="dashboard"
            className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:-translate-y-0.5"
            aria-label="Website design preview"
          />
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs text-neutral-700 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success-accent" /> Live preview
          </div>
        </div>
      </section>

      {/* Showcase teaser */}
      <section id="showcase" className="scroll-mt-24 mt-12 md:mt-16">
        <div className="max-w-6xl mx-auto px-2.5 md:px-4">
        <header className="mb-3 md:mb-4 text-center">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Showcase</div>
          <h2 className="mt-1 text-[17px] md:text-xl font-semibold tracking-tight">Selected work</h2>
          <p className="mt-1 text-xs text-neutral-600 max-w-2xl mx-auto">Fast and responsive websites.</p>
        </header>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:[grid-template-columns:repeat(auto-fit,minmax(200px,260px))] sm:justify-center">
          {SHOWCASE_TEASER.map((s) => (
            <a key={s.title} href="/showcase" className="group rounded-md border border-soft bg-panel overflow-hidden transition-all duration-300 shadow-soft hover:shadow-md hover:border-success-accent/30">
              <div className="relative h-24 sm:h-24 md:h-28 bg-neutral-200">
                <Image
                  src={s.src}
                  alt={s.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={false}
                  className="object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.03]"
                />
                {/* subtle overlay on hover */}
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </div>
              <div className="p-2.5">
                {/* Hide category for tighter layout or make it tiny if desired */}
                {/* <div className="text-[10px] uppercase tracking-wide text-neutral-500">{s.category}</div> */}
                <div className="text-[13px] font-medium text-neutral-900 truncate transition-colors duration-200 group-hover:text-success-ink" title={s.title}>
                  {s.title}
                </div>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-4 md:mt-6 flex justify-center">
          <a href="/showcase" className="px-2.5 py-1.5 rounded-md border border-success text-success-ink bg-white text-xs inline-flex items-center gap-1.5 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent shadow-soft">
            <span>Explore showcase</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </a>
        </div>
        </div>
      </section>
      {/* Centered tabs that scroll to sections (sticky + active highlighting) */}
      <div className="sticky top-16 md:top-20 z-30 mt-14">
        <div className="flex justify-center">
          <div
            className="inline-flex max-w-full overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 rounded-full border border-soft bg-panel px-2 py-2 text-sm sm:text-base md:text-lg text-neutral-800 shadow-soft shadow-hover whitespace-nowrap snap-x snap-mandatory ring-0 outline-none focus:outline-none"
            role="tablist"
            aria-label="Section tabs"
          >
              {SECTION_IDS.map((id) => {
                const label = id.charAt(0).toUpperCase() + id.slice(1);
                const isActive = activeId === id;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={
                      (isActive
                        ? "border-success text-success-ink bg-panel font-medium shadow-soft"
                        : "border-transparent text-neutral-800 hover:text-success-ink hover:bg-success-accent/10") +
                      " px-3 sm:px-4 py-1.5 rounded-full border outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent focus-visible:ring-offset-[color:var(--panel)] transition-all duration-200 hover:shadow-soft snap-start"
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
          <h2 className="mt-1 text-2xl md:text-4xl font-semibold tracking-tight">Launch a professional site without code</h2>
          <p className="mt-2 text-neutral-600 max-w-2xl">We handle structure, visuals, and monthly content updates so you can focus on your business. Everything is responsive and easy to evolve.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
          <div className="group relative h-52 sm:h-64 md:h-[360px] border border-neutral-200 rounded-xl overflow-hidden bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-50 via-[var(--panel)] to-neutral-50 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] transition-shadow duration-300 shadow-soft shadow-hover">
            <VectorArt
              variant="builder"
              className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:-translate-y-0.5"
              aria-label="Drag-and-drop site building"
            />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">Highly engaging sites without programming skills</h3>
            <p className="mt-3 text-neutral-600">Easily create and edit your site with simple content updates each month. Everything looks great and scales perfectly on any device, plus it’s simple to move or resize elements.</p>
            <ul className="mt-4 text-sm text-neutral-700 space-y-2">
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-success-accent" /><span>Monthly content updates included</span></li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-success-accent" /><span>Responsive layouts for all devices</span></li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-success-accent" /><span>No code required</span></li>
            </ul>
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-3 xl:items-center">
              <div className="w-full"><a href="/get-started" className="block w-full text-center px-4 py-2.5 rounded-md bg-success-accent text-white transition-all duration-200 hover:opacity-90 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent">Start monthly plan</a></div>
              <div className="w-full"><a href="#work" className="flex w-full items-center justify-center px-4 py-2.5 rounded-md border border-success text-success-ink bg-white gap-2 transition-all duration-200 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent shadow-soft shadow-hover"><span>View recent work</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></a></div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Features */}
      <section id="features" className="scroll-mt-24 mt-20 md:mt-28">
        <header className="mb-6 md:mb-8 text-center">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Features</div>
          <h2 className="mt-1 text-2xl md:text-4xl font-semibold tracking-tight">Everything you need to grow</h2>
          <p className="mt-2 text-neutral-600 max-w-2xl mx-auto">From your website to sales automation and payments—built in, simple to use, and ready to scale.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
          <div id="features-website" className="group p-5 rounded-xl border border-soft bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-success-accent/30 shadow-soft shadow-hover">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <VectorArt variant="layout" className="absolute inset-0 h-full w-full" aria-label="Website feature preview" />
            </div>
            <div className="text-sm font-medium text-neutral-500">Website</div>
            <h3 className="mt-2 text-lg font-semibold">Design, hosting, and updates</h3>
            <p className="mt-2 text-sm text-neutral-600">Launch fast with professional design and monthly updates included.</p>
          </div>
          <div id="features-sales" className="group p-5 rounded-xl border border-soft bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-success-accent/30 shadow-soft shadow-hover">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <VectorArt variant="sales" className="absolute inset-0 h-full w-full" aria-label="Sales & automation preview" />
            </div>
            <div className="text-sm font-medium text-neutral-500">Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
            <h3 className="mt-2 text-lg font-semibold">Funnels, forms, workflows</h3>
            <p className="mt-2 text-sm text-neutral-600">Capture leads and automate follow‑ups without extra tools.</p>
          </div>
          <div id="features-ai" className="group p-5 rounded-xl border border-soft bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-success-accent/30 shadow-soft shadow-hover">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <VectorArt variant="ai" className="absolute inset-0 h-full w-full" aria-label="AI features preview" />
            </div>
            <div className="text-sm font-medium text-neutral-500">Artificial Intelligence <span className="ml-2 inline-flex items-center rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">Coming soon</span></div>
            <h3 className="mt-2 text-lg font-semibold">Content, insights, assistance</h3>
            <p className="mt-2 text-sm text-neutral-600">Speed up content, find insights, and get helpful suggestions.</p>
          </div>
          <div id="features-payments" className="group p-5 rounded-xl border border-soft bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-success-accent/30 shadow-soft shadow-hover">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <VectorArt variant="payments" className="absolute inset-0 h-full w-full" aria-label="Payments preview" />
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
          <h2 className="mt-1 text-2xl md:text-4xl font-semibold tracking-tight">What our clients say</h2>
        </header>
        <div className="rounded-xl border border-soft bg-panel p-6 shadow-soft shadow-hover">
          <div className="flex items-start gap-4">
            <div className="relative h-12 w-12 rounded-full overflow-hidden border border-neutral-200 bg-neutral-100 shrink-0">
              <VectorArt variant="avatar" className="absolute inset-0 h-full w-full" aria-label="Client avatar" />
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
        <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">FAQ</h2>
        <dl className="mt-4 space-y-4">
          <div className="rounded-md border border-soft bg-panel p-4 transition-colors duration-200 hover:bg-panel-hover shadow-soft shadow-hover"><dt className="font-medium">What’s included in the monthly plan?</dt><dd className="mt-1 text-sm text-neutral-600">Design, hosting, SSL, and monthly content updates with support.</dd></div>
          <div className="rounded-md border border-soft bg-panel p-4 transition-colors duration-200 hover:bg-panel-hover shadow-soft shadow-hover"><dt className="font-medium">Can I cancel anytime?</dt><dd className="mt-1 text-sm text-neutral-600">Yes, there are no long‑term contracts—you can cancel whenever you like.</dd></div>
          <div className="rounded-md border border-soft bg-panel p-4 transition-colors duration-200 hover:bg-panel-hover shadow-soft shadow-hover"><dt className="font-medium">Do you work with my existing brand?</dt><dd className="mt-1 text-sm text-neutral-600">We’ll align the site with your brand and adjust layouts to fit your content.</dd></div>
        </dl>
      </section>

    </div>
  );
}
