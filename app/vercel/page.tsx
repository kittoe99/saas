import { listProjects } from '@/lib/vercel';
import Link from 'next/link';

export const revalidate = 0; // always fresh

function fmtDate(ts?: number) {
  if (!ts) return '-';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export default async function VercelProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = (await searchParams) || {};
  const teamId = (sp?.teamId as string | undefined) || process.env.VERCEL_TEAM_ID;
  const limit = Number(sp?.limit ?? 20);
  const from = (sp?.from as string | undefined) || undefined;

  let data: Awaited<ReturnType<typeof listProjects>> | null = null;
  let error: string | null = null;
  try {
    data = await listProjects({ teamId, limit: isNaN(limit) ? 20 : limit, from });
  } catch (e: any) {
    error = e?.message || 'Failed to fetch projects';
  }

  const projects = data?.projects ?? [];
  const nextCursor = (data as any)?.pagination?.next as string | undefined;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold mb-4">Vercel Projects</h1>

      <form className="flex flex-wrap gap-3 mb-6" method="get">
        <div>
          <label className="block text-sm font-medium mb-1">Team ID (optional)</label>
          <input
            className="border rounded px-3 py-2 w-80"
            type="text"
            name="teamId"
            placeholder="team_xxx"
            defaultValue={teamId || ''}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Limit</label>
          <input className="border rounded px-3 py-2 w-28" type="number" name="limit" defaultValue={isNaN(limit) ? 20 : limit} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">From (cursor)</label>
          <input className="border rounded px-3 py-2 w-80" type="text" name="from" defaultValue={from || ''} />
        </div>
        <div className="self-end">
          <button className="bg-black text-white rounded px-4 py-2" type="submit">Load</button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-6">
          Error: {error}
        </div>
      )}

      <div className="text-sm text-gray-600 mb-3">
        Showing {projects.length} project(s){teamId ? ` in team ${teamId}` : ''}. {nextCursor && (
          <>
            Next cursor: <code className="px-1 py-0.5 bg-gray-100 rounded">{nextCursor}</code>
          </>
        )}
      </div>

      <div className="border rounded divide-y">
        {projects.map((p: any) => (
          <div key={p.id} className="p-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-gray-600">ID: {p.id}</div>
              {p.framework && <div className="text-xs text-gray-600">Framework: {p.framework}</div>}
              {p.environment && <div className="text-xs text-gray-600">Env: {Array.isArray(p.environment) ? p.environment.join(', ') : ''}</div>}
            </div>
            <div className="text-xs text-gray-600 text-right min-w-[220px]">
              <div>Created: {fmtDate(p.createdAt)}</div>
              {p.link?.type && p.link?.repo && (
                <div>
                  Repo: {p.link.type} / {p.link.repo}
                </div>
              )}
              {p.latestDeployments?.[0]?.url && (
                <div>
                  Latest: <a className="text-blue-600 hover:underline" href={`https://${p.latestDeployments[0].url}`} target="_blank">{p.latestDeployments[0].url}</a>
                </div>
              )}
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="p-6 text-sm text-gray-600">No projects found for the given scope.</div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        {nextCursor && (
          <Link
            className="border rounded px-3 py-2 text-sm hover:bg-gray-50"
            href={{ pathname: '/vercel', query: { teamId: teamId || undefined, limit: isNaN(limit) ? 20 : limit, from: nextCursor } }}
          >
            Next page →
          </Link>
        )}
        <Link className="border rounded px-3 py-2 text-sm hover:bg-gray-50" href={{ pathname: '/vercel' }}>
          Reset
        </Link>
      </div>
    </div>
  );
}
