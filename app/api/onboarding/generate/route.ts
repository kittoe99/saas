import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { v0 } from '@/lib/v0'
import { buildInitialChatPrompt, buildProjectInstructions, getBlueprint } from '@/lib/blueprints'

// POST /api/onboarding/generate
// Body: { user_id: string, website_id?: string, industry: string, answers: any, theme?: any, deploy?: boolean }
// Creates a v0 project with instructions, creates/initializes a chat with an initial prompt, and (optionally) deploys the latest version.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    let user_id = (body?.user_id as string | undefined) || undefined
    const website_id = (body?.website_id as string | undefined) || undefined
    const industry = (body?.industry as string | undefined) || 'Generic'
    const answers = (body?.answers as any) || {}
    const theme = (body?.theme as any) || null
    const deploy = Boolean(body?.deploy)

    // Prefer auth-derived user if not explicitly provided (to avoid passing IDs around)
    const supabase = getSupabaseServer()
    if (!user_id) {
      try {
        const { data } = await supabase.auth.getUser()
        user_id = data?.user?.id || undefined
      } catch {}
    }
    if (!user_id) return NextResponse.json({ error: 'Missing user (not authenticated)' }, { status: 401 })

    // supabase already initialized above

    // Compose blueprint and instructions
    const blueprint = getBlueprint(industry)
    const projectInstructionsRaw = (typeof (body as any)?.instructions === 'string' && (body as any).instructions.trim().length)
      ? (body as any).instructions as string
      : (typeof theme === 'string' && theme.trim().length)
        ? (theme as string)
        : buildProjectInstructions(theme, blueprint)
    // v0 API constraint: instructions must be <= 1000 chars
    const projectInstructions = String(projectInstructionsRaw || '').slice(0, 1000)
    const initialPrompt = buildInitialChatPrompt(answers, blueprint, theme)

    // 1) Create v0 project
    const rawName: string = (answers?.brand?.name || answers?.businessName || 'New Site') as string
    const cleanName = String(rawName).trim().slice(0, 60) || 'New Site'
    const project: any = await (v0 as any).projects.create({
      name: cleanName,
      description: answers?.tagline || answers?.description || undefined,
      instructions: projectInstructions,
    })

    // Persist link in v0_projects for tracking
    const { error: pErr } = await supabase
      .from('v0_projects')
      .insert({
        user_id,
        website_id: website_id ?? null,
        v0_project_id: project?.id,
        name: project?.name ?? cleanName,
      })
      .single()
    if (pErr) return NextResponse.json({ error: `Failed to persist project: ${pErr.message}` }, { status: 500 })

    // 2) Create a chat within this project with initial prompt
    const chat: any = await (v0 as any).chats.create({ message: initialPrompt, projectId: project?.id })
    const demoUrl = chat?.latestVersion?.demoUrl ?? null
    const files = chat?.latestVersion?.files ?? null

    const { error: cErr } = await supabase
      .from('v0_chats')
      .insert({
        user_id,
        website_id: website_id ?? null,
        v0_project_id: project?.id ?? null,
        v0_chat_id: chat?.id,
        demo_url: demoUrl,
        files: files,
      })
      .single()
    if (cErr) return NextResponse.json({ error: `Failed to persist chat: ${cErr.message}` }, { status: 500 })

    // 3) Record onboarding submission (for auditing/traceability)
    const { data: obRow, error: oErr } = await supabase
      .from('onboarding_submissions')
      .insert({
        user_id,
        website_id: website_id ?? null,
        industry,
        answers,
        theme,
        v0_project_id: project?.id ?? null,
        v0_chat_id: chat?.id ?? null,
        status: deploy ? 'generated' : 'generated',
      })
      .select('id')
      .single()
    if (oErr) return NextResponse.json({ error: `Failed to persist onboarding submission: ${oErr.message}` }, { status: 500 })

    // Update websites with v0 links and onboarding submission id
    if (website_id) {
      await supabase
        .from('websites')
        .update({
          onboarding_submission_id: obRow?.id ?? null,
          v0_project_id: project?.id ?? null,
          v0_chat_id: chat?.id ?? null,
        })
        .eq('id', website_id)
    }

    // 4) Optionally deploy
    let deployment: any = null
    if (deploy) {
      // Try to use the latestVersion id if available; else the chatId (server-side may resolve version)
      const versionId: string | undefined = chat?.latestVersion?.id || undefined
      const payload: any = { projectId: project?.id, user_id, website_id }
      if (versionId) payload.versionId = versionId
      else payload.chatId = chat?.id

      deployment = await (v0 as any).deployments.create(payload)

      // Persist deployment
      const { error: dErr } = await supabase
        .from('v0_deployments')
        .insert({
          user_id,
          website_id: website_id ?? null,
          v0_project_id: project?.id,
          v0_deployment_id: deployment?.id,
          status: deployment?.status ?? null,
          url: deployment?.webUrl ?? deployment?.url ?? null,
          metadata: { chatId: chat?.id ?? null, versionId: versionId ?? null },
        })
        .single()
      if (dErr) return NextResponse.json({ error: `Failed to persist deployment: ${dErr.message}` }, { status: 500 })

      // Update onboarding submission with last ids
      await supabase
        .from('onboarding_submissions')
        .update({ last_version_id: versionId ?? null, last_deployment_id: deployment?.id ?? null, status: 'deployed' })
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1)

      // Also reflect latest ids on websites
      if (website_id) {
        await supabase
          .from('websites')
          .update({ last_version_id: versionId ?? null, last_deployment_id: deployment?.id ?? null })
          .eq('id', website_id)
      }
    }

    return NextResponse.json({
      ok: true,
      website_id: website_id ?? null,
      project: { id: project?.id, name: project?.name },
      chat: { id: chat?.id, demoUrl },
      deployment: deployment ? { id: deployment?.id, status: deployment?.status, url: deployment?.webUrl ?? deployment?.url ?? null } : null,
    }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
