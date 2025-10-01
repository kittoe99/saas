"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [amount, setAmount] = useState<string>("5900"); // cents
  const [name, setName] = useState<string>("Monthly subscription");
  const [currency, setCurrency] = useState<string>("usd");
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_cents: Math.max(1, Math.floor(Number(amount) || 0)),
          name,
          currency,
          quantity,
          // success/cancel defaulted on the server, but you can override below:
          // success_url: `${window.location.origin}/checkout/success`,
          // cancel_url: `${window.location.origin}/checkout/cancel`,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Failed: ${res.status}`);

      const url = data?.url as string | undefined;
      if (!url) throw new Error("No session URL returned");

      window.location.href = url; // Redirect to Stripe hosted Checkout
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Hosted Checkout</h1>
      <p className="mt-1 text-sm text-neutral-600">Create a Stripe Checkout Session and redirect to the hosted payment page.</p>

      <form onSubmit={startCheckout} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-neutral-700">Item name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-700">Amount (cents)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-700">Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-700">Quantity</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`px-5 py-2 rounded-md text-white ${loading ? "bg-neutral-400" : "bg-black hover:bg-neutral-800"}`}
        >
          {loading ? "Creating session…" : "Pay with Stripe"}
        </button>
      </form>

      <div className="mt-8 text-xs text-neutral-500">
        Note: server will default success and cancel URLs to <code>/checkout/success</code> and <code>/checkout/cancel</code>.
      </div>
    </div>
  );
}
