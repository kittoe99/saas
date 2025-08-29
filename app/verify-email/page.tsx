"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
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
  const fromSignup = search.get("fromSignup");
  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/`;
  }, []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0); // seconds remaining
  const [viewMode, setViewMode] = useState<"verify" | "exists">("exists");

  // If user is already signed in, redirect home
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.replace("/");
      }
    });
  }, []);

  // Choose view automatically: if email is provided, show verify UI; otherwise show existing-account guidance
  useEffect(() => {
    setViewMode(email ? "verify" : "exists");
  }, [email]);

  async function resend() {
    if (!email) return;
    try {
      setLoading(true);
      setMessage(null);
      setError(null);
      const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: redirectTo } });
      if (error) {
        const msg = error.message || "Failed to resend verification email";
        // If the user is already registered/confirmed, guide to reset password instead of resending
        if (/already|confirmed|registered/i.test(msg)) {
          setError(null);
          setMessage("This email appears to already be registered.");
          setViewMode("exists");
        } else {
          throw error;
        }
      } else {
        setMessage("Verification email sent. Please check your inbox.");
        setCooldown(60);
      }
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
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col items-center text-center space-y-3">
          {viewMode === "verify" ? (
            <>
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
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 12h8M8 16h8M8 8h8"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold">Account found</h1>
              <p className="text-sm text-neutral-600">
                An account with {email || "this email"} already exists. You can sign in or reset your password.
              </p>
            </>
          )}
          {message && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 w-full">{message}</div>
          )}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 w-full">{error}</div>
          )}
          {viewMode === "verify" && (
            <>
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
              <button
                onClick={() => setViewMode("exists")}
                className="inline-flex items-center justify-center rounded-md border border-neutral-300 text-neutral-800 px-4 py-2 text-sm hover:bg-neutral-50 shadow-soft shadow-hover"
              >
                I already have an account
              </button>
            </>
          )}
          {viewMode === "exists" && (
            <>
              <div className="text-xs text-neutral-500">Use one of the options below to access your account.</div>
              <div className="flex gap-2">
                <Link href="/login" className="inline-flex items-center justify-center rounded-md bg-[#1a73e8] text-white px-4 py-2 text-sm">Login</Link>
                <button
                  onClick={async () => {
                    if (!email) return;
                    try {
                      setLoading(true);
                      setMessage(null);
                      setError(null);
                      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
                      if (error) throw error;
                      setMessage("Password reset email sent. Check your inbox.");
                    } catch (e: any) {
                      setError(e?.message || "Failed to send password reset email");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={!email || loading}
                  className="inline-flex items-center justify-center rounded-md border border-neutral-300 text-neutral-800 px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-60 shadow-soft shadow-hover"
                >
                  Reset password
                </button>
              </div>
            </>
          )}
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
