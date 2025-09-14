import { NextResponse } from 'next/server'
import { v0 } from '@/lib/v0'
import { getSupabaseServer } from '@/lib/supabaseServer'

// GET /api/v0/chats/[id]
// Fetch latest chat details from v0, persist demoUrl/files, and return them
export async function GET(_: Request, { params }: any) {
  try {
    const id = params?.id?.trim()
    if (!id) return NextResponse.json({ error: 'Missing chat id' }, { status: 400 })

    let chat: any = null
    let demoUrl: string | null = null
    let files: any = null
    let latestVersionId: string | null = null

    // Try SDK using tolerant method names
    try {
      const api: any = (v0 as any)?.chats
      if (api) {
        if (typeof api.get === 'function') {
          chat = await api.get({ chatId: id })
        } else if (typeof api.retrieve === 'function') {
          chat = await api.retrieve({ chatId: id })
        } else if (typeof api.find === 'function') {
          chat = await api.find({ chatId: id })
        }
      }
      demoUrl = chat?.latestVersion?.demoUrl ?? null
      files = chat?.latestVersion?.files ?? null
      latestVersionId = chat?.latestVersion?.id ?? null
    } catch (e) {
      // Ignore and fall back to DB
    }

    const supabase = getSupabaseServer()

    if (demoUrl !== null || files !== null) {
      const { error: upErr } = await supabase
        .from('v0_chats')
        .update({ demo_url: demoUrl, files })
        .eq('v0_chat_id', id)
        .single()
      if (upErr) {
        return NextResponse.json({ error: `Failed to persist chat refresh: ${upErr.message}` }, { status: 500 })
      }
      return NextResponse.json({ id, demo: demoUrl, files, latestVersionId }, { status: 200 })
    }

    // Fallback: read from DB if SDK isn't available or returned nothing yet
    const { data: row, error: readErr } = await supabase
      .from('v0_chats')
      .select('demo_url, files')
      .eq('v0_chat_id', id)
      .maybeSingle()
    if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 })
    return NextResponse.json({ id, demo: row?.demo_url ?? null, files: row?.files ?? null, latestVersionId: null }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
