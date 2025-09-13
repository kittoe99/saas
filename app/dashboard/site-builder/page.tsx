"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ApiResult<T = any> = { ok?: boolean; error?: string } & T;

type StepKey = "submitted" | "generated" | "preview_ready" | "deployed";

const STEPS: { key: StepKey; label: string; description: string }[] = [
  { key: "submitted", label: "Submitted", description: "Onboarding submitted and orchestration started" },
  { key: "generated", label: "Generated", description: "Project + Chat created and first version requested" },
  { key: "preview_ready", label: "Preview Ready", description: "Demo URL available for preview" },
  { key: "deployed", label: "Deployed", description: "Deployment URL available" },
];


export default function SiteBuilderPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [industry, setIndustry] = useState<string>("SaaS");
  const [answers, setAnswers] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [deploy] = useState<boolean>(true);

  // Loaded onboarding (raw) for summary display
  const [onboarding, setOnboarding] = useState<any | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Prefill from onboarding using website_id
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const wid = url.searchParams.get("website_id");
        if (wid) setWebsiteId(wid);
        if (!userId) return;
        // Prefill answers/industry from onboarding
        const ob = await fetch(
          wid ? `/api/onboarding?website_id=${encodeURIComponent(wid)}` : `/api/onboarding?user_id=${encodeURIComponent(userId)}`,
          { cache: "no-store" }
        );
        if (ob.ok) {
          const j = await ob.json().catch(() => ({} as any));
          const data = j?.row?.data || {};
          setOnboarding(data);
          const st = (data?.siteType as string | undefined) || '';
          const mapped = mapSiteTypeToIndustry(st);
          if (mapped) setIndustry(mapped);
          const a: any = {};
          const businessName = (data?.name as string | undefined) || 'New Site';
          a.brand = { name: businessName, tagline: data?.tagline || undefined };
          a.businessName = businessName;
          a.audience = data?.primaryGoal || data?.typeSpecific?.icp || '';
          a.tone = Array.isArray(data?.voiceTone) && data.voiceTone.length ? data.voiceTone.join(', ') : 'clear, modern';
          if (Array.isArray(data?.envisionedPages) && data.envisionedPages.length) a.pages = data.envisionedPages;
          if (Array.isArray(data?.selectedServices) && data.selectedServices.length) a.services = data.selectedServices;
          if (data?.contactMethod) a.contactMethod = data.contactMethod;
          setAnswers(JSON.stringify(a, null, 2));
        }
      } catch {}
    })();
  }, [userId]);

  function mapSiteTypeToIndustry(st: string): string {
    const key = (st || '').toLowerCase();
    if (key.includes('saas')) return 'SaaS';
    if (key.includes('ecommerce')) return 'eCommerce';
    if (key.includes('agency')) return 'Agency';
    if (key.includes('business') || key.includes('service')) return 'Local Service';
    return 'SaaS';
  }

  // All build actions and chat continuation are intentionally disabled here

  function safeParseJSON(s: string) {
    try { return s ? JSON.parse(s) : undefined } catch { return undefined }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Site Builder</h1>
        <p className="text-sm text-neutral-600">Signed in user_id: {userId || "(not signed in)"}</p>
        {!userId && (
          <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            Sign in to build and preview your site.
          </div>
        )}
      </header>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-neutral-800">Onboarding summary</div>
          {websiteId && (
            <div className="text-[11px] text-neutral-500">Website ID: <span className="font-mono">{websiteId}</span></div>
          )}
        </div>
        {!onboarding ? (
          <div className="text-xs text-neutral-600">Loading your onboarding details…</div>
        ) : (
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 font-semibold">
                {(onboarding?.name || '—').toString().slice(0,1).toUpperCase()}
              </div>
              <div>
                <div className="text-base font-medium text-neutral-900">{onboarding?.name || '—'}</div>
                <div className="text-xs text-neutral-500">{onboarding?.tagline || 'No tagline provided'}</div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 bg-white p-3">
                <div className="text-[11px] text-neutral-500">Site Type</div>
                <div className="text-sm text-neutral-800 mt-0.5">{onboarding?.siteType || '—'}</div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-3">
                <div className="text-[11px] text-neutral-500">Category</div>
                <div className="text-sm text-neutral-800 mt-0.5">{onboarding?.category || '—'}</div>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-3">
                <div className="text-[11px] text-neutral-500">Contact</div>
                <div className="text-sm text-neutral-800 mt-0.5">{onboarding?.contactMethod || '—'}</div>
              </div>
            </div>
            {Array.isArray(onboarding?.envisionedPages) && onboarding.envisionedPages.length > 0 && (
              <div>
                <div className="text-[11px] text-neutral-500 mb-1">Pages</div>
                <div className="flex flex-wrap gap-2">
                  {onboarding.envisionedPages.slice(0, 16).map((p: string, i: number) => (
                    <span key={`${p}-${i}`} className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-700">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(onboarding?.selectedServices) && onboarding.selectedServices.length > 0 && (
              <div>
                <div className="text-[11px] text-neutral-500 mb-1">Services</div>
                <div className="flex flex-wrap gap-2">
                  {onboarding.selectedServices.slice(0, 16).map((s: string, i: number) => (
                    <span key={`${s}-${i}`} className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="pt-3 flex items-center justify-between">
          <div className="text-xs text-neutral-600">Review these details. You can proceed when ready.</div>
          <button
            onClick={() => {
              const qp = new URLSearchParams();
              if (websiteId) qp.set('website_id', websiteId);
              qp.set('step', 'init');
              router.push(`/dashboard/site-builder?${qp.toString()}`);
            }}
            className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90"
          >
            Continue
          </button>
        </div>
      </section>
    </div>
  );
}
