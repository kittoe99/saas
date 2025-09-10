import { NextResponse } from 'next/server'
import { v0 } from '@/lib/v0'
import { getSupabaseServer } from '@/lib/supabaseServer'

// GET /api/v0/chats/[id]
// Fetch latest chat details from v0, persist demoUrl/files, and return them
export async function GET(_: Request, { params }: any) {
  try {
    const id = params?.id?.trim()
    if (!id) return NextResponse.json({ error: 'Missing chat id' }, { status: 400 })

    const chat: any = await (v0 as any).chats.get({ chatId: id })
    const demoUrl = chat?.latestVersion?.demoUrl ?? null
    const files = chat?.latestVersion?.files ?? null

    const supabase = getSupabaseServer()
    const { error: upErr } = await supabase
      .from('v0_chats')
      .update({
        demo_url: demoUrl,
        files: files,
      })
      .eq('v0_chat_id', id)
      .single()

    if (upErr) {
      return NextResponse.json({ error: `Failed to persist chat refresh: ${upErr.message}` }, { status: 500 })
    }

    return NextResponse.json({ id, demo: demoUrl, files }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
