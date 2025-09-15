"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function classNames(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

type Website = {
  id: string;
  user_id: string;
  name: string | null;
  domain: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  url?: string | null;
};

type OnboardingRow = {
  id: string;
  website_id: string;
  user_id: string;
  data: any;
};

export default function ManageWebsitePage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = useMemo(() => (Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined)), [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState<Website | null>(null);
  const [onboarding, setOnboarding] = useState<any | null>(null);

  // Editable fields (basic)
  const [name, setName] = useState<string>("");
  const [domain, setDomain] = useState<string>("");

  // Derived from onboarding
  const [primaryGoal, setPrimaryGoal] = useState<string>("");
  const [contactMethod, setContactMethod] = useState<string>("");
  const [envisionedPages, setEnvisionedPages] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [voiceTone, setVoiceTone] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!websiteId) return;
      setLoading(true);
      setError(null);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth?.user?.id;
        if (!uid) {
          router.replace("/login?next=" + encodeURIComponent(`/website/${websiteId}`));
          return;
        }
        // Load website + onboarding
        const { data: w } = await supabase
          .from("websites")
          .select("id, user_id, name, domain, status, created_at, updated_at, url")
          .eq("id", websiteId)
          .eq("user_id", uid)
          .maybeSingle();
        const { data: o } = await supabase
          .from("onboarding")
          .select("id, website_id, user_id, data")
          .eq("website_id", websiteId)
          .eq("user_id", uid)
          .maybeSingle();
        if (!w) throw new Error("Website not found");
        setWebsite(w as Website);
        setName((w?.name as string) || "");
        setDomain((w?.domain as string) || "");
        if (o) {
          setOnboarding(o?.data ?? null);
          const d: any = o?.data ?? {};
          setPrimaryGoal(d?.primaryGoal || "");
          setContactMethod(d?.contactMethod || "");
          setEnvisionedPages(Array.isArray(d?.envisionedPages) ? d.envisionedPages : []);
          setSelectedServices(Array.isArray(d?.selectedServices) ? d.selectedServices : []);
          setVoiceTone(Array.isArray(d?.voiceTone) ? d.voiceTone.join(", ") : (d?.voiceTone || ""));
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load website");
      } finally {
        setLoading(false);
      }
    })();
  }, [websiteId, router]);

  const handleSaveBasics = async () => {
    if (!websiteId) return;
    setSaving(true);
    setError(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) throw new Error("Not authenticated");
      const updates: any = { name: name || null, domain: domain || null };
      const { error } = await supabase.from("websites").update(updates).eq("id", websiteId).eq("user_id", uid);
      if (error) throw error;
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-sm hover:bg-neutral-50">Back</button>
          <div className="text-sm text-neutral-600">Manage Site</div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleSaveBasics} disabled={saving} className="px-3 py-1.5 rounded-md bg-success-accent text-white text-sm hover:opacity-90 disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {loading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4">Loading…</div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">{error}</div>
        ) : !website ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4">Not found</div>
        ) : (
          <>
            {/* Basics */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Basics</div>
                  <div className="text-[12px] text-neutral-600">Update your site name and domain</div>
                </div>
                <span className={classNames(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border",
                  website.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  website.status === 'draft' ? "bg-neutral-100 text-neutral-700 border-neutral-200" :
                  "bg-amber-50 text-amber-800 border-amber-200"
                )}>{website.status || 'unknown'}</span>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <div className="text-[12px] text-neutral-600 mb-1">Site name</div>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent" placeholder="My Company" />
                </label>
                <label className="block">
                  <div className="text-[12px] text-neutral-600 mb-1">Domain</div>
                  <input value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-success-accent" placeholder="example.com" />
                </label>
              </div>
              {website.url && (
                <div className="mt-3 text-[12px] text-neutral-700">Live URL: <a className="text-success-ink hover:underline" href={website.url} target="_blank" rel="noreferrer">{website.url}</a></div>
              )}
            </section>

            {/* Domains & setup */}
            <details className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft" open>
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Domains & setup</div>
                  <div className="text-[12px] text-neutral-600">Connect or update your domain records</div>
                </div>
                <span className="text-[12px] text-neutral-600">Collapse</span>
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-[12px] text-neutral-600">Current domain</div>
                  <div className="text-sm text-neutral-900">{domain || "Not connected"}</div>
                </div>
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-[12px] text-neutral-600">Recommended records</div>
                  <div className="text-sm text-neutral-900">A / CNAME to your deployment host</div>
                </div>
              </div>
            </details>

            {/* Services provided */}
            <details className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Services provided</div>
                  <div className="text-[12px] text-neutral-600">Manage the services you offer</div>
                </div>
                <span className="text-[12px] text-neutral-600">Expand</span>
              </summary>
              <div className="mt-3">
                {selectedServices.length === 0 ? (
                  <div className="text-sm text-neutral-700">No services listed</div>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {selectedServices.map((s) => (
                      <li key={s} className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[12px] text-neutral-800">{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            </details>

            {/* Onboarding details */}
            <details className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Onboarding details</div>
                  <div className="text-[12px] text-neutral-600">From your initial setup questionnaire</div>
                </div>
                <span className="text-[12px] text-neutral-600">Expand</span>
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-[12px] text-neutral-600">Primary goal</div>
                  <div className="text-sm text-neutral-900">{primaryGoal || "—"}</div>
                </div>
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-[12px] text-neutral-600">Contact method</div>
                  <div className="text-sm text-neutral-900">{contactMethod || "—"}</div>
                </div>
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-[12px] text-neutral-600">Voice & tone</div>
                  <div className="text-sm text-neutral-900">{voiceTone || "—"}</div>
                </div>
                <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-[12px] text-neutral-600">Envisioned pages</div>
                  <div className="text-sm text-neutral-900">{envisionedPages.length ? envisionedPages.join(", ") : "—"}</div>
                </div>
              </div>
            </details>
          </>
        )}
      </main>
    </div>
  );
}
