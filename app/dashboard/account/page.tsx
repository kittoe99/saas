"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Loader from "@/app/components/Loader";

export default function AccountPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [pfEmail, setPfEmail] = useState<string>("");
  const [pfFullName, setPfFullName] = useState<string>("");

  // Auth guard
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        try {
          const next = `${window.location.pathname}${window.location.search}`;
          window.location.replace(`/login?next=${encodeURIComponent(next)}`);
        } catch {
          window.location.replace("/login");
        }
      } else {
        setAuthChecked(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  const loadProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      const uemail = u?.user?.email ?? undefined;
      if (!uid) throw new Error("Not authenticated");
      let { data: row, error } = await supabase
        .from("profiles")
        .select("id,email,full_name")
        .eq("id", uid)
        .maybeSingle();
      if (error) throw error;
      if (!row) {
        const { error: upErr } = await supabase.from("profiles").upsert({ id: uid, email: uemail ?? null, full_name: uemail ?? null });
        if (upErr) throw upErr;
        const resel = await supabase
          .from("profiles")
          .select("id,email,full_name")
          .eq("id", uid)
          .maybeSingle();
        row = resel.data as any;
      }
      setPfEmail((row as any)?.email ?? "");
      setPfFullName((row as any)?.full_name ?? "");
    } catch (e: any) {
      setProfileError(e?.message || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const saveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);
    setProfileSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ email: pfEmail || null, full_name: pfFullName || null })
        .eq("id", uid);
      if (error) throw error;
      setProfileSuccess("Profile updated");
    } catch (e: any) {
      setProfileError(e?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked]);

  if (!authChecked) {
    return <Loader fullScreen message="Checking authentication..." />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <a href="/dashboard" className="h-7 w-7 rounded bg-success-accent/20 text-success-ink inline-flex items-center justify-center font-semibold">H</a>
          <div className="text-sm text-neutral-600">Account</div>
          <div className="ml-auto" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-soft max-w-2xl">
          <h1 className="text-base font-semibold text-neutral-900">Your account</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage your profile details.</p>

          <div className="mt-4 space-y-4">
            {profileError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{profileError}</div>
            )}
            {profileSuccess && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{profileSuccess}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-800">Full name</label>
              <input
                type="text"
                value={pfFullName}
                onChange={(e) => setPfFullName(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                placeholder="Your name"
                autoComplete="name"
                disabled={profileLoading || profileSaving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-800">Email</label>
              <input
                type="email"
                value={pfEmail}
                onChange={(e) => setPfEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm focus-visible:ring-2 focus-visible:ring-success-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={profileLoading || profileSaving}
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={saveProfile}
                disabled={profileLoading || profileSaving}
                className="inline-flex items-center gap-2 rounded-md bg-success-accent px-3 py-2 text-sm text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent disabled:opacity-60"
              >
                {profileSaving && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12" />
                  </svg>
                )}
                Save changes
              </button>
              <a href="/dashboard" className="text-sm text-neutral-700 hover:underline">Back to Dashboard</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
