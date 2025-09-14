"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { resolveIndustry, getBlueprint } from "@/lib/blueprints";
import { getSectionCode } from "@/lib/sections";

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
  const [step, setStep] = useState<string | null>(null);
  const [industry, setIndustry] = useState<string>("SaaS");
  const [answers, setAnswers] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [deploy] = useState<boolean>(true);

  // Loaded onboarding (raw) for summary display
  const [onboarding, setOnboarding] = useState<any | null>(null);

  // Local-only simulated build state (no API calls)
  const [simBusy, setSimBusy] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0); // 0-100
  const [simStage, setSimStage] = useState<string>("");
  const [simDone, setSimDone] = useState<boolean>(false);
  const [attachedChatId, setAttachedChatId] = useState<string | null>(null);
  const [heroSent, setHeroSent] = useState<boolean>(false);
  const [servicesSent, setServicesSent] = useState<boolean>(false);
  const [areasSent, setAreasSent] = useState<boolean>(false);
  const [globalSent, setGlobalSent] = useState<boolean>(false);
  const [stepsState, setStepsState] = useState<Record<string, 'pending' | 'done'> | null>(null);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  // Visible error banners
  const [startError, setStartError] = useState<string | null>(null);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Animated loader steps (similar to Onboarding step 4)
  const BUILD_STEPS = [
    'Connecting to builder',
    'Analyzing structure',
    'Generating sections',
    'Applying styles',
    'Updating preview',
  ];
  const [buildStepIndex, setBuildStepIndex] = useState(0);
  useEffect(() => {
    if (!simBusy) {
      setBuildStepIndex(0);
      return;
    }
    setBuildStepIndex(0);
    let i = 0;
    const id = setInterval(() => {
      i = Math.min(i + 1, BUILD_STEPS.length - 1);
      setBuildStepIndex(i);
      if (i >= BUILD_STEPS.length - 1) {
        clearInterval(id);
      }
    }, 1400);
    return () => clearInterval(id);
  }, [simBusy]);

  const liveStage = simStage || (simBusy ? BUILD_STEPS[buildStepIndex] : '');

  // Collapsed summary card for completed stages
  function CollapsedCard({ title, note }: { title: string; note?: string }) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="h-3.5 w-3.5"><path d="M5 13l4 4L19 7"/></svg>
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium text-neutral-900 truncate">{title}</div>
            {note && <div className="text-xs text-neutral-600 truncate">{note}</div>}
          </div>
        </div>
        <span className="text-[11px] text-neutral-500">Completed</span>
      </div>
    );
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Prefill from onboarding using website_id and restore step progress
  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const wid = url.searchParams.get("website_id");
        const st = url.searchParams.get("step");
        const resumeFlag = url.searchParams.get("resume") === '1';
        if (st) setStep(st);
        if (wid) setWebsiteId(wid);
        if (!userId) return;
        // Load progress for this website/user
        if (wid) {
          const prog = await fetch(`/api/sitebuild/steps?website_id=${encodeURIComponent(wid)}&user_id=${encodeURIComponent(userId)}`, { cache: 'no-store' });
          const pj = await prog.json().catch(() => ({} as any));
          let steps: Record<string, 'pending' | 'done'> | null = pj?.steps || null;
          // Initialize with all steps pending if no record; do not persist yet
          if (!steps) {
            steps = { hero: 'pending', services: 'pending', areas: 'pending', global: 'pending', deploy: 'pending' };
          }
          setStepsState(steps);
          // Reflect into local flags and route to next pending if current step is missing or completed
          setHeroSent(steps.hero === 'done');
          setServicesSent(steps.services === 'done');
          setAreasSent(steps.areas === 'done');
          setGlobalSent(steps.global === 'done');
          // If deployment already completed, go to dashboard
          if (steps.deploy === 'done') {
            router.push('/dashboard');
            return;
          }
          const current = st || null;
          const order = ['hero','services','areas','global','deploy'];
          const nextPending = order.find(k => (steps as any)[k] !== 'done');
          // Only auto-route if a step was explicitly provided and is already done
          if (current && (steps as any)[current] === 'done') {
            if (nextPending) {
              const qp = new URLSearchParams();
              if (wid) qp.set('website_id', wid);
              qp.set('step', nextPending);
              router.push(`/dashboard/site-builder?${qp.toString()}`);
            }
          }
        }
        // Attempt to resume: check if the website already has a v0_chat_id
        if (wid && resumeFlag) {
          const { data: siteRow, error: siteErr } = await supabase
            .from('websites')
            .select('v0_chat_id')
            .eq('id', wid)
            .eq('user_id', userId)
            .maybeSingle();
          if (!siteErr && siteRow?.v0_chat_id) {
            const cid = siteRow.v0_chat_id as string;
            setAttachedChatId(cid);
            // Quick check: is preview already available?
            try {
              const res = await fetch(`/api/v0/chats/${encodeURIComponent(cid)}`);
              const j = await res.json().catch(() => ({} as any));
              const demo = j?.demo || j?.chat?.demoUrl || j?.chat?.latestVersion?.demoUrl;
              if (demo) {
                setSimStage('Build complete');
                setSimProgress(100);
                setSimDone(true);
              } else {
                // Attach to SSE to wait for completion
                setSimBusy(true);
                setSimStage('Resuming build…');
                setSimProgress(25);
                const es = new EventSource(`/api/sitebuild/stream?chatId=${encodeURIComponent(cid)}`);
                let localProgress = 25;
                es.onmessage = (ev) => {
                  try {
                    const data = JSON.parse(ev.data || '{}');
                    if (data?.type === 'stage') {
                      setSimStage(data.label || 'Working…');
                      localProgress = Math.min(90, localProgress + 8);
                      setSimProgress(localProgress);
                    } else if (data?.type === 'preview') {
                      setSimStage('Preview ready');
                      setSimProgress(96);
                    } else if (data?.type === 'complete') {
                      setSimStage('Build complete');
                      setSimProgress(100);
                      setSimDone(true);
                      setSimBusy(false);
                      es.close();
                    } else if (data?.type === 'timeout') {
                      setSimStage('Timed out waiting for preview');
                      setSimBusy(false);
                      es.close();
                    } else if (data?.type === 'error') {
                      setSimStage(`Error: ${data.error}`);
                      setSimBusy(false);
                      es.close();
                    }
                  } catch {}
                };
                es.onerror = () => {
                  setSimStage('Connection error');
                  setSimBusy(false);
                  es.close();
                };
              }
            } catch {}
          }
        }
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
          const mapped = resolveIndustry(st);
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

  // All build actions and chat continuation are intentionally disabled here

  function safeParseJSON(s: string) {
    try { return s ? JSON.parse(s) : undefined } catch { return undefined }
  }

  function buildInitialMessage(data: any, resolved: string): string {
    if (!data || typeof data !== 'object') return '';
    const brandName = (data?.name || data?.brand?.name || 'New Site').toString();
    const tagline = (data?.tagline || '').toString();
    const siteType = (data?.siteType || '').toString();
    const category = (data?.category || '').toString();
    const audience = (data?.primaryGoal || data?.typeSpecific?.icp || '').toString();
    const tone = Array.isArray(data?.voiceTone) && data.voiceTone.length ? data.voiceTone.join(', ') : 'clear, modern';
    const pages = Array.isArray(data?.envisionedPages) ? data.envisionedPages.join(', ') : '';
    const services = Array.isArray(data?.selectedServices) ? data.selectedServices.join(', ') : '';
    const contactMethod = (data?.contactMethod || '').toString();
    const email = (data?.businessEmail || '').toString();
    const phone = (data?.businessPhone || '').toString();
    const socials: string[] = [];
    if (data?.social?.x) socials.push(`X/Twitter: ${data.social.x}`);
    if (data?.social?.linkedin) socials.push(`LinkedIn: ${data.social.linkedin}`);
    if (data?.social?.instagram) socials.push(`Instagram: ${data.social.instagram}`);
    if (data?.social?.facebook) socials.push(`Facebook: ${data.social.facebook}`);
    const areas = Array.isArray(data?.cities) ? data.cities.map((c: any) => c?.displayName || c?.name).filter(Boolean).join(', ') : '';
    const preferredDomain = (data?.preferredDomain || '').toString();
    const competitors = Array.isArray(data?.competitors) ? data.competitors.filter((v: string) => v && v.trim().length).join(', ') : '';

    return `Build a website for a ${resolved} business using the details below. Follow the System Prompt (theme) strictly.\n\nBusiness\n- Name: ${brandName}\n- Tagline: ${tagline || 'Professional services'}\n- Type/Category: ${[siteType, category].filter(Boolean).join(' / ') || '—'}\n- Audience: ${audience || '—'}\n- Tone: ${tone}\n\nPages (create routes and files)\n- Create: ${pages || 'home, about, contact'}\n- Include 404, privacy, terms if not listed.\n\nKey Sections (fill with sensible placeholders if content is missing)\n- Hero: value prop + supporting line + primary CTA.\n- Services/Offering: ${services || 'core offerings'} with short descriptions.\n- Pricing/Packages (if relevant): 2–4 plan cards unless specified.\n- Social proof: testimonials or placeholder quotes.\n- FAQ: 6–8 Q/A pairs.\n- Contact: ${contactMethod || 'form'} with solid-fields spec.\n\nTheme & UX (must follow the System Prompt)\n- Terracotta palette (#C0452C primary, hover #A53A24), background #FCFAF7, text #2D2A26/#6B6660.\n- Forms: solid fields, 1.5px #DDDAD6 border, 8px radius, focus ring 0 0 0 3px rgba(192,69,44,.2).\n- Components: radii per spec; shadows for elevation; minimal borders.\n- Typography: Geist; headings 600; body 16px/1.6; labels 500 with 0.02em.\n\nContent & Data\n- Services: ${services || '—'}\n- Contact: method ${contactMethod || 'form'}; email ${email || '—'}; phone ${phone || '—'}\n- Social: ${socials.join(' | ') || '—'}\n- Areas served: ${areas || '—'}\n- Domain preference: ${preferredDomain || '—'}\n- Competitors (for positioning; do not copy): ${competitors || '—'}\n\nRequirements\n- Accessibility: WCAG AA; visible focus states; adequate contrast.\n- Responsive layout for mobile/tablet/desktop.\n- SEO: meta title/description; OpenGraph defaults.\n- If inputs are missing, scaffold placeholders and TODO comments.\n\nDeliverables\n- Working version preview that reflects the above, using the System Prompt theme exactly.`;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Building your site</h1>
        <p className="text-sm text-neutral-600">Signed in user_id: {userId || "(not signed in)"}</p>
        {!userId && (
          <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            Sign in to build and preview your site.
          </div>
        )}
      </header>

      {/* Start Building - orchestration kickoff */}
      <section className="rounded-xl border border-neutral-200 p-6 shadow-soft space-y-5 bg-white">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">Start</h2>
            <p className="text-sm text-neutral-600">We’ll use your onboarding details and our theme system to build your site. You’ll see live activity below.</p>
            {!websiteId && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 inline-block">Tip: open this page with a website_id query param to target a specific site.</div>
            )}
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-medium text-neutral-800">Build Activity</div>
            {simBusy && (
              <div className="mt-2 flex items-center gap-3 text-sm text-neutral-700">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-400 border-t-success-accent" />
                <span>{liveStage}</span>
              </div>
            )}
          </div>
          {!simDone ? (
            <>
            <button
              onClick={async () => {
                if (simBusy) return;
                if (!websiteId) { setSimStage('Missing website'); return; }
                setSimBusy(true);
                setStartError(null);
                setSimStage('Initializing…');
                setSimProgress(8);
                try {
                  const res = await fetch('/api/sitebuild/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ website_id: websiteId })
                  });
                  const json = await res.json().catch(() => ({} as any));
                  if (!res.ok) throw new Error(json?.error || 'Failed to start build');
                  const chatId: string | undefined = json?.chat?.id || json?.chatId;
                  if (!chatId) throw new Error('Missing chatId');
                  setAttachedChatId(chatId);
                  setSimStage('Waiting for preview…');
                  setSimProgress(25);
                  // Listen to SSE
                  const url = `/api/sitebuild/stream?chatId=${encodeURIComponent(chatId)}`;
                  const es = new EventSource(url);
                  let localProgress = 25;
                  es.onmessage = (ev) => {
                    try {
                      const data = JSON.parse(ev.data || '{}');
                      if (data?.type === 'stage') {
                        setSimStage(data.label || 'Working…');
                        localProgress = Math.min(90, localProgress + 10);
                        setSimProgress(localProgress);
                      } else if (data?.type === 'preview') {
                        setSimStage('Preview ready');
                        setSimProgress(96);
                      } else if (data?.type === 'complete') {
                        setSimStage('Build complete');
                        setSimProgress(100);
                        setSimDone(true);
                        setSimBusy(false);
                        es.close();
                      } else if (data?.type === 'timeout') {
                        setSimStage('Timed out waiting for preview');
                        setSimBusy(false);
                        es.close();
                      } else if (data?.type === 'error') {
                        setSimStage(`Error: ${data.error}`);
                        setSimBusy(false);
                        es.close();
                      }
                    } catch {}
                  };
                  es.onerror = () => {
                    setSimStage('Connection error');
                    setSimBusy(false);
                    es.close();
                  };
                } catch (e: any) {
                  const msg = e?.message || 'Failed to start';
                  setSimStage(msg);
                  setStartError(msg);
                  setSimBusy(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
              disabled={simBusy || !websiteId}
            >
              {simBusy ? 'Working…' : 'Start'}
            </button>
            {startError && (
              <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {startError}
              </div>
            )}
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-600">Build completed successfully. You can continue.</div>
              <button
                onClick={() => {
                  const qp = new URLSearchParams();
                  if (websiteId) qp.set('website_id', websiteId);
                  qp.set('step', 'hero');
                  setStep('hero');
                  router.push(`/dashboard/site-builder?${qp.toString()}`);
                }}
                className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90"
              >
                Continue
              </button>
            </div>
          )}
      </section>

      {/* Collapsed summaries of completed stages (in order) */}
      {stepsState && (
        <div className="space-y-2">
          {stepsState.hero === 'done' && <CollapsedCard title="Initial layout" note="Base structure prepared" />}
          {stepsState.services === 'done' && <CollapsedCard title="Content updates" note="Key sections adjusted" />}
          {stepsState.areas === 'done' && <CollapsedCard title="Location setup" note="Coverage details added" />}
          {stepsState.global === 'done' && <CollapsedCard title="Design polish" note="Consistent nav & footer" />}
        </div>
      )}

      {step === 'init' && (
        <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-4 bg-white">
          <div className="text-sm font-medium text-neutral-800">Init Preview: what we'll send</div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="text-[11px] text-neutral-500">System Prompt (Theme)</div>
              <pre className="whitespace-pre-wrap text-xs leading-relaxed rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-neutral-800 max-h-72 overflow-auto">
{`Site theme
1) Color & Contrast
- Background: #FCFAF7
- Terracotta: primary #C0452C, hover/focus #A53A24; subtle bg #F8E9E6
- Text: primary #2D2A26, secondary #6B6660

2) Typography
- Font: Geist; Headings 600; Body 16px/1.6; Labels 500 with 0.02em

3) Surfaces & Layers
- Radii: Cards 12px, Inputs/Buttons 8px
- Shadows: Card low 0 2px 8px rgba(0,0,0,.08); High 0 8px 30px rgba(0,0,0,.12)

4) Forms (Solid fields)
- Background #FFF; Border 1.5px #DDDAD6; Radius 8px; Inset shadow
- Focus ring: 0 0 0 3px rgba(192,69,44,.2) with border #C0452C

5) Buttons
- Primary: #C0452C; Hover #A53A24; Focus ring as forms; text white 600

6) Borders & Emphasis
- Prefer elevation/color; use borders sparingly functionally

7) Motion
- Gentle <300ms; respect reduced-motion

8) Dark Mode
- Background #1A1A1A; Text #EDEDED; Surfaces #252525/#2D2D2D; Accent #D55A41
- Inputs: bg #252525; border 1.5px #444; focus 0 0 0 3px rgba(213,90,65,.4)`}
              </pre>
            </div>
            <div className="space-y-2">
              <div className="text-[11px] text-neutral-500">User Brief (from onboarding)</div>
              <textarea
                readOnly
                className="w-full h-72 rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs text-neutral-800"
                value={answers}
              />
            </div>
            <div className="space-y-2">
              <div className="text-[11px] text-neutral-500">Initial Chat Message</div>
              <pre className="whitespace-pre-wrap text-xs leading-relaxed rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-neutral-800 max-h-72 overflow-auto">
{buildInitialMessage(onboarding, industry)}
              </pre>
            </div>
          </div>
          {/* Industry Blueprint Summary */}
          <div className="pt-2 rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-neutral-800">Industry Blueprint</div>
              <div className="text-[11px] text-neutral-500">Resolved: {industry}</div>
            </div>
            {(() => {
              const bp = getBlueprint(industry);
              return (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[11px] text-neutral-500 mb-1">Required Pages</div>
                    <div className="flex flex-wrap gap-2">
                      {bp.pages.slice(0, 24).map((p) => (
                        <span key={p} className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] text-neutral-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-500 mb-1">Sections per Page (guideline)</div>
                    <div className="max-h-52 overflow-auto rounded-md border border-neutral-200 bg-neutral-50 p-2 text-[11px] text-neutral-800">
                      {Object.entries(bp.sections).map(([page, secs]) => (
                        <div key={page} className="mb-2">
                          <div className="font-medium">{page}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {secs.map((s) => (
                              <span key={`${page}-${s}`} className="inline-flex items-center rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] text-neutral-700">{s}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
          <div className="pt-4">
            <button
              onClick={() => {
                const qp = new URLSearchParams();
                if (websiteId) qp.set('website_id', websiteId);
                qp.set('step', 'pages');
                router.push(`/dashboard/site-builder?${qp.toString()}`);
              }}
              className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90"
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {step === 'hero' && (
        <section className="rounded-xl border border-neutral-200 p-6 shadow-soft space-y-5 bg-white">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">Continue Site Build</h2>
            <p className="text-sm text-neutral-600">We’re updating your site. You’ll see live activity below.</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-medium text-neutral-800">Build Activity</div>
            <div className="mt-2 flex items-center gap-3 text-sm text-neutral-700">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-400 border-t-success-accent" />
              <span>{simStage}</span>
            </div>
          </div>
          {!heroSent ? (
            <>
            <button
              onClick={async () => {
                if (simBusy) return;
                if (!userId) return;
                setSimBusy(true);
                setHeroError(null);
                setSimStage('Selecting hero…');
                setSimProgress(8);
                try {
                  const keys = ['hero','hero_alt'] as const;
                  const pick = keys[Math.floor(Math.random()*keys.length)];
                  const code = getSectionCode(pick as any);
                  setSimStage('Sending hero to builder…');
                  setSimProgress(18);
                  const r = await fetch('/api/sitebuild/continue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: userId,
                      website_id: websiteId,
                      chatId: attachedChatId || undefined,
                      message: `Design our hero like this: \n\n${code}`,
                    })
                  });
                  const j = await r.json().catch(() => ({} as any));
                  if (!r.ok) throw new Error(j?.error || 'Failed to send hero');
                  const cid = j?.chatId as string | undefined;
                  if (!cid && !attachedChatId) throw new Error('Missing chatId');
                  const chatToUse = cid || attachedChatId!;
                  setHeroSent(true);
                  setSimStage('Waiting for hero preview…');
                  setSimProgress(30);
                  const es = new EventSource(`/api/sitebuild/stream?chatId=${encodeURIComponent(chatToUse)}`);
                  let localProgress = 30;
                  es.onmessage = (ev) => {
                    try {
                      const data = JSON.parse(ev.data || '{}');
                      if (data?.type === 'stage') {
                        setSimStage(data.label || 'Working…');
                        localProgress = Math.min(92, localProgress + 6);
                        setSimProgress(localProgress);
                      } else if (data?.type === 'preview') {
                        setSimStage('Preview updated');
                        setSimProgress(96);
                      } else if (data?.type === 'complete') {
                        setSimStage('Hero added');
                        setSimProgress(100);
                        setSimDone(true);
                        setSimBusy(false);
                        // Persist step completion
                        try {
                          const newSteps = { ...(stepsState || {}), hero: 'done' as const };
                          setStepsState(newSteps);
                          void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                        } catch {}
                        es.close();
                      } else if (data?.type === 'timeout') {
                        setSimStage('Timed out waiting for hero');
                        setSimBusy(false);
                        es.close();
                      } else if (data?.type === 'error') {
                        setSimStage(`Error: ${data.error}`);
                        setSimBusy(false);
                        es.close();
                      }
                    } catch {}
                  };
                  es.onerror = () => {
                    setSimStage('Connection error');
                    setSimBusy(false);
                    es.close();
                  };
                } catch (e: any) {
                  const msg = e?.message || 'Failed to start hero step';
                  setSimStage(msg);
                  setHeroError(msg);
                  setSimBusy(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
              disabled={simBusy || !userId}
            >
              {simBusy ? 'Working…' : 'Continue'}
            </button>
            {heroError && (
              <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {heroError}
              </div>
            )}
          </>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-600">Update applied. Continue when ready.</div>
              <button
                onClick={() => {
                  const qp = new URLSearchParams();
                  if (websiteId) qp.set('website_id', websiteId);
                  qp.set('step', 'services');
                  setStep('services');
                  router.push(`/dashboard/site-builder?${qp.toString()}`);
                }}
                className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90"
              >
                Continue
              </button>
            </div>
          )}
        </section>
      )}

      {step === 'services' && (
        <section className="rounded-xl border border-neutral-200 p-6 shadow-soft space-y-5 bg-white">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">Continue Site Build</h2>
            <p className="text-sm text-neutral-600">We’re updating your site. You’ll see live activity below.</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-medium text-neutral-800">Build Activity</div>
            <div className="mt-2 flex items-center gap-3 text-sm text-neutral-700">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-400 border-t-success-accent" />
              <span>{simStage}</span>
            </div>
          </div>
          {!servicesSent ? (
            <>
            <button
              onClick={async () => {
                if (simBusy) return;
                if (!userId) return;
                setSimBusy(true);
                setServicesError(null);
                setSimStage('Selecting services layout…');
                setSimProgress(8);
                try {
                  const keys = ['services','services_alt'] as const;
                  const pick = keys[Math.floor(Math.random()*keys.length)];
                  const code = getSectionCode(pick as any);
                  setSimStage('Sending services to builder…');
                  setSimProgress(18);
                  const r = await fetch('/api/sitebuild/continue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: userId,
                      website_id: websiteId,
                      chatId: attachedChatId || undefined,
                      message: `Design our services section like this: \n\n${code}`,
                    })
                  });
                  const j = await r.json().catch(() => ({} as any));
                  if (!r.ok) throw new Error(j?.error || 'Failed to send services');
                  const cid = j?.chatId as string | undefined;
                  if (!cid && !attachedChatId) throw new Error('Missing chatId');
                  const chatToUse = cid || attachedChatId!;
                  setServicesSent(true);
                  setSimStage('Waiting for services preview…');
                  setSimProgress(30);
                  const es = new EventSource(`/api/sitebuild/stream?chatId=${encodeURIComponent(chatToUse)}`);
                  let localProgress = 30;
                  es.onmessage = (ev) => {
                    try {
                      const data = JSON.parse(ev.data || '{}');
                      if (data?.type === 'stage') {
                        setSimStage(data.label || 'Working…');
                        localProgress = Math.min(92, localProgress + 6);
                        setSimProgress(localProgress);
                      } else if (data?.type === 'preview') {
                        setSimStage('Preview updated');
                        setSimProgress(96);
                      } else if (data?.type === 'complete') {
                        setSimStage('Services added');
                        setSimProgress(100);
                        setSimDone(true);
                        setSimBusy(false);
                        // Persist step completion
                        try {
                          const newSteps = { ...(stepsState || {}), services: 'done' as const };
                          setStepsState(newSteps);
                          void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                        } catch {}
                        es.close();
                      } else if (data?.type === 'timeout') {
                        setSimStage('Timed out waiting for services');
                        setSimBusy(false);
                        es.close();
                      } else if (data?.type === 'error') {
                        setSimStage(`Error: ${data.error}`);
                        setSimBusy(false);
                        es.close();
                      }
                    } catch {}
                  };
                  es.onerror = () => {
                    setSimStage('Connection error');
                    setSimBusy(false);
                    es.close();
                  };
                } catch (e: any) {
                  setSimStage(e?.message || 'Failed to start services step');
                  setSimBusy(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
              disabled={simBusy || !userId}
            >
              {simBusy ? 'Working…' : 'Continue'}
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-600">Update applied. Continue when ready.</div>
              <button
                onClick={() => {
                  const qp = new URLSearchParams();
                  if (websiteId) qp.set('website_id', websiteId);
                  qp.set('step', 'areas');
                  setStep('areas');
                  router.push(`/dashboard/site-builder?${qp.toString()}`);
                }}
                className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90"
              >
                Continue
              </button>
            </div>
          )}
        </section>
      )}

      {step === 'areas' && (
        <section className="rounded-xl border border-neutral-200 p-6 shadow-soft space-y-5 bg-white">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">Add Service Areas Section</h2>
            <p className="text-sm text-neutral-600">We’ll randomly pick a service areas layout and ask v0 to implement it. Live status will appear below.</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-medium text-neutral-800">Service Areas Progress</div>
            <div className="mt-2 h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
              <div className="h-full bg-success-accent transition-all" style={{ width: `${simProgress}%` }} />
            </div>
            <div className="mt-2 text-xs text-neutral-600 flex items-center gap-2">
              {(simBusy && !simDone) && (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
              )}
              <span>{simStage}</span>
            </div>
          </div>
          {!areasSent ? (
            <button
              onClick={async () => {
                if (simBusy) return;
                if (!userId) return;
                setSimBusy(true);
                setSimStage('Selecting service areas layout…');
                setSimProgress(8);
                try {
                  const keys = ['areas','areas_alt'] as const;
                  const pick = keys[Math.floor(Math.random()*keys.length)];
                  const code = getSectionCode(pick as any);
                  setSimStage('Sending service areas to builder…');
                  setSimProgress(18);
                  const r = await fetch('/api/sitebuild/continue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: userId,
                      website_id: websiteId,
                      message: `Design our service areas section like this: \n\n${code}`,
                    })
                  });
                  const j = await r.json().catch(() => ({} as any));
                  if (!r.ok) throw new Error(j?.error || 'Failed to send service areas');
                  const cid = j?.chatId as string | undefined;
                  if (!cid && !attachedChatId) throw new Error('Missing chatId');
                  const chatToUse = cid || attachedChatId!;
                  setAreasSent(true);
                  setSimStage('Waiting for service areas preview…');
                  setSimProgress(30);
                  const es = new EventSource(`/api/sitebuild/stream?chatId=${encodeURIComponent(chatToUse)}`);
                  let localProgress = 30;
                  es.onmessage = (ev) => {
                    try {
                      const data = JSON.parse(ev.data || '{}');
                      if (data?.type === 'stage') {
                        setSimStage(data.label || 'Working…');
                        localProgress = Math.min(92, localProgress + 6);
                        setSimProgress(localProgress);
                      } else if (data?.type === 'preview') {
                        setSimStage('Preview updated');
                        setSimProgress(96);
                      } else if (data?.type === 'complete') {
                        setSimStage('Service areas added');
                        setSimProgress(100);
                        setSimDone(true);
                        setSimBusy(false);
                        // Persist step completion
                        try {
                          const newSteps = { ...(stepsState || {}), areas: 'done' as const };
                          setStepsState(newSteps);
                          void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                        } catch {}
                        es.close();
                      } else if (data?.type === 'timeout') {
                        setSimStage('Timed out waiting for service areas');
                        setSimBusy(false);
                        es.close();
                      } else if (data?.type === 'error') {
                        setSimStage(`Error: ${data.error}`);
                        setSimBusy(false);
                        es.close();
                      }
                    } catch {}
                  };
                  es.onerror = () => {
                    setSimStage('Connection error');
                    setSimBusy(false);
                    es.close();
                  };
                } catch (e: any) {
                  setSimStage(e?.message || 'Failed to start service areas step');
                  setSimBusy(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
              disabled={simBusy || !userId}
            >
              {simBusy ? 'Working…' : 'Continue'}
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-600">Service areas step completed. Continue to the next step.</div>
              <button
                onClick={() => {
                  const qp = new URLSearchParams();
                  if (websiteId) qp.set('website_id', websiteId);
                  qp.set('step', 'global');
                  setStep('global');
                  router.push(`/dashboard/site-builder?${qp.toString()}`);
                }}
                className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90"
              >
                Continue
              </button>
            </div>
          )}
        </section>
      )}

      {step === 'global' && (
        <section className="rounded-xl border border-neutral-200 p-6 shadow-soft space-y-5 bg-white">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">Finalize Design Elements</h2>
            <p className="text-sm text-neutral-600">We’re refining your site for consistency across pages and devices.</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-medium text-neutral-800">Build Activity</div>
            <div className="mt-2 flex items-center gap-3 text-sm text-neutral-700">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-400 border-t-success-accent" />
              <span>{simStage}</span>
            </div>
          </div>
          {!globalSent ? (
            <button
              onClick={async () => {
                if (simBusy) return;
                if (!userId) return;
                setSimBusy(true);
                setSimStage('Sending global update…');
                setSimProgress(12);
                try {
                  const message = 'make sure homepage has a "service areas" section, let navigation menu and footer appear in all pages, then add relevant site images. Also, make nav menu and footer design more appealing on mobile, tab and desktop';
                  const r = await fetch('/api/sitebuild/continue', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: userId,
                      website_id: websiteId,
                      message,
                    })
                  });
                  const j = await r.json().catch(() => ({} as any));
                  if (!r.ok) throw new Error(j?.error || 'Failed to send global update');
                  const cid = j?.chatId as string | undefined;
                  if (!cid && !attachedChatId) throw new Error('Missing chatId');
                  const chatToUse = cid || attachedChatId!;
                  setGlobalSent(true);
                  setSimStage('Waiting for global update preview…');
                  setSimProgress(28);
                  const es = new EventSource(`/api/sitebuild/stream?chatId=${encodeURIComponent(chatToUse)}`);
                  let localProgress = 28;
                  es.onmessage = (ev) => {
                    try {
                      const data = JSON.parse(ev.data || '{}');
                      if (data?.type === 'stage') {
                        setSimStage(data.label || 'Working…');
                        localProgress = Math.min(92, localProgress + 6);
                        setSimProgress(localProgress);
                      } else if (data?.type === 'preview') {
                        setSimStage('Preview updated');
                        setSimProgress(96);
                      } else if (data?.type === 'complete') {
                        setSimStage('Global elements applied');
                        setSimProgress(100);
                        setSimDone(true);
                        setSimBusy(false);
                        // Persist step completion
                        try {
                          const newSteps = { ...(stepsState || {}), global: 'done' as const };
                          setStepsState(newSteps);
                          void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                        } catch {}
                        es.close();
                      } else if (data?.type === 'timeout') {
                        setSimStage('Timed out waiting for global update');
                        setSimBusy(false);
                        es.close();
                      } else if (data?.type === 'error') {
                        setSimStage(`Error: ${data.error}`);
                        setSimBusy(false);
                        es.close();
                      }
                    } catch {}
                  };
                  es.onerror = () => {
                    setSimStage('Connection error');
                    setSimBusy(false);
                    es.close();
                  };
                } catch (e: any) {
                  setSimStage(e?.message || 'Failed to start global step');
                  setSimBusy(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
              disabled={simBusy || !userId}
            >
              {simBusy ? 'Working…' : 'Continue'}
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-600">Update applied. Continue when ready.</div>
              <button
                onClick={() => {
                  const qp = new URLSearchParams();
                  if (websiteId) qp.set('website_id', websiteId);
                  qp.set('step', 'deploy');
                  setStep('deploy');
                  router.push(`/dashboard/site-builder?${qp.toString()}`);
                }}
                className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90"
              >
                Continue
              </button>
            </div>
          )}
        </section>
      )}

      {step === 'deploy' && (
        <section className="rounded-xl border border-neutral-200 p-6 shadow-soft space-y-5 bg-white">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">Deploy Site</h2>
            <p className="text-sm text-neutral-600">This will create a deployment from the latest generated version. We’ll monitor status until the live URL is ready.</p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-medium text-neutral-800">Deployment Progress</div>
            <div className="mt-2 h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
              <div className="h-full bg-success-accent transition-all" style={{ width: `${simProgress}%` }} />
            </div>
            <div className="mt-2 text-xs text-neutral-600 flex items-center gap-2">
              {(simBusy && !simDone) && (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
              )}
              <span>{simStage}</span>
            </div>
          </div>

          {deployedUrl && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-medium text-emerald-900">Live Site</div>
              <div className="mt-1 text-sm text-emerald-800 break-all">{deployedUrl}</div>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={deployedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-100"
                >
                  View
                </a>
                <button
                  onClick={async () => { try { if (deployedUrl) await navigator.clipboard.writeText(deployedUrl); } catch {} }}
                  className="inline-flex items-center justify-center rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-100"
                >
                  Copy URL
                </button>
              </div>
            </div>
          )}
          <button
            onClick={async () => {
              if (simBusy) return;
              if (!userId) return;
              setSimBusy(true);
              setSimStage('Creating deployment…');
              setSimProgress(12);
              try {
                const r = await fetch('/api/sitebuild/deploy', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ user_id: userId, website_id: websiteId })
                });
                const j = await r.json().catch(() => ({} as any));
                if (!r.ok) throw new Error(j?.error || 'Failed to start deployment');
                const depId = j?.deploymentId as string | undefined;
                // If URL is already available, finalize without SSE
                if (j?.url) {
                  setDeployedUrl(j.url);
                  setSimStage(`Deployed: ${j.url}`);
                  setSimProgress(100);
                  setSimDone(true);
                  setSimBusy(false);
                  try {
                    const newSteps = { ...(stepsState || {}), deploy: 'done' as const };
                    setStepsState(newSteps);
                    void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                  } catch {}
                  setTimeout(() => { router.push('/dashboard'); }, 1200);
                  return;
                }
                if (!depId) throw new Error('Missing deploymentId');
                setSimStage('Deploying…');
                setSimProgress(30);
                const es = new EventSource(`/api/sitebuild/stream?deploymentId=${encodeURIComponent(depId)}`);
                let localProgress = 30;
                es.onmessage = (ev) => {
                  try {
                    const data = JSON.parse(ev.data || '{}');
                    if (data?.type === 'stage') {
                      setSimStage(data.label || 'Working…');
                      localProgress = Math.min(92, localProgress + 6);
                      setSimProgress(localProgress);
                    } else if (data?.type === 'deployed') {
                      setDeployedUrl(data.url || null);
                      setSimStage(`Deployed: ${data.url}`);
                      setSimProgress(100);
                      setSimDone(true);
                      setSimBusy(false);
                      // Persist step completion
                      try {
                        const newSteps = { ...(stepsState || {}), deploy: 'done' as const };
                        setStepsState(newSteps);
                        void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                      } catch {}
                      es.close();
                      // Auto-redirect to dashboard after short delay
                      setTimeout(() => {
                        router.push('/dashboard');
                      }, 1800);
                    } else if (data?.type === 'complete') {
                      // If complete emitted without deployed payload, still route to dashboard
                      setTimeout(() => { router.push('/dashboard'); }, 1000);
                    } else if (data?.type === 'timeout') {
                      setSimStage('Timed out waiting for deployment');
                      setSimBusy(false);
                      es.close();
                    } else if (data?.type === 'error') {
                      setSimStage(`Error: ${data.error}`);
                      setSimBusy(false);
                      es.close();
                    }
                  } catch {}
                };
                es.onerror = () => {
                  setSimStage('Connection error');
                  setSimBusy(false);
                  es.close();
                };
              } catch (e: any) {
                setSimStage(e?.message || 'Failed to deploy');
                setSimBusy(false);
              }
            }}
            className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
            disabled={simBusy || !userId}
          >
            {simBusy ? 'Working…' : 'Deploy Now'}
          </button>

          {deployedUrl && (
            <div className="mt-4 flex items-center gap-3">
              <a
                href={deployedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-neutral-200 px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
              >
                View Live Site
              </a>
              <button
                onClick={async () => { try { if (deployedUrl) await navigator.clipboard.writeText(deployedUrl); } catch {} }}
                className="inline-flex items-center justify-center rounded-md border border-neutral-200 px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
              >
                Copy URL
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
