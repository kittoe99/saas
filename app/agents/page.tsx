export const metadata = {
  title: "Agents | Hinn.dev",
  description: "AI Agents for customer support, lead capture, and workflow automation.",
};

export default function AgentsPage() {
  return (
    <div className="py-12 md:py-16">
      <section className="scroll-mt-24">
        <header className="mb-6 md:mb-10 text-center">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-subtle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4 text-accent-primary"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M5 12a7 7 0 1114 0 7 7 0 01-14 0z" />
              </svg>
            </span>
            <span>AI Agents</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-secondary max-w-2xl mx-auto">
            Always-on assistants for support, lead capture, and operations. Trained on your content and workflows.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a href="/signup" className="px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors hover:brightness-95">
              Get started
            </a>
            <a href="/contact" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">
              Talk to us
            </a>
          </div>
        </header>

        {/* Highlights */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch">
          {[
            {
              title: "Customer support",
              desc: "Answer FAQs, handle returns, triage tickets, and escalate when needed.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h7M5 20l2.5-2H19a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14z" />
              ),
            },
            {
              title: "Lead capture",
              desc: "Qualify and book meetings directly on your site, 24/7.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8M8 11h5M5 19h14M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
              ),
            },
            {
              title: "Workflow automation",
              desc: "Trigger CRM updates, send emails, and move data—hands free.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h6v6H4V7zm0 10h6v-2H4v2zm10 0h6v-6h-6v6zm0-10h6V5h-6v2z" />
              ),
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

        {/* How it works */}
        <div className="mt-10 md:mt-14 rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)]">
          <h2 className="text-base font-semibold tracking-tight text-primary">How it works</h2>
          <ol className="mt-4 grid md:grid-cols-3 gap-4 text-sm text-secondary">
            <li className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="font-medium text-primary">1. Connect your data</div>
              <p className="mt-1">Sync your site, docs, and knowledge base for instant context.</p>
            </li>
            <li className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="font-medium text-primary">2. Define actions</div>
              <p className="mt-1">Add workflows: create leads, send emails, book meetings, and more.</p>
            </li>
            <li className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="font-medium text-primary">3. Launch everywhere</div>
              <p className="mt-1">Embed on your site and connect channels like chat, email, or SMS.</p>
            </li>
          </ol>
        </div>

        {/* Pricing teaser */}
        <div className="mt-10 md:mt-14 grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { name: "Starter", price: "$59/mo", features: ["1 agent", "Email support", "Site embed"] },
            { name: "Growth", price: "$99/mo", features: ["3 agents", "CRM actions", "Multiple channels"] },
            { name: "Scale", price: "$169/mo", features: ["10 agents", "Advanced workflows", "Priority support"] },
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
                <a href="/signup" className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm transition-colors hover:brightness-95">
                  Choose {tier.name}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ teaser */}
        <div className="mt-10 md:mt-14 grid gap-3">
          <details className="rounded-xl border border-neutral-200 bg-white p-4">
            <summary className="cursor-pointer select-none text-sm font-medium text-primary">Can agents escalate to humans?</summary>
            <p className="mt-2 text-sm text-secondary">Yes. Agents can hand off to your team with context in your preferred channels.</p>
          </details>
          <details className="rounded-xl border border-neutral-200 bg-white p-4">
            <summary className="cursor-pointer select-none text-sm font-medium text-primary">Where do they get answers?</summary>
            <p className="mt-2 text-sm text-secondary">From the data sources you connect (site, docs, knowledge base) plus configured actions.</p>
          </details>
        </div>
      </section>
    </div>
  );
}
