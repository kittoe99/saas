export const metadata = {
  title: "Showcase | Hinn.dev",
  description: "A selection of recent website builds and concept projects by Hinn.dev.",
};

import Link from "next/link";

// Sample showcase images (no people-focused shots). You can replace these with your own.
const categoryImages: Record<string, string> = {
  Wellness:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600&auto=format&fit=crop",
  Outdoors:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
  Hospitality:
    "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop",
  "Professional Services":
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
  Creative:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600&auto=format&fit=crop",
  Nonprofit:
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1600&auto=format&fit=crop",
};

const samples = [
  { title: "Aurora Fitness", href: "#", category: "Wellness" },
  { title: "Summit Outdoors", href: "#", category: "Outdoors" },
  { title: "Bluegrain Coffee Co.", href: "#", category: "Hospitality" },
  { title: "Northstar Consulting", href: "#", category: "Professional Services" },
  { title: "Crescent Studio", href: "#", category: "Creative" },
  { title: "Evergreen Nonprofit", href: "#", category: "Nonprofit" },
] as const;

export default function ShowcasePage() {
  return (
    <div className="py-10 md:py-16">
      <section className="scroll-mt-24">
        <header className="mb-6 md:mb-8 text-center">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Showcase</div>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">Selected website work</h1>
          <p className="mt-2 text-neutral-600 max-w-2xl mx-auto">A few examples of sites we’ve designed and built. Each project is responsive, fast, and easy to evolve with monthly updates.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {samples.map((s, idx) => (
            <a
              key={s.title}
              href={s.href}
              className="group rounded-xl border border-soft bg-panel overflow-hidden transition-all duration-300 shadow-soft shadow-hover hover:-translate-y-0.5 hover:border-success-accent/30"
            >
              <div className="relative h-48 sm:h-56 md:h-60 bg-neutral-200">
                <img
                  src={categoryImages[s.category]}
                  alt={s.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                {/* persistent black overlay with subtle hover intensification */}
                <div className="absolute inset-0 bg-black/30 transition-opacity duration-300 group-hover:opacity-40" />
                {/* site logo overlay bottom-right */}
                <img
                  src="/logo.svg"
                  alt="Hinn.dev"
                  className="absolute bottom-2 right-2 h-7 w-7 rounded-md bg-white/85 p-1 shadow-sm ring-1 ring-black/5"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wide text-neutral-500">{s.category}</div>
                <div className="mt-1 text-base font-semibold text-neutral-900">{s.title}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-sm text-success-ink">
                  <span>View project</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 md:mt-10 flex justify-center">
          <Link href="/contact" className="px-4 py-2.5 rounded-md border border-white text-success-ink bg-white inline-flex items-center gap-2 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent shadow-soft shadow-hover">
            <span>Start your project</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
