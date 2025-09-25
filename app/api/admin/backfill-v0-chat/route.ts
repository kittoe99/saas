import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

// POST /api/admin/backfill-v0-chat
// Body: { website_id: string, chat_id?: string }
// Ensures a row exists in v0_chats for the given website/chat by fetching chat details
// and upserting { user_id, website_id, v0_project_id?, v0_chat_id, demo_url, files }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const website_id: string | undefined = body?.website_id
    let chat_id: string | undefined = body?.chat_id
    if (!website_id) return NextResponse.json({ error: 'Missing website_id' }, { status: 400 })

    const supabase = getSupabaseServer()

    // Load website mapping
    const { data: w, error: werr } = await supabase
      .from('websites' as any)
      .select('id, user_id, v0_project_id, v0_chat_id')
      .eq('id', website_id)
      .maybeSingle()
    if (werr) return NextResponse.json({ error: werr.message }, { status: 500 })
    if (!w) return NextResponse.json({ error: 'Website not found' }, { status: 404 })

    if (!chat_id) chat_id = (w as any)?.v0_chat_id || undefined
    // If still missing, they must provide chat_id
    if (!chat_id) return NextResponse.json({ error: 'Missing chat_id (not on website, please provide chat_id)' }, { status: 400 })
    // If website not linked yet, set v0_chat_id to this chat
    if (!w?.v0_chat_id) {
      const { error: linkErr } = await supabase
        .from('websites' as any)
        .update({ v0_chat_id: chat_id })
        .eq('id', website_id)
        .single()
      if (linkErr) return NextResponse.json({ error: `Failed to link chat to website: ${linkErr.message}` }, { status: 500 })
    }

    // Call our internal chat GET to fetch latest and trigger DB upsert logic
    try {
      const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const r = await fetch(`${origin}/api/v0/chats/${encodeURIComponent(chat_id)}`, { cache: 'no-store' })
      const j = await r.json().catch(() => ({} as any))
      if (!r.ok) return NextResponse.json({ error: j?.error || 'Failed to fetch chat for upsert' }, { status: r.status })
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Failed to refresh chat' }, { status: 500 })
    }

    // Ensure row exists and is associated to website/user/project
    const { data: existing } = await supabase
      .from('v0_chats')
      .select('v0_chat_id, website_id, user_id, v0_project_id')
      .eq('v0_chat_id', chat_id)
      .maybeSingle()

    const patch: any = {}
    if (!existing?.website_id && w?.id) patch.website_id = w.id
    if (!existing?.user_id && w?.user_id) patch.user_id = w.user_id
    if (!existing?.v0_project_id && w?.v0_project_id) patch.v0_project_id = w.v0_project_id

    if (Object.keys(patch).length) {
      const { error: upErr } = await supabase
        .from('v0_chats')
        .update(patch)
        .eq('v0_chat_id', chat_id)
        .single()
      if (upErr) return NextResponse.json({ error: `Failed to finalize chat record: ${upErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, chat_id }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
