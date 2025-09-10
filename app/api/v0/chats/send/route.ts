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

    const res = await (v0 as any).chats.sendMessage({ chatId, message });

    // Persist latest snapshot on the chat row (best effort but with surfaced error)
    const supabase = getSupabaseServer();
    const { error: upErr } = await supabase
      .from('v0_chats')
      .update({
        demo_url: (res as any).demo ?? null,
        files: (res as any).files ?? null,
      })
      .eq('v0_chat_id', chatId)
      .eq('user_id', user_id)
      .single();
    if (upErr) {
      return NextResponse.json({ error: `Failed to persist chat update: ${upErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ id: chatId, demo: (res as any).demo ?? null, files: (res as any).files ?? null }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
