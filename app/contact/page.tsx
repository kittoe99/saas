import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact | hinn.io",
  description: "Get in touch with the hinn.io team. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="py-10 md:py-16">
      <section id="contact" className="scroll-mt-24">
        <header className="mb-6 md:mb-8 text-center">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Contact</div>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">We’d love to hear from you</h1>
          <p className="mt-2 text-neutral-600 max-w-2xl mx-auto">Have a question about plans, features, or a custom solution? Send us a message and we’ll get back to you within 1–2 business days.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* Form */}
          <ContactForm />

          {/* Sidebar */}
          <aside className="md:sticky md:top-24 rounded-xl border border-soft bg-panel p-5 sm:p-6 shadow-soft shadow-hover">
            <h2 className="text-base font-semibold tracking-tight">Contact details</h2>
            <dl className="mt-3 space-y-3 text-sm text-neutral-700">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 text-success-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0l-4 4m4-4l-4-4" /></svg>
                <div>
                  <dt className="font-medium">Email</dt>
                  <dd className="text-neutral-600"><a className="text-neutral-900 hover:underline" href="mailto:hello@hinn.io">hello@hinn.io</a></dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 text-success-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                <div>
                  <dt className="font-medium">Response time</dt>
                  <dd className="text-neutral-600">Typically 1–2 business days</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-4 w-4 text-success-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M4 6h16v12H4z" /></svg>
                <div>
                  <dt className="font-medium">Availability</dt>
                  <dd className="text-neutral-600">Mon–Fri, 9am–5pm (local time)</dd>
                </div>
              </div>
            </dl>
            <div className="mt-5 grid gap-3">
              <a href="/#faq" className="inline-flex items-center justify-center px-4 py-2.5 rounded-md border border-white text-success-ink bg-white text-sm gap-2 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-success-accent">
                <span>See common questions</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </a>
              <div className="rounded-lg border border-neutral-200 bg-white p-3 text-xs text-neutral-600">
                Prefer email? We’re at <a className="text-neutral-900 hover:underline" href="mailto:hello@hinn.io">hello@hinn.io</a>.
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
