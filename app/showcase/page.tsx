export const metadata = {
  title: "Showcase | hinn.io",
  description: "A selection of recent website builds and concept projects by hinn.io.",
};

import VectorArt from "../components/VectorArt";
import Link from "next/link";

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
            <a key={s.title} href={s.href} className="group rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="relative h-48 sm:h-56 md:h-60 bg-neutral-100">
                <VectorArt
                  variant={(["layout", "team", "components", "sales", "ai", "card"] as const)[idx % 6]}
                  className="absolute inset-0 h-full w-full"
                  aria-label={s.title}
                />
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
