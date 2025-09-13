import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { v0 } from '@/lib/v0'

// POST /api/sitebuild/deploy
// Body: { user_id: string; website_id: string }
// Creates a deployment for the project's latest version (or by chatId) and persists it.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const user_id: string | undefined = body?.user_id
    const website_id: string | undefined = body?.website_id
    if (!user_id || !website_id) {
      return NextResponse.json({ error: 'Missing user_id or website_id' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // Load website linkage
    const { data: site, error: siteErr } = await supabase
      .from('websites')
      .select('v0_project_id, v0_chat_id, last_version_id')
      .eq('id', website_id)
      .eq('user_id', user_id)
      .maybeSingle()
    if (siteErr) return NextResponse.json({ error: siteErr.message }, { status: 500 })
    if (!site?.v0_project_id) return NextResponse.json({ error: 'No v0_project_id found for website' }, { status: 404 })

    // Ensure we have a versionId. If missing, try to create one from chatId.
    let versionId: string | null = site.last_version_id || null
    if (!versionId && site.v0_chat_id) {
      // Try SDK to create a new version first
      try {
        const chats: any = (v0 as any)?.chats
        if (chats?.versions?.create) {
          const created = await chats.versions.create({ chatId: site.v0_chat_id })
          versionId = created?.id || created?.versionId || null
        } else if (chats?.createVersion) {
          const created = await chats.createVersion({ chatId: site.v0_chat_id })
          versionId = created?.id || created?.versionId || null
        } else if (chats?.generate) {
          const created = await chats.generate({ chatId: site.v0_chat_id })
          versionId = created?.id || created?.versionId || null
        }
      } catch {}
      // REST fallback to create version if still missing
      if (!versionId) {
        const apiKey = process.env.V0_API_KEY
        if (!apiKey) return NextResponse.json({ error: 'Missing V0_API_KEY for creating version' }, { status: 500 })
        const base = process.env.V0_API_BASE || 'https://api.v0.dev'
        // First, try to send a small message to trigger generation
        try {
          const chats: any = (v0 as any)?.chats
          if (chats?.sendMessage) {
            await chats.sendMessage({ chatId: site.v0_chat_id, message: 'Prepare for deployment: finalize latest version' })
          } else {
            await fetch(`${base}/chats/${encodeURIComponent(site.v0_chat_id)}/messages`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
              body: JSON.stringify({ role: 'user', content: 'Prepare for deployment: finalize latest version' })
            }).catch(() => {})
          }
        } catch {}
        // Poll chat for latestVersion id (up to ~90s)
        for (let i = 0; i < 30 && !versionId; i++) {
          const gr = await fetch(`${base}/chats/${encodeURIComponent(site.v0_chat_id)}`, {
            method: 'GET', headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
          })
          const gj = await gr.json().catch(() => ({} as any))
          if (gr.ok) {
            versionId = gj?.latestVersion?.id || gj?.chat?.latestVersion?.id || null
            if (versionId) break
          }
          await new Promise((r) => setTimeout(r, 3000))
        }
        if (!versionId) {
          return NextResponse.json({ error: 'Failed to create version from chat (no latestVersion found after polling). Ensure the chat has generated at least one version.' }, { status: 500 })
        }
      }
      // Persist last_version_id on websites if obtained
      if (versionId) {
        await supabase
          .from('websites')
          .update({ last_version_id: versionId })
          .eq('id', website_id)
      }
    }

    // Try SDK deployment first
    let dep: any = null
    try {
      const payload: any = { projectId: site.v0_project_id }
      if (versionId) payload.versionId = versionId
      if ((v0 as any)?.deployments?.create) {
        dep = await (v0 as any).deployments.create(payload)
      }
    } catch (e) {}

    // REST fallback
    if (!dep) {
      const apiKey = process.env.V0_API_KEY
      if (!apiKey) return NextResponse.json({ error: 'Missing V0_API_KEY for deployment' }, { status: 500 })
      const base = process.env.V0_API_BASE || 'https://api.v0.dev'
      const r = await fetch(`${base}/deployments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ projectId: site.v0_project_id, versionId: versionId || undefined })
      })
      const j = await r.json().catch(() => ({} as any))
      if (!r.ok) return NextResponse.json({ error: j?.error || j?.message || 'Failed to create deployment' }, { status: r.status })
      dep = j
    }

    // Persist deployment row
    const { error: dErr } = await supabase
      .from('v0_deployments')
      .insert({
        user_id,
        website_id,
        v0_project_id: site.v0_project_id,
        v0_deployment_id: dep?.id ?? null,
        status: dep?.status ?? null,
        url: dep?.webUrl ?? dep?.url ?? null,
        metadata: { chatId: site.v0_chat_id ?? null, versionId: site.last_version_id ?? null },
      })
      .single()
    if (dErr) return NextResponse.json({ error: `Failed to persist deployment: ${dErr.message}` }, { status: 500 })

    return NextResponse.json({ ok: true, deploymentId: dep?.id ?? null, status: dep?.status ?? null, url: dep?.webUrl ?? dep?.url ?? null }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
