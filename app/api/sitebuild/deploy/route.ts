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

    // Ensure we have a versionId. If missing, try deploying directly from chatId first.
    let versionId: string | null = site.last_version_id || null
    let dep: any = null
    if (!versionId && site.v0_chat_id) {
      // Try SDK deployments.create with chatId
      try {
        if ((v0 as any)?.deployments?.create) {
          dep = await (v0 as any).deployments.create({ projectId: site.v0_project_id, chatId: site.v0_chat_id })
        }
      } catch {}
      // REST fallback deployments.create with chatId
      if (!dep) {
        const apiKey = process.env.V0_API_KEY
        if (!apiKey) return NextResponse.json({ error: 'Missing V0_API_KEY for deployment' }, { status: 500 })
        const base = process.env.V0_API_BASE || 'https://api.v0.dev'
        const r0 = await fetch(`${base}/deployments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({ projectId: site.v0_project_id, chatId: site.v0_chat_id })
        })
        const j0 = await r0.json().catch(() => ({} as any))
        if (r0.ok) dep = j0
      }
      // If deployment was created directly from chat, persist row and return
      if (dep?.id) {
        const { error: dErr } = await supabase
          .from('v0_deployments')
          .insert({
            user_id,
            website_id,
            v0_project_id: site.v0_project_id,
            v0_deployment_id: dep?.id ?? null,
            status: dep?.status ?? null,
            url: dep?.webUrl ?? dep?.url ?? null,
            metadata: { chatId: site.v0_chat_id ?? null, versionId: versionId ?? null },
          })
          .single()
        if (dErr) return NextResponse.json({ error: `Failed to persist deployment: ${dErr.message}` }, { status: 500 })
        return NextResponse.json({ ok: true, deploymentId: dep?.id ?? null, status: dep?.status ?? null, url: dep?.webUrl ?? dep?.url ?? null }, { status: 200 })
      }

      // If not supported, create a version from chat (no user message) and then deploy by versionId.
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
      if (!versionId) {
        const apiKey = process.env.V0_API_KEY
        if (!apiKey) return NextResponse.json({ error: 'Missing V0_API_KEY for creating version' }, { status: 500 })
        const base = process.env.V0_API_BASE || 'https://api.v0.dev'
        const r = await fetch(`${base}/chats/${encodeURIComponent(site.v0_chat_id)}/versions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({})
        })
        const j = await r.json().catch(() => ({} as any))
        if (r.ok) {
          versionId = j?.id || j?.versionId || null
        }
        // Try alternate endpoint /generate if versions didn't work or no id returned
        if (!versionId) {
          const r2 = await fetch(`${base}/chats/${encodeURIComponent(site.v0_chat_id)}/generate`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({})
          })
          const j2 = await r2.json().catch(() => ({} as any))
          if (r2.ok) {
            versionId = j2?.id || j2?.versionId || null
          }
          if (!versionId) {
            return NextResponse.json({ error: j?.error || j?.message || j2?.error || j2?.message || 'Failed to create version from chat' }, { status: !r.ok ? r.status : (!r2.ok ? r2.status : 500) })
          }
        }
      }
      if (versionId) {
        await supabase.from('websites').update({ last_version_id: versionId }).eq('id', website_id)
      }
    }

    // Try SDK deployment first
    // At this point, either we already returned (if dep from chat), or we have a versionId
    dep = null
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
