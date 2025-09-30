export const metadata = {
  title: "Marketing & Branding | Hinn.dev",
  description: "Positioning, visual identity, and campaigns that amplify your reach.",
};

export default function MarketingPage() {
  return (
    <div className="py-12 md:py-16">
      <section className="scroll-mt-24">
        <header className="mb-6 md:mb-10 text-center">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-subtle">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-accent-primary" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M4 6h16v12H4z" />
              </svg>
            </span>
            <span>Marketing & Branding</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-secondary max-w-2xl mx-auto">
            Nail your positioning, visuals, and campaigns—so the right audience remembers you.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a href="/contact" className="px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors hover:brightness-95">
              Talk to us
            </a>
            <a href="/showcase" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">
              See work
            </a>
          </div>
        </header>

        {/* Services */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {[
            {
              title: "Brand identity",
              desc: "Logos, color, and typography—built into a flexible system.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h10M4 17h7" />,
            },
            {
              title: "Content & copy",
              desc: "Clear messaging, articles, and landing pages that convert.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 11h5M5 19h14M5 5h14" />,
            },
            {
              title: "Campaigns",
              desc: "Multi-channel campaigns with measured outcomes.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M4 10h3m10 0h3" />,
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] transition-all">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-subtle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-accent-primary" aria-hidden>
                  {item.icon}
                </svg>
              </div>
              <h2 className="mt-3 text-base font-semibold tracking-tight text-primary">{item.title}</h2>
              <p className="mt-1 text-sm text-secondary">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Packages */}
        <div className="mt-10 md:mt-14 grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { name: "Starter", price: "$59/mo", features: ["Identity refresh", "One landing page", "Monthly updates"] },
            { name: "Growth", price: "$99/mo", features: ["Brand system", "2 landing pages", "Blog articles"] },
            { name: "Scale", price: "$169/mo", features: ["Full identity", "Campaigns", "Performance reporting"] },
          ].map((tier) => (
            <div key={tier.name} className="rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]">
              <div className="flex items-baseline justify-between">
                <div className="text-base font-semibold text-primary">{tier.name}</div>
                <div className="text-primary font-semibold">{tier.price}</div>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-secondary">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-accent-primary mt-0.5" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <a href="/contact" className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm transition-colors hover:brightness-95">
                  Choose {tier.name}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ teaser */}
        <div className="mt-10 md:mt-14 grid gap-3">
          <details className="rounded-xl border border-neutral-200 bg-white p-4">
            <summary className="cursor-pointer select-none text-sm font-medium text-primary">How do monthly updates work?</summary>
            <p className="mt-2 text-sm text-secondary">Send requests anytime—most changes go live within a few days.</p>
          </details>
          <details className="rounded-xl border border-neutral-200 bg-white p-4">
            <summary className="cursor-pointer select-none text-sm font-medium text-primary">Do you work with existing brands?</summary>
            <p className="mt-2 text-sm text-secondary">Yes, we can refresh or extend existing guidelines and assets.</p>
          </details>
        </div>
      </section>
    </div>
  );
}
