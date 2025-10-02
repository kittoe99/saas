export const metadata = {
  title: "Agents | Hinn.dev",
  description: "AI Agents for customer support, lead capture, and workflow automation.",
};

export default function AgentsPage() {
  return (
    <div className="py-12 md:py-16">
      {/* Hero (split layout) */}
      <section>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div className="text-center md:text-left">
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-primary">AI Agents That Get The Work Done!</h1>
            <p className="mt-3 text-sm md:text-base text-secondary">
              Always-on AI Agents for support, sales, and operations—trained exclusively on your business. Automate conversations and capture every opportunity, day or night.
            </p>
            <p className="mt-2 text-sm md:text-base text-secondary">
              Deploy a team of specialized AI Agents that work tirelessly across your business. They are not generic chatbots; they are trained experts on your content, policies, and workflows.
            </p>
            <div className="mt-5 flex items-center gap-3 justify-center md:justify-start">
              <a href="/get-started" className="px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors hover:brightness-95">Get started</a>
              <a href="#agents" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">See agents</a>
            </div>
          </div>
          <div className="relative h-48 md:h-64 rounded-3xl border border-soft shadow-soft overflow-hidden bg-white">
            <img
              src="/agents-hero-v2.svg"
              alt="AI Agents network illustration"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* Key bullets as badges (SVG icons, no emoji) */}
      <section className="mt-8 md:mt-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              'Trained on Your Business',
              'Always Available',
              'Seamless Handoff',
              'Actionable Insights',
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

      {/* Agents list (aligned two-column media list, SVG icons) */}
      <section id="agents" className="mt-10 md:mt-14">
        <header className="mb-6 text-center">
          <h2 className="text-base font-semibold tracking-tight text-primary">Specialized Agents for Every Business Function</h2>
        </header>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5 md:gap-6">
          {[
            { title: 'Customer Support Agent', desc: 'Your 24/7 support hero. Instantly resolves common queries, processes returns, books appointments, and frees your team to handle complex cases. “What\'s my order status?” “How do I reset my password?”', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h7M5 20l2.5-2H19a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14z" />) },
            { title: 'Phone Call Agent', desc: 'An AI that actually answers the phone. Handles inbound calls for bookings, FAQs, and lead qualification using a natural, human-like voice. Never miss a call again.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012.09 4.1 2 2 0 014.11 2h3a2 2 0 012 1.72c.12.86.33 1.7.62 2.5a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.58-1.78a2 2 0 012.11-.45c.8.29 1.64.5 2.5.62A2 2 0 0122 16.92z" />) },
            { title: 'Sales Development Agent', desc: 'Your ultimate lead capture machine. Engages website visitors, qualifies their interest, books demos directly into your calendar, and nurtures leads until they\'re sales-ready.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9-7-9-7-9 7 9 7zm0 0v-7" />) },
            { title: 'Business Operations Agent', desc: 'Your internal efficiency expert. Helps onboard new employees by answering HR questions, manages internal IT support tickets, and automates routine operational workflows.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M4 7h6v6H4V7zm0 10h6v-2H4v2zm10 0h6v-6h-6v6zm0-10h6V5h-6v2z" />) },
            { title: 'Custom Role Agent', desc: 'Need something specific? We\'ll build a bespoke AI Agent tailored for a unique workflow in your legal, healthcare, or manufacturing business.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />) },
          ].map((a) => (
            <div key={a.title} className="flex items-start gap-3 rounded-2xl border border-soft bg-white p-4 shadow-soft">
              <div className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-accent-subtle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-accent-primary" aria-hidden>
                  {a.icon}
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold tracking-tight text-primary">{a.title}</h3>
                <p className="mt-1 text-sm text-secondary">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deep Understanding (main heading band, SVG icons) */}
      <section id="understanding" className="mt-12 md:mt-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-8 md:py-10">
          <header className="mb-6 md:mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-primary">Powered by Deep Understanding, Not Just Simple Scripts</h2>
          </header>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Trained on Your Content', desc: 'Unlike generic chatbots, our agents deeply understand your specific business from the knowledge you provide. They answer based on your actual documentation.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M5 12a7 7 0 1114 0 7 7 0 01-14 0z" />) },
              { title: 'Multi-Platform Deployment', desc: 'Meet your customers where they are: on your Website, Facebook Messenger, WhatsApp, SMS, or even as a Voice Agent on your phone lines.', icon: (<><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" /></>) },
              { title: 'Smart Human Handoff', desc: 'The agent intelligently recognizes when a conversation requires a human touch and seamlessly transfers the chat/call to your team with full context.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />) },
              { title: 'Real-Time Analytics Dashboard', desc: 'Gain insights into customer intent, common questions, lead quality, and agent performance. Make data-driven decisions to improve your business.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M4 15h10M4 11h7M4 7h13" />) },
              { title: 'Data Security & Privacy', desc: 'Your data is yours. We employ enterprise-grade security and do not train our core models on your confidential business information.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 10-6 0v2c0 1.657 1.343 3 3 3zm6 0H6v7a3 3 0 003 3h6a3 3 0 003-3v-7z" />) },
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

      {/* Use cases as timeline */}
      <section className="mt-10 md:mt-14">
        <header className="mb-4 text-center">
          <h2 className="text-base font-semibold tracking-tight text-primary">Transforming Industries, One Conversation at a Time</h2>
        </header>
        <div className="max-w-3xl mx-auto relative pl-6 before:content-[''] before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-neutral-200">
          {[
            { title: 'E‑commerce Store', challenge: 'High volume of “Where’s my order?” questions drowning support team.', solution: 'Deployed a Customer Support Agent.', result: '40% reduction in support tickets; team focuses on retention.' },
            { title: 'Local Service Business', challenge: 'Missing potential clients who call after business hours.', solution: 'Deployed a Phone Call Agent.', result: '15 new jobs/month booked after hours with full details.' },
            { title: 'B2B SaaS Company', challenge: 'Visitors leaving without signing up for a demo.', solution: 'Deployed a Sales Development Agent.', result: '3x more qualified demos and 20% shorter sales cycle.' },
          ].map((u, i) => (
            <div key={u.title} className="relative mb-6 last:mb-0">
              <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full bg-accent-primary ring-2 ring-white" aria-hidden />
              <div className="rounded-2xl border border-soft bg-white p-4 shadow-soft">
                <div className="text-sm font-semibold text-primary">{u.title}</div>
                <dl className="mt-2 space-y-1 text-sm text-secondary">
                  <div><span className="font-medium text-primary">Challenge:</span> {u.challenge}</div>
                  <div><span className="font-medium text-primary">Solution:</span> {u.solution}</div>
                  <div><span className="font-medium text-primary">Result:</span> {u.result}</div>
                </dl>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ (minimal 2-column) */}
      <section id="faq" className="scroll-mt-24 mt-12 md:mt-16">
        <header className="mb-6 md:mb-8 text-center">
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary">Frequently Asked Questions</h2>
        </header>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
          {[ 
            { q: 'How is this different from a standard website chatbot?', a: 'Standard chatbots are rule-based and can only answer questions they are explicitly programmed for. Our AI Agents understand intent and context, drawing from a deep knowledge base of your content to provide accurate, conversational answers to questions you did not pre-write.' },
            { q: "What if the AI doesn't know the answer to a question?", a: "It's trained to gracefully admit when it's unsure and can immediately escalate the conversation to a human team member. It also learns from these interactions, and you can easily add the new information to its knowledge base." },
            { q: 'Can I connect the AI Agent to my other tools (e.g., Calendar, CRM)?', a: 'Absolutely. Our Growth and Enterprise plans include integrations with popular tools like Google Calendar, Salesforce, Slack, and Zapier, allowing your AI Agent to book meetings, create CRM entries, and more.' },
            { q: 'How long does it take to train and deploy an agent?', a: 'For most businesses, you can have a fully functional AI Agent trained and live on your website within a few days. The initial setup and training are incredibly fast.' },
          ].map((item, i) => (
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
        </div>
      </section>

      {/* Final CTA (light band) */}
      <section className="mt-12 md:mt-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-10 text-center">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-primary">Stop Automating Tasks. Start Automating Expertise.</h2>
          <p className="mt-2 text-sm md:text-base text-secondary">Deploy a team that works while you sleep. Capture more leads, deliver better support, and streamline your operations.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a href="/get-started" className="px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors hover:brightness-95">Get started</a>
            <a href="/contact" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">Talk to us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
