import { NextResponse } from 'next/server';
import { v0 } from '@/lib/v0';
import { getSupabaseServer } from '@/lib/supabaseServer';

// POST /api/v0/deployments
// Body: { projectId: string, chatId?: string, versionId?: string, user_id: string, website_id?: string, metadata?: any }
// Creates a v0 deployment (requires chatId or versionId) and persists it to DB
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = (body?.projectId as string | undefined)?.trim();
    const chatId = (body?.chatId as string | undefined)?.trim();
    let versionId = (body?.versionId as string | undefined)?.trim();
    if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });

    // Auto-resolve latest versionId when only chatId is provided
    if (!versionId && chatId) {
      // SDK attempt: tolerant to different method names
      try {
        const chats: any = (v0 as any)?.chats;
        if (chats?.findVersions) {
          const resp = await chats.findVersions({ chatId, limit: 1 });
          const list = (resp as any)?.versions || (resp as any)?.data || resp || [];
          const latest = Array.isArray(list) ? list[0] : ((list as any)?.items?.[0] || null);
          versionId = (latest as any)?.id || (latest as any)?.versionId || undefined;
        } else if (chats?.versions?.list) {
          const resp = await chats.versions.list({ chatId, limit: 1 });
          const list = (resp as any)?.versions || (resp as any)?.data || resp || [];
          const latest = Array.isArray(list) ? list[0] : ((list as any)?.items?.[0] || null);
          versionId = (latest as any)?.id || (latest as any)?.versionId || undefined;
        }
      } catch {}
      // REST fallback to resolve latest version
      if (!versionId) {
        const apiKey = process.env.V0_API_KEY;
        const base = process.env.V0_API_BASE || 'https://api.v0.dev';
        if (apiKey) {
          try {
            // Try simple chat fetch that includes latestVersion
            const r1 = await fetch(`${base}/chats/${encodeURIComponent(chatId)}`, {
              headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
            });
            const j1 = await r1.json().catch(() => ({} as any));
            if (r1.ok) {
              versionId = j1?.latestVersion?.id || j1?.chat?.latestVersion?.id || undefined;
            }
            // Try explicit versions listing if still missing
            if (!versionId) {
              const r2 = await fetch(`${base}/chats/${encodeURIComponent(chatId)}/versions?limit=1`, {
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
              });
              const j2 = await r2.json().catch(() => ({} as any));
              if (r2.ok) {
                const list = j2?.versions || j2?.data || j2 || [];
                const latest = Array.isArray(list) ? list[0] : (list?.items?.[0] || null);
                versionId = latest?.id || latest?.versionId || undefined;
              }
            }
          } catch {}
        }
      }
    }
    if (!chatId && !versionId) return NextResponse.json({ error: 'Missing chatId or versionId' }, { status: 400 });

    const args: any = { projectId };
    if (chatId) args.chatId = chatId;
    if (versionId) args.versionId = versionId;
    let deployment: any = null;
    try {
      deployment = await (v0 as any).deployments.create(args);
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Failed to create deployment via SDK' }, { status: 500 });
    }

    const user_id: string | undefined = body?.user_id;
    const website_id: string | undefined = body?.website_id;
    if (!user_id) return NextResponse.json({ error: 'Missing user_id (sign in required)' }, { status: 400 });

    const supabase = getSupabaseServer();
    const { error: persistErr } = await supabase.from('v0_deployments')
      .insert({
        user_id,
        website_id: website_id ?? null,
        v0_project_id: projectId,
        v0_deployment_id: (deployment as any).id,
        status: (deployment as any).status ?? null,
        url: (deployment as any).webUrl ?? (deployment as any).url ?? null,
        metadata: {
          ...(body?.metadata ?? {}),
          chatId: chatId ?? null,
          versionId: versionId ?? null,
        },
      })
      .single();
    if (persistErr) {
      return NextResponse.json({ error: `Failed to persist deployment: ${persistErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ id: (deployment as any).id, deployment }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
