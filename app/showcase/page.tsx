export const metadata = {
  title: "Showcase | hinn.io",
  description: "A selection of recent website builds and concept projects by hinn.io.",
};

import Image from "next/image";

const samples = [
  {
    title: "Aurora Fitness",
    href: "#",
    img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop",
    category: "Wellness",
  },
  {
    title: "Summit Outdoors",
    href: "#",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
    category: "Outdoors",
  },
  {
    title: "Bluegrain Coffee Co.",
    href: "#",
    img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1600&auto=format&fit=crop",
    category: "Hospitality",
  },
  {
    title: "Northstar Consulting",
    href: "#",
    img: "https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=1600&auto=format&fit=crop",
    category: "Professional Services",
  },
  {
    title: "Crescent Studio",
    href: "#",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
    category: "Creative",
  },
  {
    title: "Evergreen Nonprofit",
    href: "#",
    img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600&auto=format&fit=crop",
    category: "Nonprofit",
  },
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
          {samples.map((s) => (
            <a key={s.title} href={s.href} className="group rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="relative h-48 sm:h-56 md:h-60 bg-neutral-100">
                <Image src={s.img} alt={s.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <div className="text-xs uppercase tracking-wide text-neutral-500">{s.category}</div>
                <div className="mt-1 text-base font-semibold text-neutral-900">{s.title}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-sm text-[#1a73e8]">
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
          <Link href="/contact" className="px-4 py-2.5 rounded-md border border-[#1a73e8] text-[#1a73e8] bg-white inline-flex items-center gap-2">
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
