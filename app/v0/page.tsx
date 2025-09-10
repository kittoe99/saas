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

  // Deployment state
  const [deployProjectId, setDeployProjectId] = useState<string>("");
  const [deploymentId, setDeploymentId] = useState<string>("");
  const [deploymentStatus, setDeploymentStatus] = useState<string>("");
  const [deploymentUrl, setDeploymentUrl] = useState<string>("");
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);

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
      setChatId((result as any).id);
      setChatDemo((result as any).demo || "");
      setChatFiles((result as any).files || null);
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
      setChatId((result as any).id);
      setChatDemo((result as any).demo || "");
      setChatFiles((result as any).files || null);
      await loadProjectChats(selectedProjectId);
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
      const result = await postJSON<{ id: string; deployment: any }>("/api/v0/deployments", {
        projectId: deployProjectId || selectedProjectId,
        chatId: (selectedChatId || chatId) || undefined,
        user_id: userId || undefined,
        website_id: websiteId || undefined,
      });
      if ((result as any).error) throw new Error((result as any).error);
      setDeploymentId((result as any).id);
      setDeploymentStatus((result as any).deployment?.status || "");
      setDeploymentUrl((result as any).deployment?.url || "");
    } catch (e: any) {
      setDeployError(e?.message || "Failed to create deployment");
    } finally {
      setDeploying(false);
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
        {chatId && (
          <div className="space-y-2">
            <div className="text-sm text-neutral-700">Chat ID: <span className="font-mono">{chatId}</span></div>
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
        <div className="text-xs text-neutral-600">Note: Deployment requires a chatId or versionId. This page will pass the Chat ID created above automatically.</div>
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
