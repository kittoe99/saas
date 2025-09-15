"use client";
import VectorArt from "./components/VectorArt";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Words to animate in the hero headline
const PHRASES = [
  "website design",
  "managed hosting",
  "monthly updates",
  "priority support",
] as const;

const SECTION_IDS = ["showcase", "create", "features", "faq"] as const;

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

type ShowcaseCategory = typeof SHOWCASE_TEASER[number]["category"];
const SHOWCASE_TABS: ("All" | ShowcaseCategory)[] = [
  "All",
  "Wellness",
  "Outdoors",
  "Hospitality",
  "Professional Services",
  "Creative",
  "Nonprofit",
];

// Local component to render tabs + grid with filtering, limited to 3 columns on md+
function ShowcaseSection() {
  const [category, setCategory] = useState<"All" | ShowcaseCategory>("All");
  const items = useMemo(
    () => SHOWCASE_TEASER.filter((s) => category === "All" || s.category === category),
    [category]
  );
  return (
    <div>
      {/* Filter tabs (match sticky section tabs) */}
      <div className="mt-3 flex justify-center">
        <div
          className="inline-flex max-w-full overflow-x-auto no-scrollbar gap-1 sm:gap-1.5 rounded-full bg-white px-1.5 py-1 text-base sm:text-xs text-neutral-800 whitespace-nowrap snap-x snap-mandatory ring-0 outline-none focus:outline-none"
          role="tablist"
          aria-label="Showcase filters"
        >
          {SHOWCASE_TABS.map((tab) => {
            const isActive = category === tab;
            return (
              <a
                key={tab}
                href="#"
                onClick={(e) => { e.preventDefault(); setCategory(tab); }}
                className={
                  (isActive
                    ? "border-[color:var(--panel)] text-success-ink bg-panel font-medium"
                    : "border-transparent text-neutral-800 hover:text-success-ink hover:bg-success-accent/10") +
                  " px-2 sm:px-2.5 py-[3px] rounded-full border outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-success-accent focus-visible:ring-offset-[color:var(--panel)] transition-all duration-200 snap-start"
                }
                role="tab"
                aria-selected={isActive}
              >
                {tab}
              </a>
            );
          })}
        </div>
      </div>
      {/* Grid limited to 3 columns on md+ */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {items.map((s) => (
          <a key={s.title} href="/showcase" className="group rounded-md border border-neutral-200 bg-white overflow-hidden transition-all duration-300 hover:border-success-accent/30">
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
              <div className="text-[13px] font-medium text-neutral-900 truncate transition-colors duration-200 group-hover:text-success-ink" title={s.title}>
                {s.title}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

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
      <section className="relative grid md:grid-cols-2 gap-10 items-start p-6 md:p-10 rounded-xl border border-soft bg-white shadow-soft">
        {/* Soft background accent */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(26,115,232,0.06),transparent_60%),radial-gradient(1000px_500px_at_90%_110%,rgba(26,115,232,0.05),transparent_60%)]" />

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-xs text-neutral-600 shadow-xs backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-accent" /> No setup fees • Cancel anytime
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-primary">
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
          <p className="mt-4 text-secondary text-base md:text-lg max-w-xl">Launch a professional site without large upfront costs. One simple monthly plan covers design, hosting, updates, and support—so you can focus on your business.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a href="/get-started" className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-accent-primary text-white text-sm md:text-base font-medium transition-all duration-200 hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary">
              Get started
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2 h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
            <a href="#features" className="inline-flex items-center justify-center px-5 py-3 rounded-lg border border-soft text-accent-primary bg-white text-sm md:text-base gap-2 transition-all duration-200 hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary">
              See what’s included
            </a>
          </div>
          <div className="mt-3 text-xs text-tertiary">All essentials covered. Simple pricing, no surprises.</div>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-secondary max-w-2xl">
            <li className="flex items-center gap-2"><svg className="h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span>Design + build included</span></li>
            <li className="flex items-center gap-2"><svg className="h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span>Managed hosting & SSL</span></li>
            <li className="flex items-center gap-2"><svg className="h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg><span>Monthly content updates</span></li>
          </ul>
        </div>
        {/* Hero visual */}
        <div className="group relative h-[300px] sm:h-[380px] border border-soft rounded-xl overflow-hidden bg-panel shadow-soft hover:shadow-hover transition-shadow duration-300">
          <div aria-hidden className="absolute -right-10 -top-10 h-60 w-60 rounded-full bg-accent-subtle blur-2xl" />
          <VectorArt
            variant="dashboard"
            className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:-translate-y-0.5"
            aria-label="Website design preview"
          />
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs text-secondary shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" /> Live preview
          </div>
        </div>
      </section>

      {/* Centered tabs that scroll to sections (sticky + active highlighting) */}
      <div className="sticky top-16 md:top-20 z-30 mt-14">
        <div className="flex justify-center">
          <div
            className="inline-flex max-w-full overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 rounded-full bg-white px-2 py-2 text-lg sm:text-lg md:text-lg text-neutral-800 whitespace-nowrap snap-x snap-mandatory ring-0 outline-none focus:outline-none shadow-soft shadow-hover lg:shadow-none"
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
                        ? "border-[color:var(--panel)] text-success-ink bg-panel font-medium"
                        : "border-transparent text-neutral-800 hover:text-success-ink hover:bg-success-accent/10") +
                      " px-3 sm:px-4 py-1.5 rounded-full border outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent focus-visible:ring-offset-[color:var(--panel)] transition-all duration-200 snap-start"
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
      {/* Showcase teaser */}
      <section id="showcase" className="scroll-mt-24 mt-12 md:mt-16">
        <div className="max-w-5xl mx-auto px-2.5 md:px-4">
        <header className="mb-3 md:mb-4 text-center">
          <div className="text-xs uppercase tracking-wider text-tertiary">Showcase</div>
          <h2 className="mt-1 text-[18px] md:text-xl font-semibold tracking-tight text-primary">Selected work</h2>
          <p className="mt-1 text-sm text-secondary max-w-2xl mx-auto">Fast and responsive websites.</p>
        </header>
        <ShowcaseSection />
        </div>
      </section>

      {/* Create */}
      <section id="create" className="scroll-mt-24 mt-16 md:mt-24">
        <header className="mb-8 md:mb-10">
          <div className="text-xs uppercase tracking-wider text-tertiary">Create</div>
          <h2 className="mt-1 text-2xl md:text-4xl font-semibold tracking-tight text-primary">Launch a professional site without code</h2>
          <p className="mt-2 text-secondary max-w-2xl">We handle structure, visuals, and monthly content updates so you can focus on your business. Everything is responsive and easy to evolve.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-start">
          <div className="group relative h-52 sm:h-64 md:h-[360px] border border-soft rounded-xl overflow-hidden bg-panel shadow-soft hover:shadow-hover transition-shadow duration-300">
            <VectorArt
              variant="builder"
              className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out group-hover:-translate-y-0.5"
              aria-label="Drag-and-drop site building"
            />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-primary">Highly engaging sites without programming skills</h3>
            <p className="mt-3 text-secondary">Easily create and edit your site with simple content updates each month. Everything looks great and scales perfectly on any device, plus it’s simple to move or resize elements.</p>
            <ul className="mt-4 text-sm text-secondary space-y-2">
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-accent-primary" /><span>Monthly content updates included</span></li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-accent-primary" /><span>Responsive layouts for all devices</span></li>
              <li className="flex items-start gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-accent-primary" /><span>No code required</span></li>
            </ul>
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-3 xl:items-center">
              <div className="w-full"><a href="/get-started" className="block w-full text-center px-4 py-2.5 rounded-lg bg-accent-primary text-white font-medium transition-all duration-200 hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary">Start monthly plan</a></div>
              <div className="w-full"><a href="#work" className="flex w-full items-center justify-center px-4 py-2.5 rounded-lg border border-soft text-accent-primary bg-white gap-2 font-medium transition-all duration-200 hover:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary"><span>View recent work</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></a></div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Features */}
      <section id="features" className="scroll-mt-24 mt-20 md:mt-28">
        <header className="mb-6 md:mb-8 text-center">
          <div className="text-xs uppercase tracking-wider text-tertiary">Features</div>
          <h2 className="mt-1 text-2xl md:text-4xl font-semibold tracking-tight text-primary">Everything you need to grow</h2>
          <p className="mt-2 text-secondary max-w-2xl mx-auto">From your website to sales automation and payments—built in, simple to use, and ready to scale.</p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
          <div id="features-website" className="group p-5 rounded-xl border border-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:border-accent-soft shadow-soft hover:shadow-hover">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-soft rounded-lg overflow-hidden bg-panel">
              <VectorArt variant="layout" className="absolute inset-0 h-full w-full" aria-label="Website feature preview" />
            </div>
            <div className="text-sm font-medium text-tertiary">Website</div>
            <h3 className="mt-2 text-lg font-semibold text-primary">Design, hosting, and updates</h3>
            <p className="mt-2 text-sm text-secondary">Launch fast with professional design and monthly updates included.</p>
            <div className="mt-3">
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-accent-primary hover:text-accent-hover transition-colors">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
          <div id="features-sales" className="group p-5 rounded-xl border border-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:border-accent-soft shadow-soft hover:shadow-hover">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-soft rounded-lg overflow-hidden bg-panel">
              <VectorArt variant="sales" className="absolute inset-0 h-full w-full" aria-label="Sales & automation preview" />
            </div>
            <div className="text-sm font-medium text-tertiary">Sales & Automation <span className="ml-2 inline-flex items-center rounded-full bg-accent-subtle text-accent-primary px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium">Coming soon</span></div>
            <h3 className="mt-2 text-lg font-semibold text-primary">Funnels, forms, workflows</h3>
            <p className="mt-2 text-sm text-secondary">Capture leads and automate follow‑ups without extra tools.</p>
            <div className="mt-3">
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-accent-primary hover:text-accent-hover transition-colors">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
          <div id="features-ai" className="group p-5 rounded-xl border border-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:border-accent-soft shadow-soft hover:shadow-hover">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-soft rounded-lg overflow-hidden bg-panel">
              <VectorArt variant="ai" className="absolute inset-0 h-full w-full" aria-label="AI features preview" />
            </div>
            <div className="text-sm font-medium text-tertiary">Artificial Intelligence <span className="ml-2 inline-flex items-center rounded-full bg-accent-subtle text-accent-primary px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium">Coming soon</span></div>
            <h3 className="mt-2 text-lg font-semibold text-primary">Content, insights, assistance</h3>
            <p className="mt-2 text-sm text-secondary">Speed up content, find insights, and get helpful suggestions.</p>
            <div className="mt-3">
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-accent-primary hover:text-accent-hover transition-colors">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
          <div id="features-payments" className="group p-5 rounded-xl border border-soft bg-white transition-all duration-300 hover:-translate-y-1 hover:border-accent-soft shadow-soft hover:shadow-hover">
            <div className="relative mb-3 sm:mb-4 h-32 md:h-36 border border-soft rounded-lg overflow-hidden bg-panel">
              <VectorArt variant="payments" className="absolute inset-0 h-full w-full" aria-label="Payments preview" />
            </div>
            <div className="text-sm font-medium text-tertiary">Payments <span className="ml-2 inline-flex items-center rounded-full bg-accent-subtle text-accent-primary px-2 py-0.5 text-[10px] uppercase tracking-wide font-medium">Coming soon</span></div>
            <h3 className="mt-2 text-lg font-semibold text-primary">Subscriptions & one‑time</h3>
            <p className="mt-2 text-sm text-secondary">Sell plans or services with simple, integrated checkout.</p>
            <div className="mt-3">
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-accent-primary hover:text-accent-hover transition-colors">
                Learn more
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 mt-20 md:mt-28">
        <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-primary">FAQ</h2>
        <dl className="mt-4 space-y-4">
          <div className="rounded-xl border border-soft bg-white p-4 transition-colors duration-200 hover:bg-panel shadow-soft hover:shadow-hover"><dt className="font-medium text-primary">What's included in the monthly plan?</dt><dd className="mt-1 text-sm text-secondary">Design, hosting, SSL, and monthly content updates with support.</dd></div>
          <div className="rounded-xl border border-soft bg-white p-4 transition-colors duration-200 hover:bg-panel shadow-soft hover:shadow-hover"><dt className="font-medium text-primary">Can I cancel anytime?</dt><dd className="mt-1 text-sm text-secondary">Yes, there are no long‑term contracts—you can cancel whenever you like.</dd></div>
          <div className="rounded-xl border border-soft bg-white p-4 transition-colors duration-200 hover:bg-panel shadow-soft hover:shadow-hover"><dt className="font-medium text-primary">Do you work with my existing brand?</dt><dd className="mt-1 text-sm text-secondary">We'll align the site with your brand and adjust layouts to fit your content.</dd></div>
        </dl>
      </section>

    </div>
  );
}
