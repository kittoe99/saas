"use client";
import { useState } from "react";

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to submit");
      }

      setSuccess("Thanks! Your message has been sent.");
      form.reset();
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="md:col-span-2 rounded-3xl border border-soft bg-white p-5 sm:p-6 shadow-soft ring-1 ring-transparent hover:ring-[color:var(--accent-subtle)] transition-all">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Name</label>
            <input id="name" name="name" type="text" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 outline-none focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-sm" placeholder="Jane Doe" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
            <input id="email" name="email" type="email" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 outline-none focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-sm" placeholder="jane@example.com" />
          </div>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-neutral-700">Subject</label>
          <select
            id="subject"
            name="subject"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white bg-white shadow-sm"
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
          <textarea id="message" name="message" rows={6} required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 outline-none focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-sm" placeholder="Write your message here..." />
        </div>
        {success && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
            {success}
          </div>
        )}
        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting} className="px-5 py-3 rounded-full bg-black text-white border border-black text-sm md:text-base transition-colors hover:bg-neutral-900 disabled:opacity-60 focus:outline-none">
            {submitting ? "Sending..." : "Send message"}
          </button>
          <a href="mailto:hello@hinn.io" className="text-sm text-accent-primary hover:underline">Or email us directly</a>
        </div>
      </form>
    </div>
  );
}
