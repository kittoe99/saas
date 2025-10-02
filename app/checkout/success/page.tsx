"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        const sid = sp.get("session_id");
        const widFromUrl = sp.get("website_id");
        // 1) Prefer website_id if present in URL
        if (widFromUrl) {
          if (!cancelled) window.location.replace(`/dashboard/onboarding?website_id=${encodeURIComponent(widFromUrl)}`);
          return;
        }
        // 2) Resolve via our API using session_id
        if (sid) {
          const r = await fetch(`/api/stripe/session?session_id=${encodeURIComponent(sid)}`, { cache: "no-store" });
          const j = await r.json().catch(() => ({} as any));
          if (r.ok) {
            const meta = j?.session?.metadata || {};
            const wid = meta.website_id || meta.websiteId || null;
            if (wid) {
              if (!cancelled) window.location.replace(`/dashboard/onboarding?website_id=${encodeURIComponent(wid)}`);
              return;
            }
          }
        }
        // 3) Fallback: go to onboarding landing (it can infer latest site by user)
        if (!cancelled) window.location.replace(`/dashboard/onboarding`);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Could not redirect to onboarding");
          // Give user a way out
          setTimeout(() => { try { window.location.replace("/dashboard"); } catch {} }, 2000);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-green-700">Payment successful</h1>
      <p className="mt-2 text-sm text-neutral-700">Redirecting you to onboarding to finish setup…</p>
      {error && (
        <p className="mt-2 text-xs text-rose-700">{error}</p>
      )}
    </div>
  );

}
