"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SitesPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  // Auth guard
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        try {
          const next = `${window.location.pathname}${window.location.search}`;
          window.location.replace(`/login?next=${encodeURIComponent(next)}`);
        } catch {
          window.location.replace("/login");
        }
        return;
      }
      const { data: u } = await supabase.auth.getUser();
      if (!mounted) return;
      setUserId(u?.user?.id ?? null);
      setUserEmail(u?.user?.email ?? null);
      setEmailInput((u?.user?.email ?? "") || "");
      setAuthChecked(true);
    })();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const payload: { user_id?: string; email?: string } = {};
      if (emailInput.trim()) payload.email = emailInput.trim();
      if (userId) payload.user_id = userId;

      const res = await fetch("/api/vercel/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : await res.text();
      if (!res.ok) {
        const msg = typeof data === "string" ? data : data?.error || "Failed to create team";
        setResult({ ok: false, message: String(msg) });
        return;
      }
      const teamId = (typeof data === "object" && data?.team_id) ? data.team_id : undefined;
      setResult({ ok: true, message: `Team created${teamId ? ` (id: ${teamId})` : ""}.` });
    } catch (e: any) {
      setResult({ ok: false, message: e?.message || "Unexpected error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-600">Checking authentication...</div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-success-accent/20 text-success-ink inline-flex items-center justify-center font-semibold">H</div>
          <div className="text-sm text-neutral-600">Sites</div>
          <a href="/dashboard" className="ml-auto text-sm text-success-ink hover:underline">Back to Dashboard</a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-soft">
          <h1 className="text-base font-semibold text-neutral-900">Create Vercel Team (Manual)</h1>
          <p className="text-sm text-neutral-600 mt-1">Use this form to manually create a Vercel team via the server API.</p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-800">Team name (from email)</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="user@example.com"
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-success-accent/70 focus:border-success"
              />
              <p className="mt-1 text-xs text-neutral-600">Defaults to your signed-in email: <span className="font-mono">{userEmail ?? "(unknown)"}</span></p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-white ${submitting ? "bg-neutral-400" : "bg-success-accent hover:opacity-90"}`}
              >
                {submitting ? "Creating..." : "Create Team on Vercel"}
              </button>
            </div>
          </form>

          {result && (
            <div className={`mt-4 text-sm rounded-md px-3 py-2 border ${result.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
              {result.message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
