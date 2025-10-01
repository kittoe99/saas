"use client";

import { useState } from "react";
import Link from "next/link";

export default function StripeTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkConnection() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/stripe/test", { method: "GET", cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || `Request failed with ${res.status}`);
      }
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Stripe connection test</h1>
      <p className="mt-1 text-sm text-neutral-600">This page calls our backend endpoint at <code>/api/stripe/test</code> which directly hits the Stripe REST API using <code>STRIPE_SECRET_KEY</code>.</p>

      <div className="mt-6">
        <button
          type="button"
          onClick={checkConnection}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white ${loading ? "bg-neutral-400" : "bg-black hover:bg-neutral-800"}`}
        >
          {loading ? "Checking…" : "Check Stripe connection"}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-md border border-neutral-200 bg-white p-3">
          <div className="text-sm text-neutral-800 font-medium">Result</div>
          <pre className="mt-2 overflow-auto text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/checkout"
          className="inline-block px-4 py-2 rounded-md text-white bg-black hover:bg-neutral-800"
        >
          Open hosted payment form
        </Link>
        <span className="text-xs text-neutral-500">
          Tip: ensure <code>STRIPE_SECRET_KEY</code> is set in <code>.env.local</code> and restart the dev server after changes.
        </span>
      </div>
    </div>
  );
}
