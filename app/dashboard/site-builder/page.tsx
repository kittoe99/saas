"use client";

import { useEffect, useState } from "react";
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
  const [userId, setUserId] = useState<string | null>(null);
  const [industry, setIndustry] = useState<string>("SaaS");
  const [answers, setAnswers] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [deploy, setDeploy] = useState<boolean>(true);

  const [projectId, setProjectId] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [chatDemo, setChatDemo] = useState<string>("");
  const [deploymentId, setDeploymentId] = useState<string>("");
  const [deploymentUrl, setDeploymentUrl] = useState<string>("");

  const [currentStep, setCurrentStep] = useState<StepKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Auto-start if ?auto=1 and prefill from onboarding
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const auto = url.searchParams.get("auto");
        const websiteId = url.searchParams.get("website_id");
        if (!userId) return;
        // Prefill answers/industry from onboarding
        const ob = await fetch(
          websiteId ? `/api/onboarding?website_id=${encodeURIComponent(websiteId)}` : `/api/onboarding?user_id=${encodeURIComponent(userId)}`,
          { cache: "no-store" }
        );
        if (ob.ok) {
          const j = await ob.json().catch(() => ({} as any));
          const data = j?.row?.data || {};
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
        if (auto === "1") {
          // Kick off build automatically
          setTimeout(() => handleGenerate(), 50);
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

  function stepReached(target: StepKey) {
    const order: StepKey[] = ["submitted", "generated", "preview_ready", "deployed"];
    const ci = currentStep ? order.indexOf(currentStep) : -1;
    const ti = order.indexOf(target);
    return ci >= ti;
  }

  async function postJSON<T>(url: string, body: any): Promise<ApiResult<T>> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as any;
    if (!res.ok) return { error: json?.error || `Request failed: ${res.status}` } as any;
    return json as ApiResult<T>;
  }

  async function refreshChatOnce(id: string) {
    const res = await fetch(`/api/v0/chats/${encodeURIComponent(id)}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      if (data?.demo) setChatDemo(data.demo);
      return Boolean(data?.demo);
    }
    return false;
  }

  async function pollChatPreview(id: string, { attempts = 10, delayMs = 3000 } = {}) {
    for (let i = 0; i < attempts; i++) {
      const ok = await refreshChatOnce(id);
      if (ok) return true;
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  }

  async function refreshDeploymentOnce(id: string) {
    const res = await fetch(`/api/v0/deployments/${encodeURIComponent(id)}`);
    const data = await res.json().catch(() => ({}));
    const url = data?.deployment?.webUrl ?? data?.deployment?.url ?? null;
    if (url) setDeploymentUrl(url);
    return Boolean(url);
  }

  async function pollDeploymentUrl(id: string, { attempts = 12, delayMs = 5000 } = {}) {
    for (let i = 0; i < attempts; i++) {
      const ok = await refreshDeploymentOnce(id);
      if (ok) return true;
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  }

  async function handleGenerate() {
    try {
      setBusy(true);
      setError(null);
      setCurrentStep("submitted");
      setProjectId("");
      setChatId("");
      setChatDemo("");
      setDeploymentId("");
      setDeploymentUrl("");

      const payload = {
        user_id: userId || undefined,
        industry,
        answers: safeParseJSON(answers) ?? {},
        theme: safeParseJSON(theme) ?? undefined,
        deploy,
      };
      if (!payload.user_id) throw new Error("Sign in required");

      const res = await postJSON<{ project: any; chat: any; deployment: any }>(
        "/api/onboarding/generate",
        payload
      );
      if ((res as any).error) throw new Error((res as any).error);

      const pid = (res as any).project?.id as string | undefined;
      const cid = (res as any).chat?.id as string | undefined;
      const demo = (res as any).chat?.demoUrl as string | undefined;
      const depId = (res as any).deployment?.id as string | undefined;
      const depUrl = (res as any).deployment?.url as string | undefined;

      if (pid) setProjectId(pid);
      if (cid) setChatId(cid);
      if (demo) setChatDemo(demo);
      setCurrentStep("generated");

      if (cid && !demo) {
        const ok = await pollChatPreview(cid);
        if (ok) setCurrentStep("preview_ready");
      } else if (demo) {
        setCurrentStep("preview_ready");
      }

      if (depId) setDeploymentId(depId);
      if (depUrl) setDeploymentUrl(depUrl);
      if (depId && !depUrl) {
        const ok = await pollDeploymentUrl(depId);
        if (ok) setCurrentStep("deployed");
      } else if (depUrl) {
        setCurrentStep("deployed");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to generate site");
    } finally {
      setBusy(false);
    }
  }

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
        <div className="text-sm font-medium text-neutral-800">Build your site from onboarding</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            Industry
            <select
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option>SaaS</option>
              <option>eCommerce</option>
              <option>Local Service</option>
              <option>Agency</option>
            </select>
          </label>
          <label className="block text-sm">
            Deploy after generate?
            <select
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
              value={deploy ? "yes" : "no"}
              onChange={(e) => setDeploy(e.target.value === "yes")}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
        <details className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3">
          <summary className="cursor-pointer select-none text-sm font-medium text-neutral-800">Advanced (answers & theme JSON)</summary>
          <div className="mt-3 grid gap-3">
            <label className="block text-sm">
              Onboarding Answers (JSON)
              <textarea
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 h-36 font-mono text-xs"
                value={answers}
                onChange={(e) => setAnswers(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              Theme (JSON, optional)
              <textarea
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 h-36 font-mono text-xs"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Paste theme JSON here (colors, typography, radii, shadows, forms, buttons, dark mode)"
              />
            </label>
          </div>
        </details>
        <button
          onClick={handleGenerate}
          disabled={!userId || busy}
          className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm disabled:opacity-60 hover:opacity-90"
        >
          {busy ? "Building…" : "Build with my onboarding"}
        </button>
        {error && <div className="text-sm text-red-700">{error}</div>}
      </section>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-4 bg-white">
        <div className="text-sm font-medium text-neutral-800">2) Progress</div>
        <ol className="relative space-y-3">
          {STEPS.map((s, idx) => {
            const reached = currentStep ? stepReached(s.key) : false;
            return (
              <li key={s.key} className="pl-6">
                <div className={`absolute left-0 mt-1 h-4 w-4 rounded-full ${reached ? "bg-green-500" : "bg-neutral-300"}`} />
                <div className="text-sm font-medium">{idx + 1}. {s.label}</div>
                <div className="text-xs text-neutral-600">{s.description}</div>
              </li>
            );
          })}
        </ol>
        {(projectId || chatId || deploymentId) && (
          <div className="grid gap-2 text-xs text-neutral-700">
            {projectId && <div>Project ID: <span className="font-mono">{projectId}</span></div>}
            {chatId && <div>Chat ID: <span className="font-mono">{chatId}</span></div>}
            {deploymentId && <div>Deployment ID: <span className="font-mono">{deploymentId}</span></div>}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-4 bg-white">
        <div className="text-sm font-medium text-neutral-800">3) Preview</div>
        {!chatDemo && !deploymentUrl && (
          <div className="text-xs text-neutral-600">No preview yet. Click "Build My Site" above to start, or wait while we prepare your demo/deployment.</div>
        )}
        {chatDemo && (
          <div className="space-y-2">
            <div className="text-xs">Demo (from latest chat version)</div>
            <div className="rounded-lg border bg-neutral-50 p-2">
              <iframe src={chatDemo} width="100%" height={460} className="rounded-md border bg-white" />
            </div>
          </div>
        )}
        {deploymentUrl && (
          <div className="space-y-2">
            <div className="text-xs">Deployment</div>
            <div className="text-xs">URL: <a href={deploymentUrl} target="_blank" rel="noreferrer" className="underline">{deploymentUrl}</a></div>
            <div className="rounded-lg border bg-neutral-50 p-2">
              <iframe src={deploymentUrl} width="100%" height={460} className="rounded-md border bg-white" />
              <div className="text-[11px] text-neutral-500 mt-1">Some sites block iframes. If blank, open the URL in a new tab.</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
