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

    // Try SDK deployment first
    let dep: any = null
    try {
      const payload: any = { projectId: site.v0_project_id }
      if (site.last_version_id) payload.versionId = site.last_version_id
      else if (site.v0_chat_id) payload.chatId = site.v0_chat_id
      if ((v0 as any)?.deployments?.create) {
        dep = await (v0 as any).deployments.create(payload)
      }
    } catch {}

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
        body: JSON.stringify({ projectId: site.v0_project_id, versionId: site.last_version_id || undefined, chatId: site.v0_chat_id || undefined })
      })
      const j = await r.json().catch(() => ({} as any))
      if (!r.ok) return NextResponse.json({ error: j?.error || 'Failed to create deployment' }, { status: r.status })
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
