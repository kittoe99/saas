import { NextResponse } from 'next/server';
import { v0 } from '@/lib/v0';
import { getSupabaseServer } from '@/lib/supabaseServer';

// POST /api/v0/chats/send
// Body: { chatId: string, message: string, user_id: string, website_id?: string }
// Sends a message to an existing chat, returns updated demo/files, and persists latest snapshot in v0_chats
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const chatId = (body?.chatId as string | undefined)?.trim();
    const message = (body?.message as string | undefined)?.trim();
    const user_id = (body?.user_id as string | undefined)?.trim();
    const website_id = (body?.website_id as string | undefined)?.trim();

    if (!chatId) return NextResponse.json({ error: 'Missing chatId' }, { status: 400 });
    if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    if (!user_id) return NextResponse.json({ error: 'Missing user_id (sign in required)' }, { status: 400 });

    // 1) Try SDK with tolerant method names
    let resp: any = null;
    try {
      const api: any = (v0 as any)?.chats;
      if (api) {
        if (typeof api.sendMessage === 'function') {
          resp = await api.sendMessage({ chatId, message });
        } else if (typeof api.send === 'function') {
          resp = await api.send({ chatId, message });
        } else if (api?.messages && typeof api.messages.create === 'function') {
          resp = await api.messages.create({ chatId, message });
        }
      }
    } catch (e: any) {
      // continue to REST fallback
    }

    // 2) REST fallback if SDK failed or returned nothing
    if (!resp) {
      const apiKey = process.env.V0_API_KEY;
      const base = process.env.V0_API_BASE || 'https://api.v0.dev';
      if (!apiKey) return NextResponse.json({ error: 'Missing V0_API_KEY for REST fallback' }, { status: 500 });
      try {
        const r = await fetch(`${base}/chats/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ chatId, message })
        });
        const j = await r.json().catch(() => ({} as any));
        if (!r.ok) return NextResponse.json({ error: j?.error || 'Failed to continue chat (REST)' }, { status: r.status });
        resp = j;
      } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Failed to continue chat (REST error)' }, { status: 500 });
      }
    }

    const demo = resp?.demo ?? resp?.latestVersion?.demoUrl ?? null;
    const files = resp?.files ?? resp?.latestVersion?.files ?? null;

    // 3) Persist snapshot (upsert if missing; do not require user_id filter)
    const supabase = getSupabaseServer();
    const { data: existing } = await supabase
      .from('v0_chats')
      .select('v0_chat_id')
      .eq('v0_chat_id', chatId)
      .maybeSingle();

    if (existing?.v0_chat_id) {
      await supabase
        .from('v0_chats')
        .update({ demo_url: demo, files, website_id: website_id || null })
        .eq('v0_chat_id', chatId)
        .single();
    } else {
      await supabase
        .from('v0_chats')
        .upsert({
          user_id,
          website_id: website_id || null,
          v0_project_id: (body?.v0_project_id as string | undefined) || null,
          v0_chat_id: chatId,
          demo_url: demo,
          files,
        }, { onConflict: 'v0_chat_id' })
        .single();
    }

    return NextResponse.json({ id: chatId, demo, files }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
