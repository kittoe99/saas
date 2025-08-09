"use client";

export default function ContactForm() {
  return (
    <div className="md:col-span-2 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Name</label>
            <input id="name" name="name" type="text" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]" placeholder="Jane Doe" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
            <input id="email" name="email" type="email" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]" placeholder="jane@example.com" />
          </div>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-neutral-700">Subject</label>
          <select
            id="subject"
            name="subject"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] bg-white"
            required
          >
            <option value="" disabled hidden>
              Select a subject
            </option>
            <option value="account">Account</option>
            <option value="billing">Billing</option>
            <option value="technical-issues">Technical Issues</option>
            <option value="sales">Sales</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-neutral-700">Message</label>
          <textarea id="message" name="message" rows={6} required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]" placeholder="Write your message here..." />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="px-4 py-2.5 rounded-md bg-[#1a73e8] text-white">Send message</button>
          <a href="mailto:hello@hinn.io" className="text-sm text-[#1a73e8] hover:underline">Or email us directly</a>
        </div>
      </form>
    </div>
  );
}
