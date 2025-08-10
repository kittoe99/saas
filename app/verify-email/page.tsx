"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center px-4 pt-6"><div className="text-sm text-neutral-600">Loading...</div></div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const search = useSearchParams();
  const email = search.get("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0); // seconds remaining

  async function resend() {
    if (!email) return;
    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setMessage("Verification email sent. Please check your inbox.");
      setCooldown(60);
    } catch (e: any) {
      setError(e?.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 pt-6">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 4h16v16H4z"/>
              <path d="m22 6-10 7L2 6"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-sm text-neutral-600">
            We sent a verification link{email ? ` to ${email}` : ""}. Click the link to confirm your account.
          </p>
          {message && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 w-full">{message}</div>
          )}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 w-full">{error}</div>
          )}
          <div className="text-xs text-neutral-500">
            Didn&apos;t get the email? Check your spam folder or wait a minute.
          </div>
          <button
            onClick={resend}
            disabled={!email || loading || cooldown > 0}
            className="mt-1 inline-flex items-center justify-center rounded-md bg-[#1a73e8] text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {loading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
          </button>
          <div className="pt-2 flex items-center gap-2">
            <Link href="/login" className="text-sm text-[#1a73e8] hover:underline">Back to sign in</Link>
            <span className="text-neutral-300">•</span>
            <Link href="/" className="text-sm text-[#1a73e8] hover:underline">Return home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
