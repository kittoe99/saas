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
    <div className="md:col-span-2 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">Name</label>
            <input id="name" name="name" type="text" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/30 focus:border-black" placeholder="Jane Doe" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
            <input id="email" name="email" type="email" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/30 focus:border-black" placeholder="jane@example.com" />
          </div>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-neutral-700">Subject</label>
          <select
            id="subject"
            name="subject"
            defaultValue=""
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-black/30 focus:border-black bg-white"
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
          <textarea id="message" name="message" rows={6} required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/30 focus:border-black" placeholder="Write your message here..." />
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
          <button type="submit" disabled={submitting} className="px-4 py-2.5 rounded-md bg-black hover:bg-neutral-900 text-white disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black">
            {submitting ? "Sending..." : "Send message"}
          </button>
          <a href="mailto:hello@hinn.io" className="text-sm text-neutral-900 hover:underline">Or email us directly</a>
        </div>
      </form>
    </div>
  );
}
