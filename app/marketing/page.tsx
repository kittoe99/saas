import ServicesList from "./ServicesList";
export const metadata = {
  title: "Marketing & Branding | Hinn.dev",
  description: "Positioning, visual identity, and campaigns that amplify your reach.",
};

// Services data (used for expandable list)
const SERVICES = [
  { title: 'Brand Strategy & Positioning', desc: 'The foundation. We define your target audience, unique value proposition, brand voice, and personality. This is the "why" behind everything we design.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h10M4 17h7" />) },
  { title: 'Complete Visual Identity', desc: 'The look and feel. This includes your logo suite, color palette, typography, and imagery style guide. Everything is bespoke and reflects your strategic position.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />) },
  { title: 'Custom Business Image Generation', desc: 'No more stock photos. Using advanced AI and design, we create a bank of unique, on-brand photographs, illustrations, and graphics tailored to your industry and story.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 11h14M7 15h10" />) },
  { title: 'Marketing Asset Creation', desc: 'We build your core collateral. This includes business cards, letterheads, social media profiles, brochure designs, and presentation templates.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />) },
  { title: 'Launch Campaigns', desc: 'Hit the ground running. We develop and execute a multi-channel launch campaign (e.g., social media, email) to introduce your new brand to the market.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />) },
  { title: 'Content & Messaging Guide', desc: 'The words that work. We craft key messaging, taglines, and a tone-of-voice guide to ensure all your communication is consistent and compelling.', icon: (<path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 16h10M5 8h10" />) },
];

export default function MarketingPage() {
  return (
    <div className="py-12 md:py-16">
      {/* Hero (split layout) */}
      <section>
        <div className="max-w-5xl mx-auto px-3 sm:px-4 grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div className="text-center md:text-left">
            <h1 className="mt-1 text-3xl md:text-4xl font-semibold tracking-tight text-primary">Top-notch Branding For Your Business</h1>
            <p className="mt-3 text-sm md:text-base text-secondary">We nail your positioning, visuals, and campaigns with a completely custom strategy—so the right audience can't forget you.</p>
            <p className="mt-2 text-sm md:text-base text-secondary">Using generic templates, weak messaging, and stock photos makes you just another fish in the pond. You might be getting seen, but you're not building a brand that connects, convinces, and converts.</p>
            <p className="mt-2 text-sm md:text-base text-secondary">We build brands from the inside out. We define your unique story, then bring it to life with stunning custom visuals and strategic campaigns designed to attract your ideal customers.</p>
            <div className="mt-5 flex items-center gap-3 justify-center md:justify-start">
              <a href="/get-started" className="px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors hover:brightness-95">Get started</a>
              <a href="#services" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">See services</a>
            </div>
          </div>
          <div className="relative h-48 md:h-64 rounded-3xl border border-soft shadow-soft overflow-hidden bg-white">
            <img
              src="/marketing-hero.svg"
              alt="Abstract branding layers illustration"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* Key bullets as badges (no emojis) */}
      <section className="mt-8 md:mt-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              'Clarity Over Clutter',
              '100% Custom Creative',
              'Strategic Campaigns',
              'Seamless Integration',
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

      {/* Services (aligned two-column media list, expandable like Website via client component) */}
      <section id="services" className="mt-10 md:mt-14">
        <header className="mb-6 text-center">
          <h2 className="text-base font-semibold tracking-tight text-primary">A Complete Ecosystem for Growth</h2>
        </header>
        <ServicesList services={SERVICES} />
      </section>

      {/* Custom Visuals section */}
      <section className="mt-12 md:mt-16 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-8 md:py-10">
          <header className="mb-6 md:mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-primary">Imagine Marketing Assets That Could Only Be Yours.</h2>
          </header>
          <p className="text-sm md:text-base text-secondary max-w-3xl mx-auto">Stock photos are used by everyone. They make your brand feel generic and unrelatable. We eliminate them entirely by generating a library of custom visuals that perfectly represent your business, your team, and your customers.</p>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-soft bg-white p-4 shadow-soft">
              <div className="text-xs font-medium text-neutral-600">Before</div>
              <p className="mt-1 text-sm text-secondary">The Old Way: A tech company uses a generic photo of people in headshots around a table.</p>
            </div>
            <div className="rounded-2xl border border-soft bg-white p-4 shadow-soft md:col-span-2">
              <div className="text-xs font-medium text-neutral-600">After</div>
              <p className="mt-1 text-sm text-secondary">The Better Way: The same tech company uses a custom-generated image that visually metaphors their specific software solving a specific problem for their ideal client.</p>
            </div>
          </div>
          <ul className="mt-6 grid md:grid-cols-3 gap-3 text-sm text-secondary">
            {[
              'Authentic Representation: visuals that actually look like your product and your people.',
              'Brand Consistency: Every image reinforces your color palette and style.',
              'Competitive Edge: Your competitors literally cannot access your image library.',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-subtle text-accent-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span className="text-neutral-800">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ (polished two-column accordion) */}
      <section id="faq" className="scroll-mt-24 mt-12 md:mt-16">
        <header className="mb-6 md:mb-8 text-center">
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary">Frequently Asked Questions</h2>
        </header>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
          {[
            { q: 'How long does a full branding project take?', a: 'The Brand Foundation package takes approximately 2-3 weeks. The Market Dominator package typically takes 4-6 weeks from discovery to final asset delivery, ensuring a thoughtful and comprehensive process.' },
            { q: 'What do you mean by "custom-generated images"? Do you use AI?', a: 'Yes, we leverage cutting-edge generative AI as a powerful tool in our creative process, guided by our human designers and artists. This allows us to create hyper-specific, on-brand visuals that would be prohibitively expensive with traditional photography, all while maintaining full creative control and your unique brand identity.' },
            { q: 'Will I own the final branding assets?', a: 'Absolutely. Once the project is finalized and paid, you own the full copyright to your logo, visual identity, and all custom-generated images. They are yours forever.' },
            { q: 'Can you work with our existing marketing team?', a: 'Of course. We see ourselves as an extension of your team. We\'ll collaborate closely with your people, providing them with the strategy, assets, and guidelines they need to execute flawlessly.' },
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
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-primary">Ready to Build a Brand That Sticks?</h2>
          <p className="mt-2 text-sm md:text-base text-secondary">Stop blending in. Let's craft an identity that your ideal customers will recognize, trust, and choose every single time.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a href="/get-started" className="px-5 py-3 rounded-full bg-accent-primary text-white border border-accent-primary text-sm md:text-base transition-colors hover:brightness-95">Get started</a>
            <a href="/contact" className="px-5 py-3 rounded-full border border-neutral-300 bg-white text-sm text-neutral-800 hover:bg-neutral-50">Talk to us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
