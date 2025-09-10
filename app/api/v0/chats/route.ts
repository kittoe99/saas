import { NextResponse } from 'next/server';
import { v0 } from '@/lib/v0';
import { getSupabaseServer } from '@/lib/supabaseServer';

// POST /api/v0/chats
// Body: { message: string, user_id: string, website_id?: string, v0_project_id?: string }
// Creates a new v0 chat (optionally scoped to a v0 project) and persists to DB.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = (body?.message as string | undefined)?.trim();
    const user_id = (body?.user_id as string | undefined) || undefined;
    const website_id = (body?.website_id as string | undefined) || undefined;
    const v0_project_id = (body?.v0_project_id as string | undefined) || undefined;
    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id (sign in required)' }, { status: 400 });
    }

    const chat: any = await (v0 as any).chats.create(
      v0_project_id ? { message, projectId: v0_project_id } : { message }
    );
    const demoUrl = chat?.latestVersion?.demoUrl ?? null;
    const files = chat?.latestVersion?.files ?? null;

    // Persist chat with strict error handling
    const supabase = getSupabaseServer();
    const { error: persistErr } = await supabase
      .from('v0_chats')
      .insert({
        user_id,
        website_id: website_id ?? null,
        v0_project_id: v0_project_id ?? null,
        v0_chat_id: (chat as any).id,
        demo_url: demoUrl,
        files: files,
      })
      .single();
    if (persistErr) {
      return NextResponse.json({ error: `Failed to persist chat: ${persistErr.message}` }, { status: 500 });
    }

    return NextResponse.json(
      { id: chat.id, demo: demoUrl, files: files },
      { status: 200 }
    );
  } catch (e: any) {
    const msg = e?.message || 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
