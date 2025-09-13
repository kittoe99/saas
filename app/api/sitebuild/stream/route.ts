import { NextResponse } from 'next/server'

function encoder() {
  return new TextEncoder()
}

async function pollChat(chatId: string, origin: string) {
  const url = `${origin}/api/v0/chats/${encodeURIComponent(chatId)}`
  const res = await fetch(url, { cache: 'no-store' })
  // Expected shape: { demo?: string, chat?: {...}, ... }
  const json = await res.json().catch(() => ({} as any))
  if (!res.ok) throw new Error(json?.error || `Failed to fetch chat ${chatId}`)
  const demo = json?.demo || json?.chat?.demoUrl || json?.chat?.latestVersion?.demoUrl || null
  return { demo }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const chatId = searchParams.get('chatId') || ''
  if (!chatId) {
    return NextResponse.json({ error: 'Missing chatId' }, { status: 400 })
  }
  const { origin } = new URL(req.url)

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const e = encoder()
      function send(ev: any) {
        controller.enqueue(e.encode(`data: ${JSON.stringify(ev)}\n\n`))
      }
      // Initial stages
      send({ type: 'stage', label: 'Creating chat…' })
      send({ type: 'stage', label: 'Generating first version…' })

      let attempts = 0
      const maxAttempts = 60 // ~5 minutes at 5s interval
      try {
        while (attempts < maxAttempts) {
          attempts++
          const { demo } = await pollChat(chatId, origin)
          if (demo) {
            send({ type: 'preview', demoUrl: demo })
            send({ type: 'complete' })
            break
          }
          await new Promise((r) => setTimeout(r, 5000))
        }
        if (attempts >= maxAttempts) {
          send({ type: 'timeout' })
        }
      } catch (err: any) {
        send({ type: 'error', error: err?.message || 'Stream error' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
