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
    const versionId = (body?.versionId as string | undefined)?.trim();
    if (!projectId) return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    if (!chatId && !versionId) return NextResponse.json({ error: 'Missing chatId or versionId' }, { status: 400 });

    const args: any = { projectId };
    if (chatId) args.chatId = chatId;
    if (versionId) args.versionId = versionId;
    const deployment = await v0.deployments.create(args);

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
        url: (deployment as any).url ?? null,
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
