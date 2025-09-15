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
  vercel_prod_domain?: string | null;
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

  // Comprehensive onboarding data
  const [obData, setObData] = useState<any>(null);
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [hasOnboardingRow, setHasOnboardingRow] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!websiteId) return;
      setLoading(true);
      setError(null);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid0 = auth?.user?.id;
        if (!uid0) {
          router.replace("/login?next=" + encodeURIComponent(`/website/${websiteId}`));
          return;
        }
        setUid(uid0);
        // Load website + onboarding
        const { data: w, error: werr } = await supabase
          .from("websites")
          .select("id, user_id, name, domain, status, created_at, updated_at, vercel_prod_domain")
          .eq("id", websiteId)
          .eq("user_id", uid0)
          .maybeSingle();
        if (werr) throw werr;
        const { data: o, error: oerr } = await supabase
          .from("onboarding")
          .select("website_id, user_id, data, created_at, updated_at")
          .eq("website_id", websiteId)
          .eq("user_id", uid0)
          .maybeSingle();
        if (oerr && oerr.code !== 'PGRST116') throw oerr; // ignore no rows
        if (!w) throw new Error("Website not found");
        setWebsite(w as Website);
        setName((w?.name as string) || "");
        setDomain((w?.domain as string) || "");
        if (o) {
          setOnboarding(o?.data ?? null);
          setObData(o?.data ?? {});
          setContactEmail((o?.data?.businessEmail as string) || "");
          setContactPhone((o?.data?.businessPhone as string) || "");
          setHasOnboardingRow(true);
          setLogoUrl((o?.data?.logoUrl as string) || null);
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
      const { error: wupdErr } = await supabase.from("websites").update(updates).eq("id", websiteId).eq("user_id", uid);
      if (wupdErr) throw wupdErr;

      const merged = {
        ...(obData || {}),
        businessEmail: contactEmail || null,
        businessPhone: contactPhone || null,
      };

      if (hasOnboardingRow) {
        const { error: oupdErr } = await supabase
          .from("onboarding")
          .update({ data: merged })
          .eq("website_id", websiteId)
          .eq("user_id", uid);
        if (oupdErr) throw oupdErr;
      } else {
        const { error: oinsErr } = await supabase
          .from("onboarding")
          .insert({ website_id: websiteId, user_id: uid, data: merged });
        if (oinsErr) throw oinsErr;
        setHasOnboardingRow(true);
      }
      setObData(merged);
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (file: File) => {
    if (!websiteId || !uid || !file) return;
    setUploadingLogo(true);
    setError(null);
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${uid}/${websiteId}/logo.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('website-assets')
        .upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr && upErr.message && !upErr.message.includes('duplicate')) throw upErr;
      const { data: pub } = supabase.storage.from('website-assets').getPublicUrl(path);
      const url = pub?.publicUrl || null;
      const mergedLogo = {
        ...(obData || {}),
        hasLogo: true,
        logoUrl: url,
        assetCount: Math.max(1, Number(obData?.assetCount ?? 0))
      };
      const { error: oupdErr } = await supabase
        .from('onboarding')
        .upsert({ website_id: websiteId, user_id: uid, data: mergedLogo }, { onConflict: 'website_id,user_id' });
      if (oupdErr) throw oupdErr;
      setLogoUrl(url);
      setObData(mergedLogo);
    } catch (e: any) {
      setError(e?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!websiteId || !uid || !files || files.length === 0) return;
    setUploadingFiles(true);
    setError(null);
    try {
      let uploaded = 0;
      for (const file of Array.from(files)) {
        const safeName = file.name.replace(/[^a-zA-Z0-9_\.\-]/g, '_');
        const path = `${uid}/${websiteId}/assets/${Date.now()}_${safeName}`;
        const { error: upErr } = await supabase.storage
          .from('website-assets')
          .upload(path, file, { upsert: false, cacheControl: '3600' });
        if (upErr) throw upErr;
        uploaded++;
      }
      const mergedFiles = {
        ...(obData || {}),
        assetCount: Number(obData?.assetCount ?? 0) + uploaded
      };
      const { error: oupdErr } = await supabase
        .from('onboarding')
        .upsert({ website_id: websiteId, user_id: uid, data: mergedFiles }, { onConflict: 'website_id,user_id' });
      if (oupdErr) throw oupdErr;
      setObData(mergedFiles);
    } catch (e: any) {
      setError(e?.message || 'Failed to upload files');
    } finally {
      setUploadingFiles(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50 shadow-sm transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 mr-1 inline"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <div className="text-sm text-neutral-600">Manage Site</div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleSaveBasics} disabled={saving} className="px-4 py-2 rounded-lg bg-success-accent text-white text-sm hover:opacity-90 disabled:opacity-60 shadow-hover transition-all">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </header>

      <div className="w-full border-b border-neutral-200 bg-white/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-success-accent/15 text-success-ink inline-flex items-center justify-center font-semibold text-base">
                {(name || websiteId || 'W').toString().slice(0,1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-lg font-semibold text-neutral-900 truncate">{name || 'Untitled Website'}</div>
                <div className="text-sm text-neutral-600 mt-0.5">{obData?.category || 'No category'} • {obData?.siteType || 'Unknown type'}</div>
                <div className="text-[11px] font-mono text-neutral-500 truncate mt-0.5">ID: {websiteId}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={classNames(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium border",
                website?.status === 'active' ? "bg-neutral-50 text-emerald-700 border-neutral-200" :
                website?.status === 'draft' ? "bg-neutral-50 text-neutral-700 border-neutral-200" :
                "bg-neutral-50 text-neutral-600 border-neutral-200"
              )}>{website?.status || 'unknown'}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {loading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-soft">Loading…</div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-soft">{error}</div>
        ) : !website ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-4">Not found</div>
        ) : (
          <>
            {/* Summary card (matches dashboard website card vibe) */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-success-accent/15 text-success-ink inline-flex items-center justify-center font-semibold">
                    {(name || 'W').slice(0,1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-900 truncate" title={name || website.id}>{name || `Website ${website.id.slice(0,8)}…`}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-neutral-600">
                      <span>Created {new Date(website.created_at).toLocaleDateString()}</span>
                      <span aria-hidden>•</span>
                      {(website.vercel_prod_domain || domain) ? (
                        <a
                          href={`https://${website.vercel_prod_domain || domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-success-ink hover:underline truncate max-w-[12rem]"
                          title={(website.vercel_prod_domain || domain) || undefined}
                        >
                          {website.vercel_prod_domain || domain}
                        </a>
                      ) : (
                        <span className="text-neutral-500">Domain not connected</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={classNames(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border",
                  website.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  website.status === 'draft' ? "bg-neutral-100 text-neutral-700 border-neutral-200" :
                  "bg-amber-50 text-amber-800 border-amber-200"
                )}>{website.status || 'unknown'}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] text-neutral-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M12 5v14M5 12h14"/></svg>
                  {(Array.isArray(obData?.envisionedPages) ? obData.envisionedPages.length : 0)} pages
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] text-neutral-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M5 7h14M5 12h14M5 17h9"/></svg>
                  {(Array.isArray(obData?.selectedServices) ? obData.selectedServices.length : 0)} services
                </span>
                {obData?.primaryGoal && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-success/30 bg-success-accent/10 px-2 py-1 text-[11px] text-success-ink">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M12 3v18M3 12h18"/></svg>
                    Goal: {obData.primaryGoal}
                  </span>
                )}
                {obData?.contactMethod && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-800">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3 7.18 2 2 0 0 1 5 5h4.09a2 2 0 0 1 2 1.72l.45 2.6a2 2 0 0 1-.54 1.86l-1.27 1.27a16 16 0 0 0 6.88 6.88l1.27-1.27a2 2 0 0 1 1.86-.54l2.6.45A2 2 0 0 1 22 16.92z"/></svg>
                    {obData.contactMethod}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveBasics}
                  disabled={saving}
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 rounded-md bg-success-accent text-white px-3 py-2 text-[12px] hover:opacity-90 disabled:opacity-60 shadow-hover"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 rounded-md border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-[12px] hover:bg-neutral-50 shadow-hover"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18"/></svg>
                  Add Domain
                </button>
                {(() => {
                  const liveUrl = website.vercel_prod_domain ? `https://${website.vercel_prod_domain}` : (domain ? `https://${domain}` : null);
                  return liveUrl ? (
                    <a href={liveUrl} target="_blank" rel="noreferrer" className="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 rounded-md bg-neutral-900 text-white px-3 py-2 text-[12px] hover:bg-neutral-800 shadow-hover">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M14 3h7v7"/><path d="M10 14L21 3"/><path d="M5 12v7a2 2 0 0 0 2 2h7"/></svg>
                      View live
                    </a>
                  ) : null;
                })()}
              </div>
            </section>
            {/* Basics */}
            <section className="rounded-xl border border-neutral-200 bg-white shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-md bg-neutral-200 text-neutral-700 inline-flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M4 6h16M7 10h10M9 14h6"/></svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">Basic Information</div>
                      <div className="text-xs text-neutral-600">Update your site name and domain settings</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-sm font-medium text-neutral-700 mb-1">Site name</div>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-success-accent focus:border-transparent transition-all" placeholder="My Company" />
                  </label>
                  <label className="block">
                    <div className="text-sm font-medium text-neutral-700 mb-1">Domain</div>
                    <input value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-success-accent focus:border-transparent transition-all" placeholder="example.com" />
                  </label>
                  <label className="block">
                    <div className="text-sm font-medium text-neutral-700 mb-1">Business email</div>
                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-success-accent focus:border-transparent transition-all" placeholder="you@company.com" />
                  </label>
                  <label className="block">
                    <div className="text-sm font-medium text-neutral-700 mb-1">Business phone</div>
                    <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-success-accent focus:border-transparent transition-all" placeholder="(555) 555-5555" />
                  </label>
                </div>
                {(() => {
                  const liveUrl = website.vercel_prod_domain ? `https://${website.vercel_prod_domain}` : (domain ? `https://${domain}` : null);
                  return liveUrl ? (
                    <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                      <div className="text-sm text-neutral-800">Live URL: <a className="font-medium text-success-ink hover:underline" href={liveUrl} target="_blank" rel="noreferrer">{liveUrl}</a></div>
                    </div>
                  ) : null;
                })()} 
              </div>
            </section>

            {/* Collapsible details */}
            <details className="rounded-xl border border-neutral-200 bg-white shadow-soft overflow-hidden">
              <summary className="cursor-pointer list-none px-6 py-3 border-b border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-800 flex items-center justify-between">
                <span>More details</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-neutral-500"><path d="M6 9l6 6 6-6"/></svg>
              </summary>

              {/* Business Details */}
              <section className="rounded-xl border border-neutral-200 bg-white shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-md bg-neutral-200 text-neutral-700 inline-flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">Business Information</div>
                    <div className="text-xs text-neutral-600">Contact details and business specifics</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
                    <div className="text-xs text-neutral-500 font-medium mb-1">Primary Goal</div>
                    <div className="text-sm font-semibold text-neutral-900">{obData?.primaryGoal || "Not specified"}</div>
                  </div>
                  <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
                    <div className="text-xs text-neutral-500 font-medium mb-1">Contact Method</div>
                    <div className="text-sm font-semibold text-neutral-900">{obData?.contactMethod || "Not specified"}</div>
                  </div>
                </div>
              </div>
              </section>

              {/* Assets */}
              <section className="rounded-xl border border-neutral-200 bg-white shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-md bg-neutral-200 text-neutral-700 inline-flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 3l9 4-9 4-9-4 9-4zm9 7l-9 4-9-4m18 0v7l-9 4-9-4v-7"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">Assets</div>
                    <div className="text-xs text-neutral-600">Upload your logo and supporting files</div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded border border-neutral-200 object-contain bg-white" />
                  ) : (
                    <div className="h-10 w-10 rounded border border-dashed border-neutral-300 bg-neutral-50 inline-flex items-center justify-center text-neutral-400 text-xs">Logo</div>
                  )}
                  <label className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-[12px] hover:bg-neutral-50 shadow-hover cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && e.target.files[0] && handleUploadLogo(e.target.files[0])} disabled={uploadingLogo} />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M12 5v14M5 12h14"/></svg>
                    {uploadingLogo ? 'Uploading…' : (logoUrl ? 'Replace Logo' : 'Upload Logo')}
                  </label>
                </div>
                <div>
                  <label className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-[12px] hover:bg-neutral-50 shadow-hover cursor-pointer">
                    <input type="file" multiple className="hidden" onChange={(e) => handleUploadFiles(e.target.files)} disabled={uploadingFiles} />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path d="M4 4h16v16H4z"/><path d="M22 6 12 13 2 6"/></svg>
                    {uploadingFiles ? 'Uploading…' : 'Upload Files'}
                  </label>
                </div>
              </div>
              </section>

            {/* Services & Areas */}
            <section className="rounded-xl border border-neutral-200 bg-white shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-md bg-neutral-200 text-neutral-700 inline-flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 2l3 6 6 1-4 4 1 7-6-3-6 3 1-7-4-4 6-1z"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">Services & Coverage</div>
                    <div className="text-xs text-neutral-600">What you offer and where you serve</div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-3">Services Offered</div>
                  {!obData?.selectedServices || obData.selectedServices.length === 0 ? (
                    <div className="text-sm text-neutral-500 italic">No services listed</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {obData.selectedServices.slice(0,3).map((s: string) => (
                        <span key={s} className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M9 12l2 2 4-4"/></svg>
                          {s}
                        </span>
                      ))}
                      {obData.selectedServices.length > 3 && (
                        <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-600">+{obData.selectedServices.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
                {obData?.cities && obData.cities.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-neutral-700 mb-3">Service Areas</div>
                    <div className="space-y-2">
                      {(() => {
                        const city = obData.cities[0];
                        const remaining = obData.cities.length - 1;
                        return (
                          <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-sm font-semibold text-neutral-900">{city.displayName || city.name}</div>
                                <div className="text-xs text-neutral-600 mt-1">Radius: {city.radiusKm}km{remaining > 0 ? ` • +${remaining} more areas` : ''}</div>
                              </div>
                              <div className="text-xs text-neutral-500">
                                {city.lat?.toFixed(4)}, {city.lon?.toFixed(4)}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
              </section>

              {/* Design & Content */}
              <section className="rounded-xl border border-neutral-200 bg-white shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-md bg-neutral-200 text-neutral-700 inline-flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M4 6h16M7 10h10M9 14h6"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">Design & Content Strategy</div>
                    <div className="text-xs text-neutral-600">Visual style and site structure preferences</div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-neutral-700 mb-3">Design Styles</div>
                    {obData?.designStyles && obData.designStyles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {obData.designStyles.slice(0,2).map((style: string) => (
                          <span key={style} className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800">
                            {style}
                          </span>
                        ))}
                        {obData.designStyles.length > 2 && (
                          <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-600">+{obData.designStyles.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500 italic">No design styles specified</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-700 mb-3">Emotional Impact</div>
                    {obData?.emotionalImpact && obData.emotionalImpact.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {obData.emotionalImpact.slice(0,2).map((emotion: string) => (
                          <span key={emotion} className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800">
                            {emotion}
                          </span>
                        ))}
                        {obData.emotionalImpact.length > 2 && (
                          <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-600">+{obData.emotionalImpact.length - 2} more</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500 italic">No emotional impact specified</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-3">Envisioned Pages</div>
                  {obData?.envisionedPages && obData.envisionedPages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {obData.envisionedPages.slice(0,4).map((page: string) => (
                        <span key={page} className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800">{page}</span>
                      ))}
                      {obData.envisionedPages.length > 4 && (
                        <span className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-600">+{obData.envisionedPages.length - 4} more</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-500 italic">No pages specified</div>
                  )}
                </div>
                {/* language and accessibility omitted for brevity */}
              </div>
              </section>

              {/* Technical Details */}
              <section className="rounded-xl border border-neutral-200 bg-white shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-md bg-neutral-200 text-neutral-700 inline-flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M9 12l2 2 4-4M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">Technical & Setup Details</div>
                    <div className="text-xs text-neutral-600">Current website status and configuration</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
                    <div className="text-xs text-neutral-500 font-medium mb-1">Has Logo</div>
                    <div className="text-sm font-semibold text-neutral-900">{obData?.hasLogo ? "Yes" : "No"}</div>
                  </div>
                  <div className="bg-neutral-50 rounded-md p-4 border border-neutral-200">
                    <div className="text-xs text-neutral-500 font-medium mb-1">Created</div>
                    <div className="text-sm font-semibold text-neutral-900">{obData?.createdAt ? new Date(obData.createdAt).toLocaleDateString() : "Unknown"}</div>
                  </div>
                </div>
              </div>
              </section>

            </details>
          </>
        )}
      </main>
    </div>
  );
}
