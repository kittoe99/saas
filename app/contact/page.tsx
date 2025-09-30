import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact | Hinn.dev",
  description: "Get in touch with the Hinn.dev team. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="py-12 md:py-16">
      <section id="contact" className="scroll-mt-24">
        <header className="mb-6 md:mb-8 text-center">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight text-primary flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5 text-accent-primary"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 3.866-3.582 7-8 7-1.168 0-2.272-.22-3.254-.615L4 20l1.748-3.059C5.27 16.02 5 14.997 5 14c0-3.866 3.582-7 8-7s8 3.134 8 7z" />
            </svg>
            <span>We’d love to hear from you</span>
          </h1>
          <p className="mt-2 text-sm md:text-base text-secondary max-w-2xl mx-auto">Have a question about plans, features, or a custom solution? Send us a message and we’ll get back to you within 1–2 business days.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* Form */}
          <ContactForm />

          {/* Sidebar */}
          <aside className="md:sticky md:top-24 rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] transition-all">
            <h2 className="text-base font-semibold tracking-tight text-primary">Contact details</h2>
            <dl className="mt-3 space-y-3 text-sm text-secondary">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0l-4 4m4-4l-4-4" /></svg>
                <div>
                  <dt className="font-medium text-primary">Email</dt>
                  <dd><a className="text-primary hover:underline" href="mailto:hello@hinn.io">hello@hinn.io</a></dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                <div>
                  <dt className="font-medium text-primary">Response time</dt>
                  <dd>Typically 1–2 business days</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 text-accent-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M4 6h16v12H4z" /></svg>
                <div>
                  <dt className="font-medium text-primary">Availability</dt>
                  <dd>Mon–Fri, 9am–5pm (local time)</dd>
                </div>
              </div>
            </dl>
            <div className="mt-5 grid gap-3">
              <a href="/#faq" className="inline-flex items-center justify-center px-5 py-3 rounded-full font-semibold bg-white text-black border border-black text-sm gap-2 transition-colors hover:bg-neutral-50 focus:outline-none">
                <span>See common questions</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </a>
              <div className="rounded-lg border border-neutral-200 bg-white p-3 text-xs text-secondary">
                Prefer email? We’re at <a className="text-primary hover:underline" href="mailto:hello@hinn.io">hello@hinn.io</a>.
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
