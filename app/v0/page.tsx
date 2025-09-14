"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ApiResult<T = any> = {
  ok?: boolean;
  error?: string;
} & T;

export default function V0Page() {
  const [userId, setUserId] = useState<string | null>(null);
  const [websiteId, setWebsiteId] = useState<string>("");

  // Create Project state
  const [projName, setProjName] = useState("my-v0-project");
  const [projDesc, setProjDesc] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Chat state
  const [message, setMessage] = useState("Create a responsive navbar with Tailwind CSS");
  const [chatProjectId, setChatProjectId] = useState<string>("");
  const [chatId, setChatId] = useState<string>("");
  const [chatDemo, setChatDemo] = useState<string>("");
  const [chatFiles, setChatFiles] = useState<any[] | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [continueMsg, setContinueMsg] = useState<string>("Refine the header styles and add a CTA button");
  const [continuing, setContinuing] = useState(false);

  // Deployment state
  const [deployProjectId, setDeployProjectId] = useState<string>("");
  const [deploymentId, setDeploymentId] = useState<string>("");
  const [deploymentStatus, setDeploymentStatus] = useState<string>("");
  const [deploymentUrl, setDeploymentUrl] = useState<string>("");
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [versionId, setVersionId] = useState<string>("");

  // Resolver + one-click deploy latest
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [resolvedChatId, setResolvedChatId] = useState<string>("");
  const [resolvedVersionId, setResolvedVersionId] = useState<string>("");

  // Deployments state
  const [loadingDeployments, setLoadingDeployments] = useState(false);
  const [deployments, setDeployments] = useState<any[]>([]);

  // Listing state (projects & chats)
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loadingChats, setLoadingChats] = useState(false);
  const [projectChats, setProjectChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // convenience
  useEffect(() => {
    // keep the projectId inputs in sync unless user overrides
    if (projectId && !chatProjectId) setChatProjectId(projectId);
    if (projectId && !deployProjectId) setDeployProjectId(projectId);
  }, [projectId]);

  async function postJSON<T>(url: string, body: any): Promise<ApiResult<T>> {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as any;
    if (!res.ok) {
      return { error: json?.error || `Request failed: ${res.status}` } as any;
    }
    return json as ApiResult<T>;
  }

  async function resolveChatId(): Promise<string> {
    // Priority: selectedChatId -> chatId -> websiteId lookup -> recent chats
    if (selectedChatId) return selectedChatId;
    if (chatId) return chatId;
    if (websiteId) {
      const { data, error } = await supabase
        .from('v0_chats')
        .select('v0_chat_id, created_at')
        .eq('website_id', websiteId)
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      const found = (data || [])[0]?.v0_chat_id as string | undefined;
      if (found) return found;
    }
    // Fallback: pick the most recent chat for the user
    const { data, error } = await supabase
      .from('v0_chats')
      .select('v0_chat_id, created_at')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    const found = (data || [])[0]?.v0_chat_id as string | undefined;
    if (!found) throw new Error('No chats available to resolve');
    return found;
  }

  async function handleResolveAndDeployLatest() {
    setResolving(true);
    setResolveError(null);
    setResolvedChatId("");
    setResolvedVersionId("");
    try {
      // 1) Resolve chatId
      const cid = await resolveChatId();
      setResolvedChatId(cid);
      // 2) Fetch latest version via internal API (exposes latestVersionId)
      const res = await fetch(`/api/v0/chats/${encodeURIComponent(cid)}`);
      const j = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(j?.error || 'Failed to fetch chat');
      const latestVid: string | undefined = j?.latestVersionId || undefined;
      if (!latestVid) throw new Error('No latest version available yet');
      setResolvedVersionId(latestVid);
      // 3) Deploy latest version via internal deployments API
      const payload: any = {
        projectId: deployProjectId || selectedProjectId || undefined,
        versionId: latestVid,
        user_id: userId || undefined,
        website_id: websiteId || undefined,
      };
      if (!payload.projectId) {
        // If projectId isn't selected, deployments API can still work with versionId alone
        delete payload.projectId;
      }
      const dep = await postJSON<{ id: string; deployment: any }>("/api/v0/deployments", payload);
      if ((dep as any).error) throw new Error((dep as any).error);
      const depId = (dep as any).id as string;
      setDeploymentId(depId);
      setDeploymentStatus((dep as any).deployment?.status || "");
      setDeploymentUrl((dep as any).deployment?.url || "");
      if (!(dep as any).deployment?.url) {
        // optionally poll for URL using existing helper
        pollDeploymentUrl(depId, { attempts: 12, delayMs: 5000 });
      }
    } catch (e: any) {
      setResolveError(e?.message || 'Failed to resolve and deploy latest');
    } finally {
      setResolving(false);
    }
  }

  async function pollChatPreview(targetChatId: string, { attempts = 10, delayMs = 3000 } = {}) {
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await fetch(`/api/v0/chats/${encodeURIComponent(targetChatId)}`);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.demo) {
          setChatDemo(data.demo);
          setChatFiles(data.files || null);
          if (selectedProjectId) await loadProjectChats(selectedProjectId);
          return true;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  }

  async function refreshChat() {
    if (!chatId) return;
    try {
      const res = await fetch(`/api/v0/chats/${encodeURIComponent(chatId)}`, { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setChatDemo(data?.demo || "");
        setChatFiles(data?.files || null);
        if (selectedProjectId) {
          await loadProjectChats(selectedProjectId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function refreshDeployment(depId: string) {
    if (!depId) return;
    try {
      // Hit our refresh endpoint which also upserts status/url in DB
      await fetch(`/api/v0/deployments/${encodeURIComponent(depId)}`, { method: 'GET' });
      // Then reload list to get latest url/status
      await loadMyDeployments();
    } catch (e) {
      console.error(e);
    }
  }

  async function pollDeploymentUrl(depId: string, { attempts = 12, delayMs = 5000 } = {}) {
    for (let i = 0; i < attempts; i++) {
      try {
        await fetch(`/api/v0/deployments/${encodeURIComponent(depId)}`);
        await loadMyDeployments();
        const found = deployments.find((d) => d.v0_deployment_id === depId);
        if (found?.url) return true;
      } catch {}
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  }

  async function handleContinueChat() {
    setContinuing(true);
    setChatError(null);
    try {
      if (!chatId) throw new Error('No chat selected');
      const result = await postJSON<{ id: string; demo?: string; files?: any[] }>(
        "/api/v0/chats/send",
        {
          chatId,
          message: continueMsg,
          user_id: userId || undefined,
          website_id: websiteId || undefined,
        }
      );
      if ((result as any).error) throw new Error((result as any).error);
      setChatDemo((result as any).demo || "");
      setChatFiles((result as any).files || null);
    } catch (e: any) {
      setChatError(e?.message || 'Failed to continue chat');
    } finally {
      setContinuing(false);
    }
  }

  async function loadRecentChats() {
    if (!userId) return;
    setLoadingRecent(true);
    try {
      const { data, error } = await supabase
        .from('v0_chats')
        .select('id, v0_chat_id, v0_project_id, created_at, demo_url')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      setRecentChats(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecent(false);
    }
  }

  async function loadMyProjects() {
    if (!userId) return;
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from('v0_projects')
        .select('id, v0_project_id, name, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProjects(false);
    }
  }

  async function loadProjectChats(pid: string) {
    if (!userId || !pid) return;
    setLoadingChats(true);
    try {
      const { data, error } = await supabase
        .from('v0_chats')
        .select('id, v0_chat_id, v0_project_id, created_at, demo_url')
        .eq('v0_project_id', pid)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProjectChats(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChats(false);
    }
  }

  async function handleCreateProject() {
    setCreatingProject(true);
    setProjectError(null);
    try {
      const result = await postJSON<{ id: string }>("/api/v0/projects", {
        name: projName,
        description: projDesc || undefined,
        user_id: userId || undefined,
        website_id: websiteId || undefined,
      });
      if ((result as any).error) throw new Error((result as any).error);
      setProjectId((result as any).id);
    } catch (e: any) {
      setProjectError(e?.message || "Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  }

  async function handleCreateChat() {
    setCreatingChat(true);
    setChatError(null);
    try {
      const result = await postJSON<{ id: string; demo?: string; files?: any[] }>(
        "/api/v0/chats",
        {
          message,
          v0_project_id: chatProjectId || undefined,
          user_id: userId || undefined,
          website_id: websiteId || undefined,
        }
      );
      if ((result as any).error) throw new Error((result as any).error);
      const newChatId = (result as any).id as string;
      setChatId(newChatId);
      setChatDemo((result as any).demo || "");
      setChatFiles((result as any).files || null);
      // Auto-poll for demo if not immediately available
      if (!(result as any).demo) {
        pollChatPreview(newChatId, { attempts: 10, delayMs: 3000 });
      }
    } catch (e: any) {
      setChatError(e?.message || "Failed to create chat");
    } finally {
      setCreatingChat(false);
    }
  }

  async function handleCreateChatForSelectedProject() {
    if (!selectedProjectId) return;
    setCreatingChat(true);
    setChatError(null);
    try {
      const result = await postJSON<{ id: string; demo?: string; files?: any[] }>(
        "/api/v0/chats",
        {
          message,
          v0_project_id: selectedProjectId,
          user_id: userId || undefined,
          website_id: websiteId || undefined,
        }
      );
      if ((result as any).error) throw new Error((result as any).error);
      const newChatId = (result as any).id as string;
      setChatId(newChatId);
      setChatDemo((result as any).demo || "");
      setChatFiles((result as any).files || null);
      await loadProjectChats(selectedProjectId);
      if (!(result as any).demo) {
        pollChatPreview(newChatId, { attempts: 10, delayMs: 3000 });
      }
    } catch (e: any) {
      setChatError(e?.message || "Failed to create chat");
    } finally {
      setCreatingChat(false);
    }
  }

  async function handleDeploy() {
    setDeploying(true);
    setDeployError(null);
    try {
      let project = deployProjectId || selectedProjectId || "";
      let vid = (versionId || "").trim();
      let cid = (!vid ? (selectedChatId || chatId || "") : "").trim();
      if (!project) throw new Error('Missing projectId');

      // Auto-resolve chatId by project if neither versionId nor chatId provided
      if (!vid && !cid) {
        const { data, error } = await supabase
          .from('v0_chats')
          .select('v0_chat_id, created_at')
          .eq('v0_project_id', project)
          .order('created_at', { ascending: false })
          .limit(1);
        if (!error && data && data.length > 0) {
          cid = (data[0] as any).v0_chat_id as string;
        }
      }
      // Resolve latest version from chat if still no versionId
      if (!vid && cid) {
        const res = await fetch(`/api/v0/chats/${encodeURIComponent(cid)}`);
        const j = await res.json().catch(() => ({} as any));
        if (res.ok) {
          vid = j?.latestVersionId || vid;
        }
      }
      // Prepare payload (prefer versionId; fallback to chatId if API supports resolving)
      const payload: any = {
        projectId: project,
        user_id: userId || undefined,
        website_id: websiteId || undefined,
      };
      if (vid) payload.versionId = vid;
      else if (cid) payload.chatId = cid;
      else throw new Error('Missing chatId or versionId (no chat found for this project)');

      const result = await postJSON<{ id: string; deployment: any }>("/api/v0/deployments", payload);
      if ((result as any).error) throw new Error((result as any).error);
      const depId = (result as any).id as string;
      setDeploymentId(depId);
      setDeploymentStatus((result as any).deployment?.status || "");
      setDeploymentUrl((result as any).deployment?.url || "");
      // Auto-poll for deployment URL if missing
      if (!(result as any).deployment?.url) {
        pollDeploymentUrl(depId, { attempts: 12, delayMs: 5000 });
      }
    } catch (e: any) {
      setDeployError(e?.message || "Failed to create deployment");
    } finally {
      setDeploying(false);
    }
  }

  async function loadMyDeployments() {
    if (!userId) return;
    setLoadingDeployments(true);
    try {
      const { data, error } = await supabase
        .from('v0_deployments')
        .select('id, v0_deployment_id, v0_project_id, status, url, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setDeployments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDeployments(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <h1 className="text-2xl font-semibold">v0 Platform Tester</h1>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-3">
        <div className="text-sm font-medium text-neutral-800">Context</div>
        <div className="text-xs text-neutral-600">Signed in user_id: {userId || "(not signed in)"}</div>
        {!userId && (
          <div className="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            You must be signed in for project/chat/deployment records to be saved to your account.
            <a href="/login?next=/v0" className="ml-2 underline">Sign in</a>
          </div>
        )}
        <label className="block text-sm">
          Website ID (optional)
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            placeholder="website uuid"
            value={websiteId}
            onChange={(e) => setWebsiteId(e.target.value)}
          />
        </label>
      </section>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-3">
        <div className="text-sm font-medium text-neutral-800">Resolve Chat & Deploy Latest</div>
        <div className="text-xs text-neutral-600">Given a Website ID (or a selected chat), this will find the chat, read its latestVersionId, and deploy that version.</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResolveAndDeployLatest}
            disabled={!userId || resolving}
            className="inline-flex items-center justify-center rounded-md bg-neutral-900 text-white px-3 py-1.5 text-sm disabled:opacity-60"
          >
            {resolving ? 'Resolving…' : 'Resolve & Deploy Latest'}
          </button>
        </div>
        {(resolvedChatId || resolvedVersionId || resolveError) && (
          <div className="text-sm space-y-1">
            {resolvedChatId && <div>Chat ID: <span className="font-mono">{resolvedChatId}</span></div>}
            {resolvedVersionId && <div>Latest Version ID: <span className="font-mono">{resolvedVersionId}</span></div>}
            {resolveError && <div className="text-red-700">{resolveError}</div>}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-3">
        <div className="text-sm font-medium text-neutral-800">Recent Deployments</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMyDeployments}
            disabled={!userId || loadingDeployments}
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm disabled:opacity-60"
          >
            {loadingDeployments ? 'Loading…' : 'Load Deployments'}
          </button>
        </div>
        {deployments.length > 0 ? (
          <div className="space-y-3">
            {deployments.map((d) => (
              <div key={d.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Deployment <span className="font-mono">{d.v0_deployment_id}</span></div>
                    <div className="text-xs text-neutral-500">Project: <span className="font-mono">{d.v0_project_id}</span> • {new Date(d.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs">Status: <span className="font-mono">{d.status || '—'}</span></div>
                    <button
                      type="button"
                      onClick={() => refreshDeployment(d.v0_deployment_id)}
                      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
                {d.url && (
                  <div className="mt-2 space-y-2">
                    <div className="text-xs">URL: <a href={d.url} target="_blank" rel="noreferrer" className="underline">{d.url}</a></div>
                    <iframe src={d.url} width="100%" height={320} className="rounded-md border" />
                    <div className="text-[11px] text-neutral-500">Note: Some deployments set headers to block embedding in iframes. If the preview is blank, use the URL link above to open in a new tab.</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-neutral-600">No deployments loaded.</div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-3">
        <div className="text-sm font-medium text-neutral-800">Recent Chats (All Projects)</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadRecentChats}
            disabled={!userId || loadingRecent}
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm disabled:opacity-60"
          >
            {loadingRecent ? 'Loading…' : 'Load Recent Chats'}
          </button>
        </div>
        {recentChats.length > 0 ? (
          <div className="max-h-64 overflow-auto border rounded-md divide-y">
            {recentChats.map((c) => (
              <div key={c.id} className="p-2 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate">Chat <span className="font-mono">{c.v0_chat_id}</span></div>
                  <div className="text-xs text-neutral-500">Project: <span className="font-mono">{c.v0_project_id || '—'}</span> • {new Date(c.created_at).toLocaleString()}</div>
                  {c.demo_url && (
                    <a className="text-xs text-success-ink underline" href={c.demo_url} target="_blank" rel="noreferrer">demo</a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setSelectedProjectId(c.v0_project_id || ''); setDeployProjectId(c.v0_project_id || ''); setSelectedChatId(c.v0_chat_id); setChatId(c.v0_chat_id); if (c.v0_project_id) loadProjectChats(c.v0_project_id); }}
                    className="rounded-md bg-neutral-900 text-white px-2 py-1 text-xs"
                  >
                    Use for Deployment
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-neutral-600">No recent chats loaded.</div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-3">
        <div className="text-sm font-medium text-neutral-800">Projects (Your Account)</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMyProjects}
            disabled={!userId || loadingProjects}
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm disabled:opacity-60"
          >
            {loadingProjects ? 'Loading…' : 'Load My Projects'}
          </button>
          <span className="text-xs text-neutral-600">Select a project to view its chats.</span>
        </div>
        {projects.length > 0 ? (
          <div className="max-h-64 overflow-auto border rounded-md divide-y">
            {projects.map((p) => (
              <div key={p.id} className="p-2 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium">{p.name || '(unnamed)'} <span className="text-xs text-neutral-500">{p.v0_project_id}</span></div>
                  <div className="text-xs text-neutral-500">{new Date(p.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setSelectedProjectId(p.v0_project_id); setDeployProjectId(p.v0_project_id); loadProjectChats(p.v0_project_id); }}
                    className="rounded-md bg-neutral-900 text-white px-2 py-1 text-xs"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-neutral-600">No projects loaded.</div>
        )}
        {selectedProjectId && (
          <div className="text-xs text-neutral-700">Selected project: <span className="font-mono">{selectedProjectId}</span></div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-3">
        <div className="text-sm font-medium text-neutral-800">Project Chats</div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <div>Project: <span className="font-mono">{selectedProjectId || '(none)'}</span></div>
          {loadingChats && <div>Loading chats…</div>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => selectedProjectId && loadProjectChats(selectedProjectId)}
            disabled={!selectedProjectId || loadingChats}
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm disabled:opacity-60"
          >
            {loadingChats ? 'Loading…' : 'Reload Chats'}
          </button>
          <button
            type="button"
            onClick={handleCreateChatForSelectedProject}
            disabled={!selectedProjectId || creatingChat}
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-3 py-1.5 text-sm disabled:opacity-60"
          >
            {creatingChat ? 'Creating…' : 'Create Chat for this Project'}
          </button>
        </div>
        {projectChats.length > 0 ? (
          <div className="max-h-64 overflow-auto border rounded-md divide-y">
            {projectChats.map((c) => (
              <div key={c.id} className="p-2 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate">Chat <span className="font-mono">{c.v0_chat_id}</span></div>
                  {c.demo_url && (
                    <a className="text-xs text-success-ink underline" href={c.demo_url} target="_blank" rel="noreferrer">demo</a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setSelectedChatId(c.v0_chat_id); setChatId(c.v0_chat_id); }}
                    className="rounded-md bg-neutral-900 text-white px-2 py-1 text-xs"
                  >
                    Use Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-neutral-600">No chats for this project yet.</div>
        )}
        {selectedChatId && (
          <div className="text-xs text-neutral-700">Selected chat: <span className="font-mono">{selectedChatId}</span></div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-3">
        <div className="text-sm font-medium text-neutral-800">1) Create Project</div>
        {projectError && <div className="text-sm text-red-700">{projectError}</div>}
        <label className="block text-sm">
          Name
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={projName}
            onChange={(e) => setProjName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Description (optional)
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={projDesc}
            onChange={(e) => setProjDesc(e.target.value)}
          />
        </label>
        <button
          onClick={handleCreateProject}
          disabled={creatingProject || !userId}
          className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {creatingProject ? "Creating..." : "Create Project"}
        </button>
        {projectId && (
          <div className="text-sm text-neutral-700">Created Project ID: <span className="font-mono">{projectId}</span></div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-3">
        <div className="text-sm font-medium text-neutral-800">2) Create Chat</div>
        {chatError && <div className="text-sm text-red-700">{chatError}</div>}
        <label className="block text-sm">
          Message
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          v0 Project ID (optional)
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            placeholder="project id"
            value={chatProjectId}
            onChange={(e) => setChatProjectId(e.target.value)}
          />
        </label>
        <button
          onClick={handleCreateChat}
          disabled={creatingChat || !userId}
          className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {creatingChat ? "Creating..." : "Create Chat"}
        </button>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-sm">
            Continue message
            <input
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
              value={continueMsg}
              onChange={(e) => setContinueMsg(e.target.value)}
            />
          </label>
          <div className="flex items-end">
            <button
              onClick={handleContinueChat}
              disabled={continuing || !userId || !chatId}
              className="inline-flex items-center justify-center rounded-md bg-neutral-900 text-white px-4 py-2 text-sm disabled:opacity-60"
            >
              {continuing ? 'Continuing…' : 'Continue Chat'}
            </button>
          </div>
        </div>
        {chatId && (
          <div className="space-y-2">
            <div className="text-sm text-neutral-700">Chat ID: <span className="font-mono">{chatId}</span></div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refreshChat}
                className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs"
              >
                Refresh Chat Preview
              </button>
            </div>
            {chatDemo && (
              <div className="space-y-2">
                <div className="text-sm text-neutral-700">Demo preview:</div>
                <iframe src={chatDemo} width="100%" height={460} className="rounded-md border" />
              </div>
            )}
            {chatFiles && (
              <details className="text-sm">
                <summary className="cursor-pointer select-none">Files ({chatFiles.length})</summary>
                <pre className="mt-2 max-h-64 overflow-auto bg-neutral-50 p-2 rounded border text-xs">
{JSON.stringify(chatFiles, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 p-4 shadow-soft space-y-3">
        <div className="text-sm font-medium text-neutral-800">3) Deploy</div>
        <div className="text-xs text-neutral-600">Note: Deployment requires a versionId (preferred by v0) or a chatId. If you have a specific versionId, paste it below.</div>
        {deployError && <div className="text-sm text-red-700">{deployError}</div>}
        <label className="block text-sm">
          v0 Project ID
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            placeholder="project id"
            value={deployProjectId}
            onChange={(e) => setDeployProjectId(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Version ID (preferred)
          <input
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
            placeholder="version id"
            value={versionId}
            onChange={(e) => setVersionId(e.target.value)}
          />
        </label>
        <button
          onClick={handleDeploy}
          disabled={deploying || !deployProjectId || !userId}
          className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-60"
        >
          {deploying ? "Deploying..." : "Create Deployment"}
        </button>
        {(deploymentId || deploymentStatus || deploymentUrl) && (
          <div className="text-sm text-neutral-700 space-y-1">
            {deploymentId && <div>Deployment ID: <span className="font-mono">{deploymentId}</span></div>}
            {deploymentStatus && <div>Status: {deploymentStatus}</div>}
            {deploymentUrl && (
              <div>
                URL: <a className="text-success-ink underline" href={deploymentUrl} target="_blank" rel="noreferrer">{deploymentUrl}</a>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
