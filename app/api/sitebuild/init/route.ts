import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'
import { resolveIndustry } from '@/lib/blueprints'

const THEME_INSTRUCTIONS = `Site theme\n1) Color & Contrast\n- Background: #FCFAF7\n- Terracotta: primary #C0452C, hover/focus #A53A24; subtle bg #F8E9E6\n- Text: primary #2D2A26, secondary #6B6660\n\n2) Typography\n- Font: Geist; Headings 600; Body 16px/1.6; Labels 500 with 0.02em\n\n3) Surfaces & Layers\n- Radii: Cards 12px, Inputs/Buttons 8px\n- Shadows: Card low 0 2px 8px rgba(0,0,0,.08); High 0 8px 30px rgba(0,0,0,.12)\n\n4) Forms (Solid fields)\n- Background #FFF; Border 1.5px #DDDAD6; Radius 8px; Inset shadow\n- Focus ring: 0 0 0 3px rgba(192,69,44,.2) with border #C0452C\n\n5) Buttons\n- Primary: #C0452C; Hover #A53A24; Focus ring as forms; text white 600\n\n6) Borders & Emphasis\n- Prefer elevation/color; use borders sparingly functionally\n\n7) Motion\n- Gentle <300ms; respect reduced-motion\n\n8) Dark Mode\n- Background #1A1A1A; Text #EDEDED; Surfaces #252525/#2D2D2D; Accent #D55A41\n- Inputs: bg #252525; border 1.5px #444; focus 0 0 0 3px rgba(213,90,65,.4)`

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const user_id: string | undefined = body?.user_id
    const website_id: string | undefined = body?.website_id
    if (!user_id || !website_id) {
      return NextResponse.json({ error: 'Missing user_id or website_id' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // Load onboarding for this website
    const { data: ob, error: obErr } = await supabase
      .from('onboarding')
      .select('*')
      .eq('website_id', website_id)
      .maybeSingle()
    if (obErr) return NextResponse.json({ error: obErr.message }, { status: 500 })

    const data: any = ob?.data || {}
    const siteType = (data?.siteType as string | undefined) || ''
    const industry = resolveIndustry(siteType)

    // Compose minimal answers object from onboarding for first run
    const a: any = {}
    const businessName = (data?.name as string | undefined) || 'New Site'
    a.brand = { name: businessName, tagline: data?.tagline || undefined }
    a.businessName = businessName
    a.audience = data?.primaryGoal || data?.typeSpecific?.icp || ''
    a.tone = Array.isArray(data?.voiceTone) && data.voiceTone.length ? data.voiceTone.join(', ') : 'clear, modern'
    if (Array.isArray(data?.envisionedPages) && data.envisionedPages.length) a.pages = data.envisionedPages
    if (Array.isArray(data?.selectedServices) && data.selectedServices.length) a.services = data.selectedServices
    if (data?.contactMethod) a.contactMethod = data.contactMethod

    // Call existing generate orchestrator with deploy=false and instructions override
    const { origin } = new URL(req.url)
    const res = await fetch(`${origin}/api/onboarding/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        website_id,
        industry,
        answers: a,
        theme: undefined,
        deploy: false,
        instructions: THEME_INSTRUCTIONS,
      })
    })

    const json = await res.json().catch(() => ({} as any))
    if (!res.ok) {
      return NextResponse.json({ error: json?.error || 'Failed to start build' }, { status: res.status })
    }

    const projectId = json?.project?.id || null
    const chatId = json?.chat?.id || null
    const versionId = json?.chat?.latestVersionId || json?.version?.id || null

    return NextResponse.json({ ok: true, projectId, chatId, versionId, website_id }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
