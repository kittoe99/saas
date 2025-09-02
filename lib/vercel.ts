import { URLSearchParams } from 'url';

const VERCEL_API_BASE = 'https://api.vercel.com';

function ensureToken(): string {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) {
    throw new Error('Missing VERCEL_API_TOKEN. Set it in .env.local (and in Vercel Project Settings for production).');
  }
  return token;
}

function defaultTeamId(): string | undefined {
  return process.env.VERCEL_TEAM_ID || undefined;
}

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  const teamId = query?.teamId || defaultTeamId();
  if (teamId) params.set('teamId', String(teamId));
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || k === 'teamId') continue;
      params.set(k, String(v));
    }
  }
  const qs = params.toString();
  return `${VERCEL_API_BASE}${path}${qs ? `?${qs}` : ''}`;
}

async function vercelFetch<T = any>(url: string, init?: RequestInit): Promise<T> {
  const token = ensureToken();
  const res = await fetch(url, {
    ...init,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    // Avoid caching in serverless
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Vercel API error ${res.status}: ${text || res.statusText}`);
  }
  // Some endpoints can be empty; guard
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  // @ts-ignore - return as any if not json
  return text as unknown as T;
}

export async function vercelGet<T = any>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
  const url = buildUrl(path, query);
  return vercelFetch<T>(url, { method: 'GET' });
}

export async function vercelPost<T = any>(path: string, body: any, query?: Record<string, string | number | undefined>): Promise<T> {
  const url = buildUrl(path, query);
  return vercelFetch<T>(url, { method: 'POST', body: JSON.stringify(body) });
}

export type ListDeploymentsParams = {
  projectId?: string;
  teamId?: string;
  limit?: number;
  state?: 'READY' | 'ERROR' | 'QUEUED' | 'BUILDING' | 'CANCELED' | 'INITIALIZING';
};

export async function listDeployments(params: ListDeploymentsParams = {}) {
  const projectId = params.projectId || process.env.VERCEL_PROJECT_ID;
  const query: Record<string, string | number | undefined> = {
    teamId: params.teamId,
    projectId,
    limit: params.limit,
    state: params.state,
  };
  return vercelGet<{ deployments: any[]; pagination?: any }>('/v13/deployments', query);
}

export type ListProjectsParams = {
  teamId?: string;
  limit?: number;
  from?: number | string; // pagination cursor, if provided by API
};

export async function listProjects(params: ListProjectsParams = {}) {
  const query: Record<string, string | number | undefined> = {
    teamId: params.teamId,
    limit: params.limit,
    from: params.from,
  };
  return vercelGet<{ projects: any[]; pagination?: any }>('/v9/projects', query);
}
