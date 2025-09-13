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

    // Try a variety of SDK methods, tolerant to version differences.
    let didSend = false
    let didVersion = false
    try {
      const chats: any = (v0 as any)?.chats
      if (chats) {
        // Official documented method
        if (typeof chats.sendMessage === 'function') {
          await chats.sendMessage({ chatId, message })
          didSend = true
        }
        if (typeof chats.messages?.create === 'function') {
          await chats.messages.create({ chatId, role: 'user', content: message })
          didSend = true
        } else if (typeof chats.send === 'function') {
          await chats.send({ chatId, role: 'user', content: message })
          didSend = true
        } else if (typeof chats.createMessage === 'function') {
          await chats.createMessage({ chatId, role: 'user', content: message })
          didSend = true
        }
        // Attempt to request a new version if supported (often not necessary if sendMessage triggers generation)
        if (typeof chats.versions?.create === 'function') {
          await chats.versions.create({ chatId })
          didVersion = true
        } else if (typeof chats.requestVersion === 'function') {
          await chats.requestVersion({ chatId })
          didVersion = true
        } else if (typeof chats.generate === 'function') {
          await chats.generate({ chatId })
          didVersion = true
        } else if (typeof chats.createVersion === 'function') {
          await chats.createVersion({ chatId })
          didVersion = true
        }
      }
    } catch (e) {
      // swallow and fallback; SSE polling may still see updated state if any method succeeded
    }

    // REST fallbacks (direct V0 API) if SDK surface doesn't match
    // Requires V0_API_KEY in env
    const apiKey = process.env.V0_API_KEY
    if ((!didSend || !didVersion) && !apiKey) {
      return NextResponse.json({ error: 'Missing V0_API_KEY on the server. Set it in your server env (.env.local) for REST fallback.' }, { status: 500 })
    }
    if ((!didSend || !didVersion) && apiKey && chatId) {
      const base = process.env.V0_API_BASE || 'https://api.v0.dev'
      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      }
      try {
        if (!didSend) {
          const r1 = await fetch(`${base}/chats/${encodeURIComponent(chatId)}/messages`, {
            method: 'POST', headers, body: JSON.stringify({ role: 'user', content: message })
          })
          if (r1.ok) didSend = true
        }
      } catch {}
      try {
        if (!didVersion) {
          // Try create a new version explicitly
          const r2 = await fetch(`${base}/chats/${encodeURIComponent(chatId)}/versions`, {
            method: 'POST', headers, body: JSON.stringify({})
          })
          if (r2.ok) didVersion = true
        }
      } catch {}
      try {
        if (!didVersion) {
          // Fallback generate endpoint if available
          const r3 = await fetch(`${base}/chats/${encodeURIComponent(chatId)}/generate`, {
            method: 'POST', headers, body: JSON.stringify({})
          })
          if (r3.ok) didVersion = true
        }
      } catch {}
    }

    if (!didSend && !didVersion) {
      const methods: string[] = []
      try {
        const chats: any = (v0 as any)?.chats
        if (chats) {
          for (const k of Object.keys(chats)) {
            if (typeof (chats as any)[k] === 'function') methods.push(k)
          }
          if (chats.messages) {
            const sub: string[] = []
            for (const k of Object.keys(chats.messages)) {
              if (typeof (chats.messages as any)[k] === 'function') sub.push(`messages.${k}`)
            }
            methods.push(...sub)
          }
          if (chats.versions) {
            const sub: string[] = []
            for (const k of Object.keys(chats.versions)) {
              if (typeof (chats.versions as any)[k] === 'function') sub.push(`versions.${k}`)
            }
            methods.push(...sub)
          }
        }
      } catch {}
      return NextResponse.json({ error: 'v0 chat continuation methods are unavailable in the current SDK. Could not send message.', methods }, { status: 500 })
    }

    return NextResponse.json({ ok: true, chatId }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
