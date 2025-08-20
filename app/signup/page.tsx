"use client";

import { supabase } from "@/lib/supabaseClient";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingUser, setExistingUser] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/`;
  }, []);

  async function signUpWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setExistingUser(false);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      if (data.user && !data.session) {
        // Email confirmation required — send user to verification screen
        router.replace(`/verify-email?email=${encodeURIComponent(email)}&fromSignup=1`);
      } else {
        setSuccess("Account created. Redirecting...");
        window.location.replace("/");
      }
    } catch (e: any) {
      const msg = e?.message || "Failed to create account";
      setError(msg);
      if (/already|registered|exists/i.test(msg)) {
        setExistingUser(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendPasswordReset() {
    if (!email) return;
    try {
      setResetLoading(true);
      setError(null);
      setSuccess(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
      setSuccess("Password reset email sent. Please check your inbox.");
    } catch (e: any) {
      setError(e?.message || "Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  }

  async function continueWithGoogle() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) throw error;
    } catch (e: any) {
      setError(e?.message || "Failed to start Google sign-in");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 pt-6">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="text-sm text-neutral-600">Sign up with email or continue with Google.</p>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
        )}
        {success && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{success}</div>
        )}
        {existingUser && email && (
          <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
            It looks like you already have an account with {email}. {" "}
            <Link href="/login" className="underline">Login instead</Link> or {" "}
            <button onClick={sendPasswordReset} disabled={resetLoading} className="underline">
              {resetLoading ? "Sending reset..." : "reset your password"}
            </button>.
          </div>
        )}

        <button
          onClick={continueWithGoogle}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-neutral-300 px-4 py-2.5 bg-white hover:bg-neutral-50 disabled:opacity-60"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.676 32.66 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.161 7.957 3.043l5.657-5.657C34.869 6.053 29.729 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.36 16.108 18.81 12 24 12c3.059 0 5.842 1.161 7.957 3.043l5.657-5.657C34.869 6.053 29.729 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.191-5.238C29.22 35.461 26.751 36 24 36c-5.202 0-9.668-3.356-11.292-8.063l-6.545 5.036C9.454 39.556 16.13 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.353 3.577-4.806 6-8.303 6-5.202 0-9.668-3.356-11.292-8.063l-6.545 5.036C9.454 39.556 16.13 44 24 44c8.822 0 16.254-5.986 18.611-14.083A19.936 19.936 0 0044 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
          <span>{loading ? "Redirecting..." : "Continue with Google"}</span>
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-neutral-500">or</span></div>
        </div>

        <form onSubmit={signUpWithEmail} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]" placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8]" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-md bg-[#1a73e8] text-white px-4 py-2.5 disabled:opacity-60">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="text-sm text-neutral-600">
          Already have an account? <Link href="/login" className="text-[#1a73e8] hover:underline">Sign in</Link>
        </div>

        <p className="text-xs text-neutral-500">By continuing, you agree to our Terms and acknowledge our Privacy Policy.</p>
      </div>
    </div>
  );
}
