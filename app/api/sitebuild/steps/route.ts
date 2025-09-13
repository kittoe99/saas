import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

// GET /api/sitebuild/steps?website_id=...&user_id=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id') || ''
  const website_id = searchParams.get('website_id') || ''
  if (!user_id || !website_id) return NextResponse.json({ error: 'Missing user_id or website_id' }, { status: 400 })
  const supabase = getSupabaseServer()

  // Try dedicated table first
  const { data, error } = await supabase
    .from('site_build_progress')
    .select('steps')
    .eq('user_id', user_id)
    .eq('website_id', website_id)
    .maybeSingle()

  if (!error && data?.steps) return NextResponse.json({ steps: data.steps }, { status: 200 })

  // Fallback: check websites.builder_steps if present
  const { data: wrow } = await supabase
    .from('websites' as any)
    .select('builder_steps')
    .eq('id', website_id)
    .eq('user_id', user_id)
    .maybeSingle()
  if (wrow?.builder_steps) return NextResponse.json({ steps: wrow.builder_steps }, { status: 200 })

  return NextResponse.json({ steps: null }, { status: 200 })
}

// POST /api/sitebuild/steps  { user_id, website_id, steps }
// steps example: { hero: 'done', services: 'done', areas: 'pending', global: 'pending', deploy: 'pending' }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const user_id: string | undefined = body?.user_id
    const website_id: string | undefined = body?.website_id
    const steps: any = body?.steps || null
    if (!user_id || !website_id || !steps) return NextResponse.json({ error: 'Missing user_id, website_id, or steps' }, { status: 400 })
    const supabase = getSupabaseServer()

    // Try dedicated table
    const { data, error } = await supabase
      .from('site_build_progress')
      .upsert({ user_id, website_id, steps }, { onConflict: 'user_id,website_id' })
      .select('steps')
      .maybeSingle()
    if (!error) return NextResponse.json({ ok: true, steps: data?.steps || steps }, { status: 200 })

    // Fallback: websites.builder_steps JSON column if present
    const { error: werr } = await supabase
      .from('websites' as any)
      .update({ builder_steps: steps })
      .eq('id', website_id)
      .eq('user_id', user_id)
    if (!werr) return NextResponse.json({ ok: true, steps }, { status: 200 })

    return NextResponse.json({ error: 'Failed to persist steps in site_build_progress and websites.builder_steps' }, { status: 500 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
