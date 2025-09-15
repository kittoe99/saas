"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeprecatedSiteBuilderRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return null;
}
          const t = buildThemeFromOnboarding(data);
          if (t && t.trim()) setTheme(t);
        } catch {}
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
      } catch {}
    })();
  }, [websiteId, onboarding]);

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
        // Always try to restore attached IDs from website row
        if (wid) {
          try {
            const { data: wrow } = await supabase
              .from('websites' as any)
              .select('v0_chat_id, v0_project_id')
              .eq('id', wid)
              .eq('user_id', userId)
              .maybeSingle();
            if (wrow?.v0_chat_id) {
              setAttachedChatId(wrow.v0_chat_id as string);
              // Ensure v0_chats is upserted on load if missing
              try { void fetch(`/api/v0/chats/${encodeURIComponent(wrow.v0_chat_id as string)}`); } catch {}
            }
            // Also consult v0_projects in case website row is missing the project id
            let resolvedProjectId: string | undefined = wrow?.v0_project_id as string | undefined;
            if (!resolvedProjectId) {
              try {
                const { data: prow } = await supabase
                  .from('v0_projects')
                  .select('v0_project_id')
                  .eq('website_id', wid)
                  .eq('user_id', userId)
                  .order('created_at', { ascending: false } as any)
                  .limit(1)
                  .maybeSingle();
                if (prow?.v0_project_id) resolvedProjectId = prow.v0_project_id as string;
              } catch {}
            }
            if (resolvedProjectId) setAttachedProjectId(resolvedProjectId);
            // If a project exists (from website or v0_projects) but chat is missing, DO NOT auto-create a chat.
            // Instead, mark 'start' as done so we can proceed to next step without creating duplicate projects/chats.
            if (resolvedProjectId && !wrow?.v0_chat_id && !autoStartMarked) {
              try {
                const newSteps = { ...(stepsState || { hero: 'pending', services: 'pending', areas: 'pending', global: 'pending', deploy: 'pending' } as const), start: 'done' as const };
                setStepsState(newSteps as any);
                void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: wid, steps: newSteps }) });
              } catch {}
              setAutoStartMarked(true);
            }
          } catch {}
        }
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
          // If Start is done, skip Start unconditionally
          if ((steps as any).start === 'done' && (!st || st === 'start')) {
            const qp = new URLSearchParams();
            if (wid) qp.set('website_id', wid);
            qp.set('step', 'hero');
            setStep('hero');
            router.replace(`/dashboard/site-builder?${qp.toString()}`);
            return;
          }
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
          const order = ['start','hero','services','areas','global','deploy'] as const;
          const nextPending = order.find(k => (steps as any)[k] !== 'done' && (steps as any)[k] !== undefined);
          // Auto-route scenarios:
          // 1) If current provided and done → move to next pending
          // 2) If no current provided and 'start' is done → move to next pending
          // 3) If current is 'start' and done → move to next pending
          const shouldAutoAdvance = (
            (current && (steps as any)[current] === 'done') ||
            (!current && (steps as any)['start'] === 'done') ||
            (current === 'start' && (steps as any)['start'] === 'done')
          );
          if (shouldAutoAdvance && nextPending && nextPending !== 'start') {
            const qp = new URLSearchParams();
            if (wid) qp.set('website_id', wid);
            qp.set('step', nextPending);
            router.push(`/dashboard/site-builder?${qp.toString()}`);
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
          // Build a theme prompt from onboarding user preferences (colors, fonts, etc.)
          try {
            const t = buildThemeFromOnboarding(data);
            if (t && t.trim()) setTheme(t);
          } catch {}
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

  // Auto-resolve chat when entering actionable steps
  useEffect(() => {
    (async () => {
      try {
        if (!websiteId) return;
        if (!step || !['hero','services','areas','global','deploy'].includes(step)) return;
        if (attachedChatId) return;
        const cid = await resolveChatId();
        setAttachedChatId(cid);
      } catch (e: any) {
        // Surface a soft error only on hero step to guide the user
        if (step === 'hero') {
          const msg = e?.message === 'Missing chatId'
            ? 'Missing chatId — click Start to initialize, or press Resolve below.'
            : (e?.message || 'Failed to resolve chat');
          setHeroError(msg);
        }
      }
    })();
  }, [step, websiteId, userId]);

  // All build actions and chat continuation are intentionally disabled here

  function safeParseJSON(s: string) {
    try { return s ? JSON.parse(s) : undefined } catch { return undefined }
  }

  // Resolve a chatId to use for continuation, prioritizing project->chats resolution.
  async function resolveChatId(): Promise<string> {
    // 0) In-memory
    if (attachedChatId) return attachedChatId;

    // 1) Resolve projectId first (preferred path), no user filter to avoid mismatches
    try {
      let pid = attachedProjectId || undefined;
      if (!pid && websiteId) {
        // Try v0_projects by website_id
        const { data: prow } = await supabase
          .from('v0_projects')
          .select('v0_project_id')
          .eq('website_id', websiteId)
          .order('created_at', { ascending: false } as any)
          .limit(1)
          .maybeSingle();
        if (prow?.v0_project_id) pid = prow.v0_project_id as string;
      }
      if (!pid && websiteId) {
        // Fallback: websites.v0_project_id
        const { data: wrow } = await supabase
          .from('websites' as any)
          .select('v0_project_id')
          .eq('id', websiteId)
          .maybeSingle();
        if ((wrow as any)?.v0_project_id) pid = (wrow as any).v0_project_id as string;
      }
      if (pid) {
        setAttachedProjectId(pid);
        // 2) Find latest chat by v0_project_id (authoritative)
        const { data: cdata, error: cerr } = await supabase
          .from('v0_chats' as any)
          .select('v0_chat_id, created_at')
          .eq('v0_project_id', pid)
          .order('created_at', { ascending: false } as any)
          .limit(1);
        if (!cerr) {
          const found = (cdata || [])[0]?.v0_chat_id as string | undefined;
          if (found) { setAttachedChatId(found); return found; }
        }
      }
    } catch {}

    // 3) Directly from websites row chat
    try {
      if (websiteId) {
        const { data: wrow } = await supabase
          .from('websites' as any)
          .select('v0_chat_id')
          .eq('id', websiteId)
          .maybeSingle();
        const fromWeb = (wrow as any)?.v0_chat_id as string | undefined;
        if (fromWeb) { setAttachedChatId(fromWeb); return fromWeb; }
      }
    } catch {}

    // 4) Latest chat by website_id (fallback)
    try {
      if (websiteId) {
        const { data, error } = await supabase
          .from('v0_chats' as any)
          .select('v0_chat_id, created_at')
          .eq('website_id', websiteId)
          .order('created_at', { ascending: false } as any)
          .limit(1);
        if (!error) {
          const found = (data || [])[0]?.v0_chat_id as string | undefined;
          if (found) { setAttachedChatId(found); return found; }
        }
      }
    } catch {}

    throw new Error('Missing chatId');
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

    const servicesArr: string[] = Array.isArray((data as any)?.selectedServices)
      ? (data as any).selectedServices.filter((s: any) => typeof s === 'string' && s.trim())
      : [];
    const primaryService = (servicesArr[0] as string | undefined)
      || siteType
      || category
      || resolved
      || 'service';
    const preface = `Build a website for a ${primaryService} using the details below. Follow the System Prompt (theme) strictly.`;
    const bullets: string[] = [];
    bullets.push(`Brand: ${brandName}${tagline ? ` — ${tagline}` : ''}`);
    bullets.push(`Type/Category: ${[siteType, category].filter(Boolean).join(' / ') || '—'}`);
    bullets.push(`Audience: ${audience || '—'}`);
    bullets.push(`Tone: ${tone}`);
    bullets.push(`Pages (create routes and files): ${pages || 'home, Services, Contact, About'}`);
    bullets.push(`Key Sections (fill with sensible placeholders if content is missing):`);
    bullets.push(`- Hero: value prop + supporting line + primary CTA.`);
    bullets.push(`- Services/Offering: ${services || 'core offerings'} with short descriptions.`);
    bullets.push(`- Social proof: testimonials or placeholder quotes.`);
    bullets.push(`- FAQ: 6–8 Q/A pairs.`);
    bullets.push(`- Contact: ${contactMethod || 'form'} with solid-fields spec.`);
    bullets.push(`Theme & UX (must follow the System Prompt):`);
    const themeColors = Array.isArray((onboarding as any)?.primaryColors)
      ? (onboarding as any).primaryColors.filter((c: any) => typeof c === 'string' && c.trim()).slice(0, 3)
      : Array.isArray((onboarding as any)?.brand?.colors)
        ? (onboarding as any).brand.colors.filter((c: any) => typeof c === 'string' && c.trim()).slice(0, 3)
        : [];
    if (themeColors.length) bullets.push(`- Use these colors as primary palette: ${themeColors.join(', ')}.`);
    bullets.push(`- Components: respect radii and contrast from the System Prompt; use elevation sparingly; minimal borders.`);
    bullets.push(`- Typography: Geist or the specified family; headings 600; body 16px/1.6; labels 500 with 0.02em.`);
    bullets.push(`Content & Data:`);
    bullets.push(`- Services: ${services || '—'}`);
    bullets.push(`- Contact: method ${contactMethod || 'form'}; email ${email || '—'}; phone ${phone || '—'}`);
    bullets.push(`- Social: ${socials.join(' | ') || '—'}`);
    bullets.push(`- Areas served: ${areas || '—'}`);
    bullets.push(`- Domain preference: ${preferredDomain || '—'}`);
    bullets.push(`- Competitors (for positioning; do not copy): ${competitors || '—'}`);
    bullets.push(`Requirements:`);
    bullets.push(`- Accessibility: WCAG AA; visible focus states; adequate contrast.`);
    bullets.push(`- Responsive layout for mobile/tablet/desktop.`);
    bullets.push(`- SEO: meta title/description; OpenGraph defaults.`);
    bullets.push(`- If inputs are missing, scaffold placeholders and TODO comments.`);
    bullets.push(`Deliverables:`);
    bullets.push(`- Working version preview that reflects the above, using the System Prompt theme exactly.`);

    return `${preface}\n\n${bullets.join('\n')}`;
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

      {/* Preview Prompts (temporary) */}
      <section className="rounded-xl border border-amber-200 p-4 shadow-soft space-y-3 bg-amber-50">
        <div className="text-sm font-medium text-amber-900">Preview Prompts (temporary)</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-amber-900">System Prompt (theme)</div>
            <pre className="mt-1 whitespace-pre-wrap text-xs leading-relaxed rounded-lg border border-amber-200 bg-white p-3 text-neutral-900 min-h-28">
{buildProjectInstructions(onboarding, industry, theme) || 'Loading theme…'}
            </pre>
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-900">Chat Prompt (initial)</div>
            <pre className="mt-1 whitespace-pre-wrap text-xs leading-relaxed rounded-lg border border-amber-200 bg-white p-3 text-neutral-900 min-h-28">
{buildInitialMessage(onboarding, industry) || 'Loading prompt…'}
            </pre>
          </div>
        </div>
        <div className="text-[11px] text-amber-800">These are sent to v0 on Start. We will remove this block after testing.</div>
      </section>

      {/* Connection status & quick actions */}
      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft bg-white">
        <div className="text-sm font-medium text-neutral-800">Connection</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-3 text-xs text-neutral-700">
          <div>Website ID: <span className="font-mono break-all">{websiteId || '—'}</span></div>
          <div>Project ID: <span className="font-mono break-all">{attachedProjectId || '—'}</span></div>
          <div>Chat ID: <span className="font-mono break-all">{attachedChatId || '—'}</span></div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                setSimStage('Resolving chat…');
                const cid = await resolveChatId();
                setAttachedChatId(cid);
                setSimStage('Chat resolved');
              } catch (e: any) {
                const msg = e?.message === 'Missing chatId' ? 'No existing chat found. Click Start to create one.' : (e?.message || 'Failed to resolve chat');
                setSimStage(msg);
              }
            }}
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-900 px-3 py-1.5 text-xs hover:bg-neutral-50"
          >
            Resolve Chat
          </button>
          <button
            onClick={loadDebugInfo}
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-900 px-3 py-1.5 text-xs hover:bg-neutral-50"
            disabled={debugLoading}
          >
            {debugLoading ? 'Loading…' : 'Refresh Debug Info'}
          </button>
        </div>
      </section>

      {/* Debug: Current Context */}
      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft bg-white">
        <div className="text-sm font-medium text-neutral-800">Debug: Current Context</div>
        <div className="mt-2 grid gap-3 sm:grid-cols-3 text-xs text-neutral-700">
          <div>
            <div className="text-[11px] text-neutral-500">Website</div>
            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded border bg-neutral-50 p-2">{websiteId || '—'}</pre>
          </div>
          <div>
            <div className="text-[11px] text-neutral-500">Project</div>
            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded border bg-neutral-50 p-2">{attachedProjectId || '—'}</pre>
          </div>
          <div>
            <div className="text-[11px] text-neutral-500">Chat</div>
            <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded border bg-neutral-50 p-2">{attachedChatId || '—'}</pre>
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
          <div>
            <div className="text-[11px] text-neutral-500">v0 Chat (internal API)</div>
            <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded border bg-neutral-50 p-2">{chatDebug ? JSON.stringify(chatDebug, null, 2) : '—'}</pre>
          </div>
          <div>
            <div className="text-[11px] text-neutral-500">DB Rows</div>
            <details className="rounded border bg-neutral-50 p-2">
              <summary className="cursor-pointer text-[11px] text-neutral-600">v0_chats row</summary>
              <pre className="mt-1 max-h-56 overflow-auto whitespace-pre-wrap rounded border bg-white p-2">{chatRowDebug ? JSON.stringify(chatRowDebug, null, 2) : '—'}</pre>
            </details>
            <details className="mt-2 rounded border bg-neutral-50 p-2">
              <summary className="cursor-pointer text-[11px] text-neutral-600">v0_projects row</summary>
              <pre className="mt-1 max-h-56 overflow-auto whitespace-pre-wrap rounded border bg-white p-2">{projectRowDebug ? JSON.stringify(projectRowDebug, null, 2) : '—'}</pre>
            </details>
          </div>
        </div>
      </section>

      {/* Collapsed summaries of completed stages (in order) */}
      {stepsState && (
        <div className="space-y-2">
          {stepsState.start === 'done' && <CollapsedCard title="Start" note="Project + chat created" />}
          {stepsState.hero === 'done' && <CollapsedCard title="Initial layout" note="Base structure prepared" />}
          {stepsState.services === 'done' && <CollapsedCard title="Content updates" note="Key sections adjusted" />}
          {stepsState.areas === 'done' && <CollapsedCard title="Location setup" note="Coverage details added" />}
          {stepsState.global === 'done' && <CollapsedCard title="Design polish" note="Consistent nav & footer" />}
        </div>
      )}

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
                if (simBusy || startSubmitting) return;
                if (!websiteId) { setSimStage('Missing website'); return; }
                setStartSubmitting(true);
                setSimBusy(true);
                setStartError(null);
                setSimStage('Initializing…');
                setSimProgress(8);
                try {
                  // If Start is already done, skip immediately to hero
                  if (stepsState && (stepsState as any).start === 'done') {
                    const qp = new URLSearchParams();
                    qp.set('website_id', websiteId);
                    qp.set('step', 'hero');
                    setStep('hero');
                    router.replace(`/dashboard/site-builder?${qp.toString()}`);
                    return;
                  }
                  // First, try to reuse existing website-linked project/chat
                  let projectId: string | undefined = undefined;
                  let chatId: string | undefined = undefined;
                  try {
                    if (userId && websiteId) {
                      const { data: w } = await supabase
                        .from('websites' as any)
                        .select('v0_project_id, v0_chat_id')
                        .eq('id', websiteId)
                        .eq('user_id', userId)
                        .maybeSingle();
                      projectId = (w as any)?.v0_project_id || undefined;
                      chatId = (w as any)?.v0_chat_id || undefined;
                    }
                  } catch {}

                  // Additionally, consult v0_projects WITHOUT user filter to avoid mismatch causing duplicate creates
                  if (!projectId) {
                    try {
                      const { data: prow } = await supabase
                        .from('v0_projects')
                        .select('v0_project_id')
                        .eq('website_id', websiteId)
                        .order('created_at', { ascending: false } as any)
                        .limit(1)
                        .maybeSingle();
                      if (prow?.v0_project_id) projectId = prow.v0_project_id as string;
                    } catch {}
                  }

                  // If chat not found on website row, try v0_chats by website_id (latest)
                  if (!chatId) {
                    try {
                      const { data: crow } = await supabase
                        .from('v0_chats')
                        .select('v0_chat_id')
                        .eq('website_id', websiteId)
                        .order('created_at', { ascending: false } as any)
                        .limit(1)
                        .maybeSingle();
                      if ((crow as any)?.v0_chat_id) chatId = (crow as any).v0_chat_id as string;
                    } catch {}
                  }

                  if (chatId) {
                    // Reattach to existing chat and poll
                    setAttachedProjectId(projectId || null);
                    setAttachedChatId(chatId);
                    setSimStage('Reattaching to existing build…');
                    setSimProgress(22);
                    // Mark 'start' as done if not yet persisted
                    try {
                      const newSteps = { ...(stepsState || { hero: 'pending', services: 'pending', areas: 'pending', global: 'pending', deploy: 'pending' } as const), start: 'done' as const };
                      setStepsState(newSteps as any);
                      void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                    } catch {}
                    // Ensure v0_chats row exists/upserts by refreshing chat via API
                    try { void fetch(`/api/v0/chats/${encodeURIComponent(chatId)}`); } catch {}
                  } else {
                    // Ensure we have a project; create only if missing after double-check
                    if (!projectId) {
                      const projName = (() => {
                        const name = (onboarding?.name || onboarding?.brand?.name || 'New Site') as string;
                        return String(name).trim().slice(0,60) || 'New Site';
                      })();
                      const projDesc = (onboarding?.tagline || onboarding?.description || '') as string;
                      const projInstructions = buildProjectInstructions(onboarding, industry, theme);
                      const pRes = await fetch('/api/v0/projects', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: projName, description: projDesc || undefined, instructions: projInstructions, user_id: userId || undefined, website_id: websiteId || undefined })
                      });
                      const pJson = await pRes.json().catch(() => ({} as any));
                      if (!pRes.ok) throw new Error(pJson?.error || 'Failed to create project');
                      projectId = pJson?.id as string | undefined;
                      if (!projectId) throw new Error('Missing projectId');
                    }
                    setAttachedProjectId(projectId || null);
                    // Only create chat if we don't already have one linked on website (avoid duplicates)
                    if (!chatId) {
                      const initialMessage = buildInitialMessage(onboarding, industry);
                      const cRes = await fetch('/api/v0/chats', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: initialMessage, v0_project_id: projectId, user_id: userId || undefined, website_id: websiteId || undefined })
                      });
                      const cJson = await cRes.json().catch(() => ({} as any));
                      if (!cRes.ok) throw new Error(cJson?.error || 'Failed to create chat');
                      chatId = cJson?.id as string | undefined;
                      if (!chatId) throw new Error('Missing chatId');
                      setAttachedChatId(chatId);
                    }
                    // Persist 'start' completion now that chat is established
                    try {
                      const newSteps = { ...(stepsState || { hero: 'pending', services: 'pending', areas: 'pending', global: 'pending', deploy: 'pending' } as const), start: 'done' as const };
                      setStepsState(newSteps as any);
                      void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                    } catch {}
                  }
                  setSimStage('Waiting for preview…');
                  setSimProgress(25);
                  setStartCanContinue(true);
                  // Initialize steps in DB if not present
                  try {
                    if (!stepsState) {
                      const initSteps = { start: 'done', hero: 'pending', services: 'pending', areas: 'pending', global: 'pending', deploy: 'pending' } as const;
                      setStepsState(initSteps as any);
                      void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: initSteps }) });
                    }
                  } catch {}
                  // Poll chat preview via internal API
                  let localProgress = 25;
                  let attempts = 12;
                  for (let i = 0; i < attempts; i++) {
                    try {
                      const r = await fetch(`/api/v0/chats/${encodeURIComponent(chatId)}`);
                      const j = await r.json().catch(() => ({} as any));
                      if (r.ok) {
                        if (j?.demo) {
                          setSimStage('Build complete');
                          setSimProgress(100);
                          setSimDone(true);
                          setSimBusy(false);
                          // Auto-advance to hero step
                          try {
                            const qp = new URLSearchParams();
                            if (websiteId) qp.set('website_id', websiteId);
                            qp.set('step', 'hero');
                            setStep('hero');
                            router.push(`/dashboard/site-builder?${qp.toString()}`);
                          } catch {}
                          break;
                        }
                        setSimStage('Working…');
                        localProgress = Math.min(92, localProgress + 6);
                        setSimProgress(localProgress);
                      }
                    } catch {}
                    await new Promise(res => setTimeout(res, 2500));
                  }
                  // If not completed within attempts, stop busy to avoid being stuck
                  if (!simDone) {
                    setSimStage('Timed out waiting for preview');
                    setSimBusy(false);
                  }
                } catch (e: any) {
                  const msg = e?.message || 'Failed to start';
                  setSimStage(msg);
                  setStartError(msg);
                  setSimBusy(false);
                } finally {
                  setStartSubmitting(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
              disabled={simBusy || !websiteId}
            >
              {simBusy ? 'Working…' : 'Start'}
            </button>
            {startCanContinue && !simDone && (
              <button
                onClick={() => {
                  try {
                    const qp = new URLSearchParams();
                    if (websiteId) qp.set('website_id', websiteId);
                    qp.set('step', 'hero');
                    setStep('hero');
                    setSimBusy(false);
                    router.push(`/dashboard/site-builder?${qp.toString()}`);
                  } catch {}
                }}
                className="ml-2 inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Continue to Hero
              </button>
            )}
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
                  const chatToUse = await resolveChatId().catch((e) => { throw e; });
                  const r = await fetch('/api/v0/chats/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chatId: chatToUse || undefined,
                      user_id: userId || undefined,
                      website_id: websiteId || undefined,
                      message: `Design our hero like this: \n\n${code}`,
                    })
                  });
                  const j = await r.json().catch(() => ({} as any));
                  if (!r.ok || j?.error) throw new Error(j?.error || 'Failed to send hero');
                  setHeroSent(true);
                  setSimStage('Waiting for hero preview…');
                  setSimProgress(30);
                  let lp = 30;
                  for (let i = 0; i < 12; i++) {
                    try {
                      const rr = await fetch(`/api/v0/chats/${encodeURIComponent(chatToUse)}`);
                      const jj = await rr.json().catch(() => ({} as any));
                      if (rr.ok && jj?.demo) {
                        setSimStage('Hero added');
                        setSimProgress(100);
                        setSimDone(true);
                        setSimBusy(false);
                        try {
                          const newSteps = { ...(stepsState || {}), hero: 'done' as const };
                          setStepsState(newSteps);
                          void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                        } catch {}
                        break;
                      }
                      setSimStage('Working…');
                      lp = Math.min(96, lp + 5);
                      setSimProgress(lp);
                    } catch {}
                    await new Promise(res => setTimeout(res, 2500));
                  }
                } catch (e: any) {
                  const msg = e?.message === 'Missing chatId'
                    ? 'Missing chatId — please click Start first to create/attach a chat.'
                    : (e?.message || 'Failed to start hero step');
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
                  const chatToUse = await resolveChatId().catch((e) => { throw e; });
                  const r = await fetch('/api/v0/chats/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chatId: chatToUse || undefined,
                      user_id: userId || undefined,
                      website_id: websiteId || undefined,
                      message: `Design our services section like this: \n\n${code}`,
                    })
                  });
                  const j = await r.json().catch(() => ({} as any));
                  if (!r.ok || j?.error) throw new Error(j?.error || 'Failed to send services');
                  setServicesSent(true);
                  setSimStage('Waiting for services preview…');
                  setSimProgress(30);
                  let lp2 = 30;
                  for (let i = 0; i < 12; i++) {
                    try {
                      const rr = await fetch(`/api/v0/chats/${encodeURIComponent(chatToUse)}`);
                      const jj = await rr.json().catch(() => ({} as any));
                      if (rr.ok && jj?.demo) {
                        setSimStage('Services added');
                        setSimProgress(100);
                        setSimDone(true);
                        setSimBusy(false);
                        try {
                          const newSteps = { ...(stepsState || {}), services: 'done' as const };
                          setStepsState(newSteps);
                          void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                        } catch {}
                        break;
                      }
                      setSimStage('Working…');
                      lp2 = Math.min(96, lp2 + 5);
                      setSimProgress(lp2);
                    } catch {}
                    await new Promise(res => setTimeout(res, 2500));
                  }
                } catch (e: any) {
                  const msg = e?.message === 'Missing chatId'
                    ? 'Missing chatId — please click Start first to create/attach a chat.'
                    : (e?.message || 'Failed to start services step');
                  setSimStage(msg);
                  setServicesError(msg);
                  setSimBusy(false);
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-success-accent text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
              disabled={simBusy || !userId}
            >
              {simBusy ? 'Working…' : 'Continue'}
            </button>
            {servicesError && (
              <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {servicesError}
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
                  const chatToUse = await resolveChatId().catch((e) => { throw e; });
                  const r = await fetch('/api/v0/chats/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chatId: chatToUse || undefined,
                      user_id: userId || undefined,
                      website_id: websiteId || undefined,
                      message: `Design our service areas section like this: \n\n${code}`,
                    })
                  });
                  const j = await r.json().catch(() => ({} as any));
                  if (!r.ok || j?.error) throw new Error(j?.error || 'Failed to send service areas');
                  setAreasSent(true);
                  setSimStage('Waiting for service areas preview…');
                  setSimProgress(30);
                  let lp3 = 30;
                  for (let i = 0; i < 12; i++) {
                    try {
                      const rr = await fetch(`/api/v0/chats/${encodeURIComponent(chatToUse)}`);
                      const jj = await rr.json().catch(() => ({} as any));
                      if (rr.ok && jj?.demo) {
                        setSimStage('Service areas added');
                        setSimProgress(100);
                        setSimDone(true);
                        setSimBusy(false);
                        try {
                          const newSteps = { ...(stepsState || {}), areas: 'done' as const };
                          setStepsState(newSteps);
                          void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                        } catch {}
                        break;
                      }
                      setSimStage('Working…');
                      lp3 = Math.min(96, lp3 + 5);
                      setSimProgress(lp3);
                    } catch {}
                    await new Promise(res => setTimeout(res, 2500));
                  }
                } catch (e: any) {
                  const msg = e?.message === 'Missing chatId'
                    ? 'Missing chatId — please click Start first to create/attach a chat.'
                    : (e?.message || 'Failed to start service areas step');
                  setSimStage(msg);
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
                  const chatToUse = await resolveChatId().catch((e) => { throw e; });
                  const r = await fetch('/api/v0/chats/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chatId: chatToUse || undefined,
                      user_id: userId || undefined,
                      website_id: websiteId || undefined,
                      message,
                    })
                  });
                  const j = await r.json().catch(() => ({} as any));
                  if (!r.ok || j?.error) throw new Error(j?.error || 'Failed to send global update');
                  setGlobalSent(true);
                  setSimStage('Waiting for global update preview…');
                  setSimProgress(28);
                  let lp4 = 28;
                  for (let i = 0; i < 12; i++) {
                    try {
                      const rr = await fetch(`/api/v0/chats/${encodeURIComponent(chatToUse)}`);
                      const jj = await rr.json().catch(() => ({} as any));
                      if (rr.ok && jj?.demo) {
                        setSimStage('Global elements applied');
                        setSimProgress(100);
                        setSimDone(true);
                        setSimBusy(false);
                        try {
                          const newSteps = { ...(stepsState || {}), global: 'done' as const };
                          setStepsState(newSteps);
                          void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                        } catch {}
                        break;
                      }
                      setSimStage('Working…');
                      lp4 = Math.min(96, lp4 + 5);
                      setSimProgress(lp4);
                    } catch {}
                    await new Promise(res => setTimeout(res, 2500));
                  }
                } catch (e: any) {
                  const msg = e?.message === 'Missing chatId'
                    ? 'Missing chatId — please click Start first to create/attach a chat.'
                    : (e?.message || 'Failed to start global step');
                  setSimStage(msg);
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
                // Resolve latest version via chat and deploy using v0 API route
                const projectId = attachedProjectId || '';
                let vid: string | null = null;
                if (attachedChatId) {
                  try {
                    const rr = await fetch(`/api/v0/chats/${encodeURIComponent(attachedChatId)}`);
                    const jj = await rr.json().catch(() => ({} as any));
                    if (rr.ok) vid = jj?.latestVersionId || null;
                  } catch {}
                }
                const payload: any = { projectId: projectId || undefined, user_id: userId || undefined, website_id: websiteId || undefined };
                if (vid) payload.versionId = vid; else if (attachedChatId) payload.chatId = attachedChatId;
                const r = await fetch('/api/v0/deployments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const j = await r.json().catch(() => ({} as any));
                if (!r.ok) throw new Error(j?.error || 'Failed to create deployment');
                const depId = j?.id as string | undefined;
                setSimStage('Deploying…');
                setSimProgress(40);
                // Poll deployment record until URL appears
                if (depId) {
                  for (let i = 0; i < 12; i++) {
                    try {
                      await fetch(`/api/v0/deployments/${encodeURIComponent(depId)}`); // refresh/upsert
                      // We don't have a direct getter here; optionally reload deployments list or check dashboard later
                    } catch {}
                    await new Promise(res => setTimeout(res, 5000));
                  }
                }
                // Finalize (best-effort)
                setSimStage('Deployment requested');
                setSimProgress(100);
                setSimDone(true);
                setSimBusy(false);
                try {
                  const newSteps = { ...(stepsState || {}), deploy: 'done' as const };
                  setStepsState(newSteps);
                  void fetch('/api/sitebuild/steps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, website_id: websiteId, steps: newSteps }) });
                } catch {}
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
