import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { v0 } from '@/lib/v0'

// POST /api/sitebuild/continue
// Body: { user_id: string; website_id?: string; chatId?: string; message: string }
// Attempts to send a continuation message to the v0 Chat and request a new version.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const user_id: string | undefined = body?.user_id
    const website_id: string | undefined = body?.website_id
    let chatId: string | undefined = body?.chatId
    const message: string | undefined = body?.message

    if (!user_id) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
    if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 })

    const supabase = getSupabaseServer()

    if (!chatId) {
      if (!website_id) return NextResponse.json({ error: 'Missing chatId or website_id' }, { status: 400 })
      const { data: row, error } = await supabase
        .from('websites')
        .select('v0_chat_id, user_id')
        .eq('id', website_id)
        .maybeSingle()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      if (!row || row.user_id !== user_id) return NextResponse.json({ error: 'Website not found or access denied' }, { status: 403 })
      if (!row.v0_chat_id) return NextResponse.json({ error: 'No chatId found for website' }, { status: 404 })
      chatId = row.v0_chat_id as string
    }

    // 1) Prefer internal route that V0 page uses, to mirror its behavior exactly
    try {
      const internalUrl = new URL('/api/v0/chats/send', new URL(req.url).origin).toString()
      const local = await fetch(internalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message, user_id, website_id })
      })
      const lj = await local.json().catch(() => ({} as any))
      if (local.ok && !lj?.error) {
        return NextResponse.json({ ok: true, chatId }, { status: 200 })
      }
    } catch {}

    // 2) Fallback to REST if available
    const apiKey = process.env.V0_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing V0_API_KEY on the server. Set it in .env.local for REST continuation.' }, { status: 500 })
    }
    const base = process.env.V0_API_BASE || 'https://api.v0.dev'
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    }
    try {
      const r1 = await fetch(`${base}/chats/send`, {
        method: 'POST', headers, body: JSON.stringify({ chatId, message })
      })
      const j1 = await r1.json().catch(() => ({} as any))
      if (!r1.ok) {
        return NextResponse.json({ error: j1?.error || 'Failed to send message (REST)' }, { status: r1.status })
      }
      // Attempt to request a new version explicitly (in case send doesn't auto-generate)
      try { await fetch(`${base}/chats/${encodeURIComponent(chatId!)}/versions`, { method: 'POST', headers, body: JSON.stringify({}) }) } catch {}
      try { await fetch(`${base}/chats/${encodeURIComponent(chatId!)}/generate`, { method: 'POST', headers, body: JSON.stringify({}) }) } catch {}
      return NextResponse.json({ ok: true, chatId }, { status: 200 })
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Failed to continue chat (REST)' }, { status: 500 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
