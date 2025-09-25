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
    if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    if (!user_id) return NextResponse.json({ error: 'Missing user_id (sign in required)' }, { status: 400 });

    // 1) Try SDK chat create
    let chat: any = null;
    try {
      chat = await (v0 as any).chats.create(
        v0_project_id ? { message, projectId: v0_project_id } : { message }
      );
    } catch (e) {
      // 2) REST fallback
      const apiKey = process.env.V0_API_KEY;
      const base = process.env.V0_API_BASE || 'https://api.v0.dev';
      if (!apiKey) throw e;
      const r = await fetch(`${base}/chats`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(
          v0_project_id ? { message, projectId: v0_project_id } : { message }
        ),
      });
      const j = await r.json().catch(() => ({} as any));
      if (!r.ok) return NextResponse.json({ error: j?.error || 'Failed to create chat (REST)' }, { status: r.status });
      chat = j;
    }

    const chatId = chat?.id as string | undefined;
    const demoUrl = chat?.latestVersion?.demoUrl ?? null;
    const files = chat?.latestVersion?.files ?? null;

    // 3) Persist or upsert v0_chats and attach to website
    let persistError: string | null = null;
    try {
      const supabase = getSupabaseServer();
      // Upsert v0_chats
      await supabase
        .from('v0_chats')
        .upsert({
          user_id,
          website_id: website_id ?? null,
          v0_project_id: v0_project_id ?? null,
          v0_chat_id: chatId,
          demo_url: demoUrl,
          files: files,
        }, { onConflict: 'v0_chat_id' })
        .select('v0_chat_id')
        .single();
      // Set websites.v0_chat_id when provided a website
      if (website_id && chatId) {
        await supabase
          .from('websites' as any)
          .update({ v0_chat_id: chatId })
          .eq('id', website_id)
          .eq('user_id', user_id)
          .single();
      }
    } catch (e: any) {
      persistError = e?.message || String(e);
    }

    return NextResponse.json(
      { id: chatId, demo: demoUrl, files: files, persistError: persistError || undefined },
      { status: 200 }
    );
  } catch (e: any) {
    const msg = e?.message || 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
